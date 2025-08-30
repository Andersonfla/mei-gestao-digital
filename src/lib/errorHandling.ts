import { toast } from "@/hooks/use-toast";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Manipula erros de API de forma consistente
 */
export function handleApiError(error: any, context: string = 'API'): void {
  let message = 'Ocorreu um erro inesperado';
  let status: number | undefined;

  if (error?.response) {
    // Erro de resposta HTTP
    status = error.response.status;
    message = error.response.data?.message || `Erro ${status}`;
    
    // Mensagens específicas por código HTTP
    switch (status) {
      case 400:
        message = 'Dados inválidos. Verifique as informações e tente novamente.';
        break;
      case 401:
        message = 'Sessão expirada. Faça login novamente.';
        break;
      case 403:
        message = 'Você não tem permissão para realizar esta ação.';
        break;
      case 404:
        message = 'Recurso não encontrado.';
        break;
      case 429:
        message = 'Muitas tentativas. Aguarde um momento e tente novamente.';
        break;
      case 500:
        message = 'Erro interno do servidor. Tente novamente em instantes.';
        break;
    }
  } else if (error?.message) {
    message = error.message;
  }

  // Mostrar toast com erro
  toast({
    variant: "destructive",
    title: "Erro",
    description: `${message}${status ? ` (${status})` : ''}`,
  });

  // Log em desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.error(`🚨 ${context} Error:`, {
      message,
      status,
      originalError: error,
      route: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Wrapper para operações assíncronas com tratamento de erro
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string = 'Operação',
  options: { 
    showToast?: boolean; 
    rethrow?: boolean;
    customMessage?: string;
  } = {}
): Promise<T | null> {
  const { showToast = true, rethrow = false, customMessage } = options;
  
  try {
    return await operation();
  } catch (error) {
    if (showToast) {
      if (customMessage) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: customMessage,
        });
      } else {
        handleApiError(error, context);
      }
    }
    
    if (rethrow) {
      throw error;
    }
    
    return null;
  }
}

/**
 * Banner de debug para desenvolvimento
 */
export function addDebugBanner(): void {
  if (process.env.NODE_ENV !== 'production') {
    const banner = document.createElement('div');
    banner.id = 'debug-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff6b6b;
      color: white;
      padding: 4px 8px;
      font-size: 12px;
      font-family: monospace;
      z-index: 9999;
      text-align: center;
    `;
    banner.textContent = `🐛 DEV MODE | Rota: ${window.location.pathname}`;
    
    document.body.appendChild(banner);
    
    // Atualizar rota no banner quando mudar
    const updateRoute = () => {
      const existingBanner = document.getElementById('debug-banner');
      if (existingBanner) {
        existingBanner.textContent = `🐛 DEV MODE | Rota: ${window.location.pathname}`;
      }
    };
    
    // Observer para mudanças de rota
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        updateRoute();
      }
    }).observe(document, { subtree: true, childList: true });
  }
}

/**
 * Client-side error logging para produção
 */
export async function logClientError(errorData: {
  message: string;
  stack?: string;
  route: string;
  userId?: string;
  timestamp: string;
  [key: string]: any;
}): Promise<void> {
  try {
    // Remover dados sensíveis
    const sanitizedData = {
      ...errorData,
      stack: errorData.stack?.replace(/http[s]?:\/\/[^\s]+/g, '[URL]'), // Remove URLs
      // Não incluir token ou dados pessoais
    };

    await fetch('/api/log-client-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData),
    });
  } catch (err) {
    console.error('Falha ao enviar log de erro:', err);
  }
}