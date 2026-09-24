// Small, dependency-free cookie helpers.
//
// Why a cookie and not localStorage? Route protection happens in
// middleware.js, which runs on the server/edge BEFORE any React code
// loads — it cannot read localStorage. A cookie is readable in both
// places (client JS here, and middleware on the server), so it's the
// only option that lets us redirect unauthenticated users before the
// protected page even starts rendering.

const TOKEN_KEY = "pad_token";
const USER_KEY = "pad_user";

export function setToken(token) {
  if (typeof document === "undefined") return;
  // 1 day expiry, path=/ so it's sent on every route.
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(
    token
  )}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
}

export function getToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearToken() {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${USER_KEY}=; path=/; max-age=0`;
}

export function setStoredUser(user) {
  if (typeof document === "undefined") return;
  document.cookie = `${USER_KEY}=${encodeURIComponent(
    JSON.stringify(user)
  )}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
}

export function getStoredUser() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${USER_KEY}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}
