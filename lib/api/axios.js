import axios from "axios";
import { getToken, clearToken } from "@/lib/auth-cookies";

// This is the ONE shared Axios instance for the whole app.
// Every API call file (auth.js, products.js) imports THIS instead of
// calling axios directly. That's what the assignment means by
// "one shared Axios setup file" — token attachment and error handling
// live here, once, instead of being repeated in every fetch call.
const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 15000,
});

// --- Request interceptor: attach the token to every outgoing request ---
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: centralized error handling ---
// Instead of every component writing its own try/catch message logic,
// we normalize errors here into a consistent shape: { message, status }.
// Components just read `error.message`.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    let message = "Something went wrong. Please try again.";

    if (!error.response) {
      // Network error / no response at all (server down, no internet)
      message = "Network error — please check your connection and retry.";
    } else if (status === 401) {
      // Token missing/expired/invalid — clear it so the app doesn't
      // keep sending a dead token, and let the UI redirect to /login.
      message = "Your session has expired. Please log in again.";
      clearToken();
    } else if (status === 404) {
      message = "Not found.";
    } else if (status >= 500) {
      message = "Server error — please try again shortly.";
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    // We attach a normalized message onto the error and re-throw, so
    // calling code can just do: catch (err) { setError(err.message) }
    error.message = message;
    error.status = status;
    return Promise.reject(error);
  }
);

export default api;
