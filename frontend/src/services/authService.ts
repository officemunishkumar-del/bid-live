/**
 * Authentication Service
 * Handles user login, registration, and session management.
 * Connected to the NestJS backend API.
 */

import { apiRequest, setToken, removeToken, getToken } from "./api";
import { BackendAuthResponse, BackendUser, BackendAuction } from "@/types/backendModels";

export interface User {
    id: string;
    email: string;
    name: string;
    balance: number;
    hold?: number;
    availableBalance?: number;
    createdAt: string;
    wonAuctions?: BackendAuction[];
    createdAuctions?: BackendAuction[];
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

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<BackendAuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    // Store token
    setToken(response.accessToken);

    return {
        user: mapBackendUser(response.user),
        token: response.accessToken,
    };
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<BackendAuthResponse>("/auth/register", {
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
            ...mapBackendUser(response.user),
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
        const profile = await apiRequest<BackendUser>("/users/me");
        return mapBackendUser(profile);
    } catch (error) {
        // Token invalid or expired
        removeToken();
        return null;
    }
};

/**
 * Map backend user to frontend User type
 */
const mapBackendUser = (profile: BackendUser): User => ({
    id: profile.id,
    email: profile.email,
    name: profile.name || profile.email.split("@")[0],
    balance: profile.balance,
    hold: profile.hold,
    availableBalance: profile.availableBalance,
    createdAt: profile.createdAt,
    wonAuctions: profile.wonAuctions,
    createdAuctions: profile.createdAuctions,
});
