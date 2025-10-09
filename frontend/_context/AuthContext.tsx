import { supabase } from '@/constants/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean; // Important: indicates if we're still checking for existing session
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Start as true while we check AsyncStorage

    useEffect(() => {
        // Step 1: Check AsyncStorage for existing session on app startup
        // This is the key to keeping users logged in!
        const initializeAuth = async () => {
            try {
                // getSession() automatically checks AsyncStorage for a stored session
                // and validates that the tokens are still valid
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    // User has a valid session stored - they're logged in!
                    setSession(session);
                    setUser(session.user);
                } else {
                    // No session found or session expired - user needs to log in
                    setSession(null);
                    setUser(null);
                }
            } catch (error) {
                console.error('Error loading session:', error);
                setSession(null);
                setUser(null);
            } finally {
                // Done checking - stop showing loading screen
                setLoading(false);
            }
        };

        initializeAuth();

        // Step 2: Listen for auth state changes (login, logout, token refresh)
        // This listener updates your state whenever auth status changes
        // Supabase automatically saves/removes session from AsyncStorage
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                // When user logs in or session refreshes, update state
                if (newSession) {
                    setSession(newSession);
                    setUser(newSession.user);
                } else {
                    // When user logs out or session expires, clear state
                    setSession(null);
                    setUser(null);
                }

                // Make sure we're not in loading state after auth changes
                setLoading(false);
            }
        );

        // Cleanup listener on unmount
        return () => subscription.unsubscribe();
    }, []);

    // Logout function - Supabase handles clearing AsyncStorage automatically
    const logout = async () => {
        try {
            await supabase.auth.signOut();
            // State will be cleared automatically by onAuthStateChange listener
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access auth context
export const useAuth = () => useContext(AuthContext);

/* 
HOW TO CHECK IF USER IS LOGGED IN:

1. In your components, use the useAuth hook:
   
   const { session, user, loading } = useAuth();
   
   - If loading is true: Show a loading screen (still checking AsyncStorage)
   - If session exists: User is logged in
   - If session is null: User is NOT logged in

2. Example in your root navigation:

   function RootNavigator() {
     const { session, loading } = useAuth();
     
     if (loading) {
       return <LoadingScreen />; // Still checking AsyncStorage
     }
     
     return session ? <AuthenticatedApp /> : <LoginScreen />;
   }

3. Example in any component:

   function ProfileScreen() {
     const { user, session, loading } = useAuth();
     
     if (loading) return <ActivityIndicator />;
     
     if (!session) {
       // Redirect to login or show "not logged in" message
       return <Text>Please log in</Text>;
     }
     
     return <Text>Welcome {user?.email}</Text>;
   }

4. When user logs in (from your login screen):

   const { email, password } = form;
   const { error } = await supabase.auth.signInWithPassword({ email, password });
   
   if (!error) {
     // Session automatically stored in AsyncStorage by Supabase
     // onAuthStateChange will trigger and update context
     // User will be redirected to authenticated screens
   }

IMPORTANT NOTES:
- AsyncStorage is automatically handled by Supabase - you don't need to manually save/load
- The loading state prevents flickering (showing login screen then immediately authenticated screen)
- Always check 'loading' before checking 'session' to avoid showing wrong screens
- Session automatically refreshes before expiring (autoRefreshToken: true in your config)
*/