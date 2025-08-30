import React from "react";
import { AlertTriangle, Home, RefreshCw, Copy } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { useToast } from "@/hooks/use-toast";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const currentRoute = window.location.pathname;
    const errorData = {
      message: error.message,
      stack: error.stack,
      route: currentRoute,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack
    };

    // Log no console baseado no ambiente
    if (process.env.NODE_ENV !== 'production') {
      console.error('🚨 ErrorBoundary - Erro capturado:', error);
      console.error('📍 Rota:', currentRoute);
      console.error('🔍 Stack:', error.stack);
      console.error('⚛️ Component Stack:', errorInfo.componentStack);
      console.error('🆔 Error ID:', this.state.errorId);
    } else {
      console.error('Erro na aplicação [ID:', this.state.errorId, ']:', error.message);
      // Em produção, enviar para endpoint de log
      this.logErrorToServer(errorData);
    }
  }

  logErrorToServer = async (errorData: any) => {
    try {
      await fetch('/api/log-client-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      });
    } catch (err) {
      console.error('Falha ao enviar erro para o servidor:', err);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  handleCopyErrorId = () => {
    if (this.state.errorId) {
      navigator.clipboard.writeText(this.state.errorId);
      // Mostrar toast se possível
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'ID do erro copiado!' }
        }));
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Ops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReload} className="w-full" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button onClick={this.handleHome} variant="outline" className="w-full" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Início
                </Button>
              </div>
              
              {this.state.errorId && (
                <div className="mt-4 p-3 bg-muted rounded text-center">
                  <p className="text-sm text-muted-foreground mb-2">ID do erro:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs bg-background px-2 py-1 rounded">{this.state.errorId}</code>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={this.handleCopyErrorId}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Copie este código ao reportar o problema
                  </p>
                </div>
              )}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded text-xs">
                  <summary className="cursor-pointer font-medium">Detalhes do erro (dev)</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\nStack trace:\n' + this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}