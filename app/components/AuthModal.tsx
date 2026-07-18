"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "./AuthProvider";
import { useI18n } from "./I18n";

export function AuthModal() {
  const {
    modalOpen,
    authIssue,
    closeAuth,
    signInWithGoogle,
    sendEmailCode,
    verifyEmailCode,
  } = useAuth();
  const { pick } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [emailUserId, setEmailUserId] = useState("");
  const [token, setToken] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [resendDelay, setResendDelay] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modalOpen && !dialog.open) dialog.showModal();
    if (!modalOpen && dialog.open) dialog.close();
  }, [modalOpen]);

  useEffect(() => {
    if (resendDelay <= 0) return;
    const timer = window.setInterval(() => {
      setResendDelay((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendDelay]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch {
      setError(
        pick(
          "暂时无法登录。请检查信息后重试。",
          "Sign-in could not be completed. Check your details and try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (codeSent) {
      await run(() => verifyEmailCode(emailUserId, token.trim()));
      return;
    }
    await run(async () => {
      setEmailUserId(await sendEmailCode(email.trim()));
      setCodeSent(true);
      setResendDelay(30);
    });
  };

  const close = () => {
    setCodeSent(false);
    setEmailUserId("");
    setToken("");
    setResendDelay(0);
    setError("");
    closeAuth();
  };

  return (
    <dialog
      className="auth-dialog"
      ref={dialogRef}
      aria-labelledby="auth-title"
      aria-describedby="auth-description"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={close}
    >
      <button
        className="auth-close"
        type="button"
        onClick={close}
        aria-label={pick("关闭登录", "Close sign in")}
      >
        ×
      </button>
      <span className="auth-kicker">SAVE YOUR PROGRESS</span>
      <h2 id="auth-title">{pick("把进度带到每台设备", "Continue on any device")}</h2>
      <p id="auth-description">
        {pick(
          "课程无需登录。登录只用于安全同步你的学习进度。",
          "Learning never requires an account. Sign in only to sync your progress securely.",
        )}
      </p>
      <button
        className="google-auth-button"
        type="button"
        disabled={busy}
        onClick={() => void run(signInWithGoogle)}
      >
        <span aria-hidden="true">G</span>
        {pick("使用 Google 继续", "Continue with Google")}
      </button>
      <div className="auth-divider"><span>{pick("或使用邮箱", "or use email")}</span></div>
      <form onSubmit={(event) => void submitEmail(event)}>
        <label>
          <span>{pick("邮箱地址", "Email address")}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            disabled={busy || codeSent}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
          />
        </label>
        {codeSent && (
          <label>
            <span>{pick("6 位验证码", "6-digit code")}</span>
            <input
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={token}
              onChange={(event) => setToken(event.target.value.replace(/\D/g, ""))}
            />
          </label>
        )}
        <button className="email-auth-button" type="submit" disabled={busy}>
          {busy
            ? pick("请稍候…", "Please wait…")
            : codeSent
              ? pick("验证并登录", "Verify and sign in")
              : pick("发送验证码", "Send a code")}
        </button>
      </form>
      {codeSent && (
        <div className="auth-code-actions">
          <button
            className="auth-reset-email"
            type="button"
            disabled={busy || resendDelay > 0}
            onClick={() => void run(async () => {
              setEmailUserId(await sendEmailCode(email.trim()));
              setResendDelay(30);
            })}
          >
            {resendDelay > 0
              ? pick(`${resendDelay} 秒后可重发`, `Resend in ${resendDelay}s`)
              : pick("重新发送验证码", "Resend code")}
          </button>
          <button
            className="auth-reset-email"
            type="button"
            disabled={busy}
            onClick={() => {
              setCodeSent(false);
              setEmailUserId("");
              setToken("");
              setResendDelay(0);
            }}
          >
            {pick("更换邮箱", "Use another email")}
          </button>
        </div>
      )}
      <p className="auth-error" aria-live="polite">
        {error || (authIssue === "unavailable"
          ? pick("云端登录尚未配置完成。请稍后重试。", "Cloud sign-in is not configured yet. Try again later.")
          : authIssue === "failed"
            ? pick("登录没有完成。请重试。", "Sign-in was not completed. Try again.")
            : "")}
      </p>
    </dialog>
  );
}
