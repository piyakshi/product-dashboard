"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-ink-700 bg-ink-900/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/products" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent shadow-glow" />
          <span className="font-mono text-sm tracking-wide text-mist-100">
            product<span className="text-accent">/</span>admin
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-mist-400 hidden sm:inline">
              {user.username}
            </span>
          )}
          <button onClick={logout} className="btn-secondary !py-1.5 !px-3 text-xs">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
