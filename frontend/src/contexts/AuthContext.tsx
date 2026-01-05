import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    profilePicture?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            login(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (newToken: string) => {
        setLoading(true);
        try {
            // Store token
            localStorage.setItem('auth_token', newToken);
            setToken(newToken);

            // Fetch user info
            const response = await fetch('http://localhost:8080/api/auth/user', {
                headers: {
                    'Authorization': `Bearer ${newToken}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Invalid token
                logout();
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        setLoading(false);
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
