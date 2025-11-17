import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isUserAdmin } from "@/services/adminService";

export interface SupportNotification {
  conversation_id: string;
  user_email?: string;
  message_content: string;
  created_at: string;
}

export const useAdminSupportNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdmin = async () => {
      const adminStatus = await isUserAdmin();
      setIsAdmin(adminStatus);
    };
    
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    // Subscribe to new messages from users (not from admin)
    const channel = supabase
      .channel('admin-support-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: 'sent_by_admin=eq.false',
        },
        async (payload) => {
          console.log('Nova mensagem de suporte recebida:', payload);
          
          const newMessage = payload.new as any;
          
          // Get conversation and user details
          const { data: conversation, error } = await supabase
            .from('support_conversations')
            .select('*')
            .eq('id', newMessage.conversation_id)
            .single();

          if (conversation && !error) {
            // Get user profile separately
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, name, plan')
              .eq('id', conversation.user_id)
              .single();

            const userEmail = profile?.email || 'Usuário';
            const userName = profile?.name || userEmail;
            const userPlan = profile?.plan || 'free';
            
            // Show toast notification
            toast({
              title: "💬 Nova mensagem de suporte",
              description: `${userName} enviou uma mensagem`,
              duration: 5000,
            });

            // Play notification sound
            playNotificationSound();

            // Increment unread count
            setUnreadCount(prev => prev + 1);

            // Show browser notification if supported and permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nova mensagem de suporte', {
                body: `${userName} enviou: ${newMessage.content.substring(0, 100)}...`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-192x192.png',
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, toast]);

  // Request notification permission on mount
  useEffect(() => {
    if (!isAdmin) return;
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [isAdmin]);

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  return {
    unreadCount,
    clearUnreadCount,
    isAdmin,
  };
};

// Helper function to play notification sound
const playNotificationSound = () => {
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
};
