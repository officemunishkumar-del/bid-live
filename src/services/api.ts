/**
 * API Service Layer
 * Base configuration for all API calls. Currently returns mock data.
 * Replace with actual backend endpoints when integrating.
 */

// API base URL - using proxy in vite.config.ts
export const API_BASE_URL = "/api";

// Token storage key
const TOKEN_KEY = "livebid_token";

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

// API request helper with auth headers
export const apiRequest = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getToken();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || "Request failed");
    }

    return response.json();
};

// Simulated network delay for mock responses
export const mockDelay = (ms: number = 500) =>
    new Promise(resolve => setTimeout(resolve, ms));
