
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

export function InstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Smartphone className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Instalar App</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          Instale o MEI Finanças no seu dispositivo para acesso rápido e funcionamento offline.
        </CardDescription>
        <Button onClick={installApp} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Instalar App
        </Button>
      </CardContent>
    </Card>
  );
}
