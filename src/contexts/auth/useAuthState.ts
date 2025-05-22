
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event);
        
        if (currentSession) {
          console.log("User ID from session:", currentSession.user?.id || "No user ID");
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Handle specific auth events but don't automatically redirect
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Don't automatically navigate/redirect
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user state but don't redirect
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
          
          // Don't automatically redirect
        } else {
          // Don't automatically redirect if no session
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
  }, [navigate]);

  return { user, session, loading };
};
