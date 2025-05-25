
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
          
          // Handle specific auth events
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // REMOVED automatic redirect to dashboard when signing in
            // Let the specific page components handle redirects as needed
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user state
          console.log("User signed out, clearing session and user data");
          setSession(null);
          setUser(null);
          
          // Only redirect to auth if on protected routes
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/app')) {
            navigate('/auth');
          }
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
          
          // REMOVED automatic redirect to dashboard when session exists
          // Let the specific page components handle redirects as needed
        } else {
          // REMOVED automatic redirect to auth when no session exists
          // Only redirect if on protected routes, which is handled by RequireAuth
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
