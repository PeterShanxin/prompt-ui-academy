"use client";

import type { User } from "@supabase/supabase-js";
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
import { getBrowserSupabaseClient } from "../lib/supabase/client";

export type AuthStatus = "disabled" | "loading" | "signed_out" | "signed_in";
export type AuthIssue = "failed" | "unavailable" | null;

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  modalOpen: boolean;
  authIssue: AuthIssue;
  openAuth: () => void;
  closeAuth: () => void;
  signInWithGoogle: () => Promise<void>;
  sendEmailCode: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, token: string) => Promise<void>;
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
  const client = useMemo(() => getBrowserSupabaseClient(), []);
  const [status, setStatus] = useState<AuthStatus>(
    client ? "loading" : "disabled",
  );
  const [user, setUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [authIssue, setAuthIssue] = useState<AuthIssue>(null);

  useEffect(() => {
    if (!client) return;
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

    void client.auth.getUser()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.user);
        setStatus(data.user ? "signed_in" : "signed_out");
      })
      .catch(() => {
        if (active) setStatus("signed_out");
      });

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setStatus(session?.user ? "signed_in" : "signed_out");
      if (session?.user) setModalOpen(false);
    });

    return () => {
      active = false;
      if (issueTimer !== undefined) window.clearTimeout(issueTimer);
      data.subscription.unsubscribe();
    };
  }, [client]);

  const signInWithGoogle = useCallback(async () => {
    if (!client) throw new Error("Cloud progress is unavailable.");
    const returnTo = safeReturnPath(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  }, [client]);

  const sendEmailCode = useCallback(
    async (email: string) => {
      if (!client) throw new Error("Cloud progress is unavailable.");
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
    },
    [client],
  );

  const verifyEmailCode = useCallback(
    async (email: string, token: string) => {
      if (!client) throw new Error("Cloud progress is unavailable.");
      const { error } = await client.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (error) throw error;
    },
    [client],
  );

  const signOut = useCallback(async () => {
    if (!client) return;
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw error;
    setUser(null);
    setStatus("signed_out");
  }, [client]);

  const deleteAccount = useCallback(async () => {
    if (!client) throw new Error("Cloud progress is unavailable.");
    const { data } = await client.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error("Authentication required.");

    const response = await fetch("/api/account/delete", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Account deletion failed.");

    await client.auth.signOut({ scope: "local" });
    setUser(null);
    setStatus("signed_out");
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      modalOpen,
      authIssue,
      openAuth: () => {
        setAuthIssue(null);
        setModalOpen(true);
      },
      closeAuth: () => {
        setAuthIssue(null);
        setModalOpen(false);
      },
      signInWithGoogle,
      sendEmailCode,
      verifyEmailCode,
      signOut,
      deleteAccount,
    }),
    [
      deleteAccount,
      authIssue,
      modalOpen,
      sendEmailCode,
      signInWithGoogle,
      signOut,
      status,
      user,
      verifyEmailCode,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
