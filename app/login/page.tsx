"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === "signin" ? "Sign in" : "Create account"), [mode]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error || "Unable to create the account.");
        setLoading(false);
        return;
      }

      if (result.session) {
        setLoading(false);
        router.replace("/");
        router.refresh();
        return;
      }

      setMessage(result.message || "Account created. Check your email to confirm your account, then return here to sign in.");
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const serverError = typeof result.error === "string" ? result.error : "Unable to sign in.";
        if (response.status === 401) {
          const normalized = serverError.toLowerCase();
          if (normalized.includes("email not confirmed")) {
            setError("Your BuildPro account exists, but the email has not been confirmed. Open the Supabase confirmation email, confirm the address, then sign in again.");
          } else if (normalized.includes("invalid login credentials") || normalized.includes("invalid credentials")) {
            setError("Supabase rejected the email/password. Check that the account exists in Supabase Authentication → Users and that the password is correct.");
          } else if (normalized === "failed to fetch") {
            setError("The BuildPro server reached the authentication route, but Supabase rejected the sign-in. Check Authentication → Users in Supabase and confirm the account/email before trying again.");
          } else {
            setError(`Sign-in rejected by Supabase: ${serverError}`);
          }
        } else {
          setError(serverError);
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reach the BuildPro server.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#050b14] px-4 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl border border-[#17283a] bg-[#091320] p-7 shadow-2xl"
      >
        <div className="mb-7">
          <div className="text-xs font-bold tracking-[.2em] text-[#7f92a8]">BUILDPRO</div>
          <h1 className="mt-2 text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-xs text-[#8191a6]">
            {mode === "signin"
              ? "Sign in with your Supabase Auth email and password."
              : "Create your BuildPro Supabase Auth account."}
          </p>
        </div>

        <label className="block text-xs font-semibold">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded border border-[#26394d] bg-[#050b14] px-3 py-2.5 outline-none focus:border-[#3188e8]"
            autoComplete="email"
            required
          />
        </label>

        <label className="mt-4 block text-xs font-semibold">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded border border-[#26394d] bg-[#050b14] px-3 py-2.5 outline-none focus:border-[#3188e8]"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            minLength={6}
            required
          />
        </label>

        {mode === "signup" && (
          <label className="mt-4 block text-xs font-semibold">
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 w-full rounded border border-[#26394d] bg-[#050b14] px-3 py-2.5 outline-none focus:border-[#3188e8]"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
        )}

        {error && (
          <div className="mt-4 rounded border border-[#5b2626] bg-[#241214] p-3 text-xs text-[#ff7777]">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded border border-[#245334] bg-[#102218] p-3 text-xs text-[#86e29e]">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded bg-[#1769e0] px-4 py-3 text-xs font-bold disabled:opacity-50"
        >
          {loading ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <div className="mt-5 text-center text-xs text-[#8191a6]">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-[#62a7ff] hover:text-white"
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </div>

        <a href="/" className="mt-4 block text-center text-[10px] text-[#8191a6] hover:text-white">
          Continue to dashboard
        </a>
      </form>
    </main>
  );
}
