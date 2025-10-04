// Use this file as a shortcut to verifying user sessions
// import { useAuth } from './AuthContext';

// const { user } = useAuth();
// "user" will return null if they are NOT logged in, 
// otherwise it contains the currently authenticated user’s info.
// so use this whenever you need to fetch/store user information (moments, friends, etc..)


import { supabase } from '@/constants/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native'

// make sure you register this only once!
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

type AuthContextType = {
    session: any | null;
    user: any | null;
    setSession: (session: any | null) => void;
    setUser: (user: any | null) => void;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    setSession: () => { },
    setUser: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<any | null>(null);
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session ?? null);
            setUser(data.session?.user ?? null);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession ?? null);
            setUser(newSession?.user ?? null);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, setSession, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

