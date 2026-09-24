"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    // Guard against "Clicking Login many times quickly must not send
    // many requests" — if a submit is already in flight, ignore this one.
    if (submitting) return;

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await login(username.trim(), password);
      const from = searchParams.get("from") || "/products";
      router.push(from);
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-accent shadow-glow" />
            <span className="font-mono text-xs tracking-widest text-mist-400 uppercase">
              Admin Console
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-mist-100">Sign in</h1>
          <p className="text-sm text-mist-400 mt-1">Manage your product catalog</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="label" htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="emilys"
              autoComplete="username"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-mist-400 text-center pt-1">
            Demo credentials: <span className="font-mono text-mist-200">emilys</span> /{" "}
            <span className="font-mono text-mist-200">emilyspass</span>
          </p>
        </form>
      </div>
    </div>
  );
}
