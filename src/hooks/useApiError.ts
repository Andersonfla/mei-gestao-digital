import { useCallback } from "react";
import { withErrorHandling, handleApiError } from "@/lib/errorHandling";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para tratamento consistente de erros de API
 */
export function useApiError() {
  const { toast } = useToast();

  const handleError = useCallback((error: any, context: string = 'API') => {
    handleApiError(error, context);
  }, []);

  const withError = useCallback(<T>(
    operation: () => Promise<T>,
    context: string = 'Operação',
    options?: { 
      showToast?: boolean; 
      rethrow?: boolean;
      customMessage?: string;
    }
  ) => {
    return withErrorHandling(operation, context, options);
  }, []);

  const showRetryableError = useCallback((
    message: string,
    retryFn: () => void,
    context: string = 'Operação'
  ) => {
    toast({
      variant: "destructive",
      title: "Erro",
      description: message,
    });
    
    // Note: For now showing simple toast. Could be enhanced with action buttons if needed
    console.log(`${context} failed. Retry function available:`, retryFn);
  }, [toast]);

  return {
    handleError,
    withError,
    showRetryableError
  };
}