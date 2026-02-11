/**
 * API Service Layer
 * Base configuration for all API calls.
 * Includes request timeout, auth headers, JWT expiry check, and auto-logout on 401.
 */

// API base URL - using ngrok for remote connection
export const API_BASE_URL = "https://subvirile-anglea-unreprovable.ngrok-free.dev/api";

// Token storage key
const TOKEN_KEY = "livebid_token";

// Request timeout in milliseconds
const REQUEST_TIMEOUT_MS = 10_000;

// Get stored JWT token
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

// Set JWT token
export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

// Remove JWT token
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Decode JWT payload without a library.
 * Returns null if the token is malformed.
 */
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(payload);
    } catch {
        return null;
    }
};

/**
 * Check if a JWT token is expired.
 * Adds a 30-second buffer so we don't send requests with an about-to-expire token.
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") return false; // can't check, assume valid
    const expiresAt = payload.exp * 1000; // convert to ms
    return Date.now() >= expiresAt - 30_000; // 30s buffer
};

// API request helper with auth headers, timeout, expiry check, and auto-logout
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getToken();

    // Proactive expiry check — logout before making the request
    if (token && isTokenExpired(token)) {
        removeToken();
        window.dispatchEvent(new CustomEvent("auth:logout"));
        throw new Error("Your session has expired. Please log in again.");
    }

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            signal: controller.signal,
        });

        if (response.status === 401) {
            // Token expired or invalid — auto-logout
            removeToken();
            // Dispatch a custom event so AuthContext can react
            window.dispatchEvent(new CustomEvent("auth:logout"));
            throw new Error("Your session has expired. Please log in again.");
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Request failed" }));
            throw new Error(error.message || `Request failed (${response.status})`);
        }

        return response.json();
    } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
            throw new Error("Request timed out. Please check your connection and try again.");
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};
