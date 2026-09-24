import api from "@/lib/api/axios";

// Wraps the /auth/login endpoint. Kept in its own file so components
// never call axios directly — "put API calls in separate files" rule.
export async function loginRequest(username, password) {
  const res = await api.post("/auth/login", {
    username,
    password,
    expiresInMins: 60,
  });
  return res.data; // { id, username, email, token, ... }
}
