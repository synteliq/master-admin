import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, UserRole } from '../types';
import { ApiService as MockService } from '../services/api';

interface AuthContextType extends AuthState {
    loginAdmin: (username: string, password: string) => Promise<void>;
    loginTenant: (tenantId: string, apiKey: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>({
        isAuthenticated: false,
        role: null,
        user: null,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Check for persisted session on load
    useEffect(() => {
        const storedAuth = localStorage.getItem('auth_session');
        if (storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                // Validate session integrity
                if (parsed.isAuthenticated && (!parsed.user || !parsed.user.id)) {
                    console.warn('Found corrupt session, clearing...');
                    localStorage.removeItem('auth_session');
                } else {
                    setAuth(parsed);
                }
            } catch (e) {
                localStorage.removeItem('auth_session');
            }
        }
        setIsLoading(false);
    }, []);

    const saveAuth = (newAuth: AuthState) => {
        setAuth(newAuth);
        localStorage.setItem('auth_session', JSON.stringify(newAuth));
    };

    const loginAdmin = async (u: string, p: string) => {
        // Hardcoded Admin Credentials for Mock
        await MockService.getTenants(); // Jiggle the wire
        if (u === 'admin' && p === 'admin123') {
            saveAuth({
                isAuthenticated: true,
                role: 'admin',
                user: { id: 'admin', name: 'Tenant Master' },
                token: 'mock_admin_token',
            });
        } else {
            throw new Error('Invalid Username or Password');
        }
    };

    const loginTenant = async (tenantId: string, apiKey: string) => {
        setIsLoading(true);
        try {
            // We still pass mock apiKey to satisfy signature, but backend ignores it
            const response = await MockService.verifyTenant(tenantId, apiKey) as any;
            // Backend returns { success, token, user: { id, name } }
            // API Service returns the raw JSON
            const userData = response.user || response; // Fallback if API changes

            saveAuth({
                isAuthenticated: true,
                role: 'tenant',
                user: { id: userData.id, name: userData.name },
                token: response.token || `mock_tenant_${userData.id}`,
            });
        } catch (err: any) {
            // Assuming error handling for login failure
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setAuth({
            isAuthenticated: false,
            role: null,
            user: null,
        });
        localStorage.removeItem('auth_session');
    };

    return (
        <AuthContext.Provider value={{ ...auth, loginAdmin, loginTenant, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
