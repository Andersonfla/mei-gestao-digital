import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Component to listen for custom toast events from the error boundary
 */
export function ToastListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { message, variant = 'default' } = event.detail;
      toast({
        variant,
        description: message,
      });
    };

    // Listen for custom toast events
    window.addEventListener('show-toast', handleShowToast as EventListener);
    
    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener);
    };
  }, [toast]);

  return null; // This component doesn't render anything
}