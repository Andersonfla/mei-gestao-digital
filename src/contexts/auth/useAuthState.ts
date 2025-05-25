
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event);
        
        if (currentSession) {
          console.log("User ID from session:", currentSession.user?.id || "No user ID");
          setSession(currentSession);
          setUser(currentSession.user);
        } else if (event === 'SIGNED_OUT') {
          // Clear user state
          console.log("User signed out, clearing session and user data");
          setSession(null);
          setUser(null);
        }
      }
    );

    // Check for existing session immediately (before setting up listener)
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setLoading(false);
          return;
        }
        
        console.log("Initial session check:", currentSession ? "Session exists" : "No session");
        
        if (currentSession) {
          console.log("User ID from initial session:", currentSession.user?.id || "No user ID");
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      // Clean up subscription when component unmounts
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
};
