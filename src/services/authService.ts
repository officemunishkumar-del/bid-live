/**
 * Authentication Service
 * Handles user login, registration, and session management.
 * Currently uses mock data - replace with actual API calls when integrating.
 */

import { setToken, removeToken, mockDelay } from "./api";

export interface User {
    id: string;
    email: string;
    name: string;
    balance: number;
    createdAt: string;
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
    token: string;
}

// Mock user for demo
const mockUser: User = {
    id: "user-1",
    email: "demo@livebid.com",
    name: "Demo User",
    balance: 15750.00,
    createdAt: "2024-01-15",
};

// Mock JWT token
const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6ImRlbW9AbGl2ZWJpZC5jb20ifQ.mock";

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await mockDelay(1000);

    // Mock validation
    if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required");
    }

    // Mock: Accept any non-empty credentials
    if (credentials.password.length < 6) {
        throw new Error("Invalid email or password");
    }

    // Store token
    setToken(mockToken);

    return {
        user: { ...mockUser, email: credentials.email },
        token: mockToken,
    };
};

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    await mockDelay(1000);

    // Mock validation
    if (!data.email || !data.password || !data.name) {
        throw new Error("All fields are required");
    }

    if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    // Store token
    setToken(mockToken);

    return {
        user: {
            ...mockUser,
            email: data.email,
            name: data.name,
        },
        token: mockToken,
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
    await mockDelay(300);

    // In real app, would verify token and fetch user:
    // return apiRequest<User>("/users/me");

    return mockUser;
};

/**
 * Update user balance (mock)
 */
export const updateBalance = async (amount: number): Promise<User> => {
    await mockDelay(500);

    return {
        ...mockUser,
        balance: mockUser.balance + amount,
    };
};
