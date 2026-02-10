/**
 * Authentication Service
 * Handles user login, registration, and session management.
 * Connected to the NestJS backend API.
 */

import { apiRequest, setToken, removeToken, getToken } from "./api";

export interface User {
    id: string;
    email: string;
    name: string;
    balance: number;
    hold?: number;
    availableBalance?: number;
    createdAt: string;
    wonAuctions?: any[];
    createdAuctions?: any[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    // Store token
    setToken(response.accessToken);

    return {
        user: {
            ...response.user,
            name: response.user.email.split("@")[0],
        },
        token: response.accessToken,
    };
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: data.name,
        }),
    });

    // Store token
    setToken(response.accessToken);

    return {
        user: {
            ...response.user,
            name: data.name || response.user.email.split("@")[0],
        },
        token: response.accessToken,
    };
};

/**
 * Logout current user
 */
export const logout = (): void => {
    removeToken();
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User | null> => {
    const token = getToken();
    if (!token) return null;

    try {
        const profile = await apiRequest<{
            id: string;
            email: string;
            name: string;
            balance: number;
            hold: number;
            availableBalance: number;
            createdAt: string;
            wonAuctions: any[];
            createdAuctions: any[];
        }>("/users/me");

        return {
            id: profile.id,
            email: profile.email,
            name: profile.name || profile.email.split("@")[0],
            balance: profile.balance,
            hold: profile.hold,
            availableBalance: profile.availableBalance,
            createdAt: profile.createdAt,
            wonAuctions: profile.wonAuctions,
            createdAuctions: profile.createdAuctions,
        };
    } catch (error) {
        // Token invalid or expired
        removeToken();
        return null;
    }
};

/**
 * Update user balance (mock - for UI purposes)
 * In real app, this should fetch current balance from backend
 */
export const updateBalance = async (amount: number): Promise<User> => {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    return {
        ...user,
        balance: user.balance + amount,
    };
};
