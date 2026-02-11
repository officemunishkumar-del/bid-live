import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, login as authLogin, register as authRegister, logout as authLogout, getCurrentUser } from "@/services/authService";
import { getToken, isTokenExpired } from "@/services/api";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = getToken();
            if (token && !isTokenExpired(token)) {
                try {
                    const currentUser = await getCurrentUser();
                    setUser(currentUser);
                } catch {
                    // Token invalid, clear it
                    authLogout();
                }
            } else if (token) {
                // Token exists but expired — clean up
                authLogout();
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    // Listen for forced logout from API layer (401 responses)
    useEffect(() => {
        const handleForceLogout = () => {
            setUser(null);
        };
        window.addEventListener("auth:logout", handleForceLogout);
        return () => window.removeEventListener("auth:logout", handleForceLogout);
    }, []);

    // Multi-tab sync: listen for localStorage changes from other tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "livebid_token") {
                if (!e.newValue) {
                    // Token removed in another tab → logout here too
                    setUser(null);
                } else if (e.newValue && !user) {
                    // Token set in another tab → refresh user
                    getCurrentUser().then(setUser).catch(() => setUser(null));
                }
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [user]);

    const login = async (email: string, password: string) => {
        const response = await authLogin({ email, password });
        setUser(response.user);
    };

    const register = async (email: string, password: string, name: string) => {
        const response = await authRegister({ email, password, name });
        setUser(response.user);
    };

    const logout = () => {
        authLogout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
