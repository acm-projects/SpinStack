import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/constants/supabase";
import type { User } from "@supabase/supabase-js";

export type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  signOut: async () => {},
  isLoading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // swallow errors; caller can check auth state or implement better handling
      console.error("Error signing out:", e);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      // listener may be undefined in some envs
      try {
        listener.subscription.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
