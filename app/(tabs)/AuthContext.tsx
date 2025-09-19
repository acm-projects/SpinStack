// Use this file as a shortcut to verifying user sessions
// import { useAuth } from './AuthContext';

// const { user } = useAuth();
// "user" will return null if they are NOT logged in, 
// otherwise it contains the currently authenticated user’s info.
// so use this whenever you need to fetch/store user information (moments, friends, etc..)


import { supabase } from '@/constants/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    user: any | null;
    setUser: (user: any | null) => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        // Get current session on mount
        const session = supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
        });

        // Listen for auth changes (sign-in/sign-out)
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
