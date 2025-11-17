import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Wifi, Zap, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const benefits = [
    {
      icon: Smartphone,
      title: "Acesso Instantâneo",
      description: "Abra direto da tela inicial do seu celular, como um app nativo"
    },
    {
      icon: Wifi,
      title: "Funciona Offline",
      description: "Acesse suas informações mesmo sem conexão com a internet"
    },
    {
      icon: Zap,
      title: "Super Rápido",
      description: "Carregamento instantâneo e experiência fluida"
    },
    {
      icon: Download,
      title: "Sem Download Pesado",
      description: "Instale em segundos, sem ocupar espaço no celular"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Instale o MEI Finanças
          </h1>
          <p className="text-xl text-muted-foreground">
            Tenha seu controle financeiro sempre à mão
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">App Instalado!</CardTitle>
              <CardDescription>
                O MEI Finanças já está instalado no seu dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/dashboard")} size="lg">
                Abrir Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Como Instalar?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isInstallable ? (
                  <div className="text-center">
                    <Button 
                      onClick={handleInstall} 
                      size="lg" 
                      className="text-lg px-8"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Instalar Agora
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">
                      Clique no botão acima para adicionar à tela inicial
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">📱 No Android:</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Toque no menu (⋮) do navegador</li>
                        <li>Selecione "Adicionar à tela inicial"</li>
                        <li>Toque em "Adicionar"</li>
                      </ol>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">🍎 No iPhone/iPad:</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Toque no botão Compartilhar (□↑)</li>
                        <li>Role até encontrar "Adicionar à Tela de Início"</li>
                        <li>Toque em "Adicionar"</li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{benefit.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                size="lg"
              >
                Continuar no Navegador
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
