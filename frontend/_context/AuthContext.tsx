import { supabase } from '@/constants/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { clearSpotifyTokens } from '../app/utils/spotifyAuth';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    checkingProfile: boolean;
    logout: () => Promise<void>;
    signingUp: boolean;
    setSigningUp: React.Dispatch<React.SetStateAction<boolean>>;
    pfpUrl: string | null;
    setPfpUrl: React.Dispatch<React.SetStateAction<string | null>>;
    profileComplete: boolean;
    setProfileComplete: React.Dispatch<React.SetStateAction<boolean>>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    checkingProfile: true,
    logout: async () => { },
    signingUp: true,
    setSigningUp: () => { },
    pfpUrl: null,
    setPfpUrl: () => { },
    profileComplete: false,
    setProfileComplete: () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [signingUp, setSigningUp] = useState(true);
    const [pfpUrl, setPfpUrl] = useState<string | null>(null);
    const [profileComplete, setProfileComplete] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setSession(session);
                    setUser(session.user);
                    setSigningUp(false);
                } else {
                    setSession(null);
                    setUser(null);
                }
            } catch (error) {
                console.error('Error loading session:', error);
                setSession(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                if (newSession) {
                    setSigningUp(false);
                    setSession(newSession);
                    setUser(newSession.user);
                } else {
                    setSession(null);
                    setUser(null);
                    setPfpUrl(null);
                    setProfileComplete(false);
                    setSigningUp(true);
                }

                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const checkProfileComplete = async () => {
            if (!user?.id) {
                setProfileComplete(false);
                setPfpUrl(null);
                setCheckingProfile(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('username, bio, first_name, last_name, pfp_url')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!error && data) {
                    const isComplete =
                        !!data.username &&
                        !!data.bio &&
                        !!data.first_name &&
                        !!data.last_name &&
                        !!data.pfp_url;

                    setProfileComplete(isComplete);
                    setPfpUrl(data.pfp_url ?? null);
                } else {
                    setProfileComplete(false);
                    setPfpUrl(null);
                }
            } catch (err) {
                console.error('Error checking profile completion:', err);
                setProfileComplete(false);
                setPfpUrl(null);
            } finally {
                setCheckingProfile(false);
            }
        };

        checkProfileComplete();
    }, [user?.id]);

    // Logout function - Clear Spotify tokens and Supabase session
    const logout = async () => {
        try {
            // Clear Spotify tokens first
            await clearSpotifyTokens();
            console.log('✅ Cleared Spotify tokens on logout');
            
            // Then sign out from Supabase
            await supabase.auth.signOut();
            
            setSigningUp(true);
            setPfpUrl(null);
            setProfileComplete(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            session, 
            user, 
            loading, 
            logout, 
            signingUp, 
            setSigningUp, 
            pfpUrl, 
            setPfpUrl, 
            profileComplete, 
            setProfileComplete, 
            checkingProfile 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);