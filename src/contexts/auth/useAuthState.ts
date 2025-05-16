
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
            // If on auth page, navigate to dashboard
            if (window.location.pathname === '/auth') {
              navigate('/');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // Clear user state and redirect to auth page
          console.log("User signed out, clearing session and user data");
          setSession(null);
          setUser(null);
          navigate('/auth');
        }
      }
    );

    // Check for existing session after setting up listener
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
          
          // If user is logged in and on auth page, redirect to dashboard
          if (window.location.pathname === '/auth') {
            navigate('/');
          }
        } else {
          // If no session and not on auth page, redirect to auth
          if (window.location.pathname !== '/auth') {
            navigate('/auth');
          }
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
