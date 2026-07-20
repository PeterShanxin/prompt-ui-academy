"use client";

import { ID, OAuthProvider, type Models } from "appwrite";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { safeReturnPath } from "../lib/auth-return";
import { getBrowserAppwriteAccount } from "../lib/appwrite/client";

export type AuthStatus = "disabled" | "loading" | "signed_out" | "signed_in";
export type AuthIssue = "failed" | "unavailable" | null;
export type AuthUser = { id: string; email: string; name: string };

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  modalOpen: boolean;
  authIssue: AuthIssue;
  openAuth: () => void;
  closeAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  sendEmailCode: (email: string) => Promise<string>;
  verifyEmailCode: (userId: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const account = useMemo(() => getBrowserAppwriteAccount(), []);
  const [status, setStatus] = useState<AuthStatus>(account ? "loading" : "disabled");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [authIssue, setAuthIssue] = useState<AuthIssue>(null);

  const acceptUser = useCallback((value: Models.User<Models.Preferences>) => {
    setUser({ id: value.$id, email: value.email, name: value.name });
    setStatus("signed_in");
    setModalOpen(false);
  }, []);

  useEffect(() => {
    if (!account) return;
    let active = true;
    const currentUrl = new URL(window.location.href);
    const authResult = currentUrl.searchParams.get("auth");
    let issueTimer: number | undefined;
    if (authResult === "failed" || authResult === "unavailable") {
      issueTimer = window.setTimeout(() => {
        setAuthIssue(authResult);
        setModalOpen(true);
      }, 0);
    }
    if (authResult) {
      currentUrl.searchParams.delete("auth");
      window.history.replaceState(null, "", currentUrl);
    }

    void account.get()
      .then((value) => { if (active) acceptUser(value); })
      .catch(() => { if (active) setStatus("signed_out"); });

    return () => {
      active = false;
      if (issueTimer !== undefined) window.clearTimeout(issueTimer);
    };
  }, [acceptUser, account]);

  const signInWithGoogle = useCallback(async () => {
    if (!account) throw new Error("Cloud progress is unavailable.");
    const returnTo = safeReturnPath(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
    const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`;
    account.createOAuth2Session({
      provider: OAuthProvider.Google,
      success: `${callback}&status=success`,
      failure: `${callback}&status=failed`,
    });
  }, [account]);

  const sendEmailCode = useCallback(async (email: string) => {
    if (!account) throw new Error("Cloud progress is unavailable.");
    const token = await account.createEmailToken({ userId: ID.unique(), email });
    return token.userId;
  }, [account]);

  const verifyEmailCode = useCallback(async (userId: string, token: string) => {
    if (!account) throw new Error("Cloud progress is unavailable.");
    await account.createSession({ userId, secret: token });
    acceptUser(await account.get());
  }, [acceptUser, account]);

  const signOut = useCallback(async () => {
    if (!account) return;
    await account.deleteSession({ sessionId: "current" });
    setUser(null);
    setStatus("signed_out");
  }, [account]);

  const deleteAccount = useCallback(async () => {
    if (!account) throw new Error("Cloud progress is unavailable.");
    const { jwt } = await account.createJWT();
    const response = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!response.ok) throw new Error("Account deletion failed.");
    setUser(null);
    setStatus("signed_out");
  }, [account]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    modalOpen,
    authIssue,
    openAuth: () => { setAuthIssue(null); setModalOpen(true); },
    closeAuth: () => { setAuthIssue(null); setModalOpen(false); },
    signInWithGoogle,
    sendEmailCode,
    verifyEmailCode,
    signOut,
    deleteAccount,
  }), [
    authIssue,
    deleteAccount,
    modalOpen,
    sendEmailCode,
    signInWithGoogle,
    signOut,
    status,
    user,
    verifyEmailCode,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
