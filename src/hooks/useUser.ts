import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// Helper function to get username from email
export function getUsername(email: string | undefined): string {
  if (!email) return 'User';
  return email.split('@')[0];
}

// Helper function to get display name (capitalized)
export function getDisplayName(email: string | undefined): string {
  if (!email) return 'User';
  const username = email.split('@')[0];
  return username.charAt(0).toUpperCase() + username.slice(1);
}