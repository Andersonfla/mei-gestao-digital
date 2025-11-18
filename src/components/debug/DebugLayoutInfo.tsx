import { useState, useEffect } from "react";
import { usePlan } from "@/hooks/usePlan";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export function DebugLayoutInfo() {
  const [isVisible, setIsVisible] = useState(() => {
    // Só mostrar em desenvolvimento
    return import.meta.env.DEV;
  });
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    deviceType: getDeviceType(window.innerWidth),
  });
  const { plan } = usePlan();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        deviceType: getDeviceType(window.innerWidth),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Só renderizar em ambiente de desenvolvimento
  if (!import.meta.env.DEV || !isVisible) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-premium p-3 text-xs font-mono space-y-1.5 max-w-[200px]"
      style={{ width: 'auto', maxWidth: '200px' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-foreground">Debug Layout</span>
        <button 
          onClick={() => setIsVisible(false)}
          className="hover:bg-muted rounded p-0.5 transition-colors"
          aria-label="Fechar debug"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Viewport:</span>
          <span className="text-foreground font-medium">
            {dimensions.width}x{dimensions.height}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Dispositivo:</span>
          <Badge variant="outline" className="text-[10px] h-5">
            {dimensions.deviceType}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Plano:</span>
          <Badge 
            variant={plan === 'free' ? 'secondary' : 'default'}
            className="text-[10px] h-5"
          >
            {plan}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Body Width:</span>
          <span className="text-foreground font-medium">
            {document.body.offsetWidth}px
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Overflow:</span>
          <span className={`font-medium ${document.body.scrollWidth > document.body.offsetWidth ? 'text-destructive' : 'text-success'}`}>
            {document.body.scrollWidth > document.body.offsetWidth ? 'Sim' : 'Não'}
          </span>
        </div>
      </div>
      
      <div className="pt-2 border-t border-border text-[10px] text-muted-foreground">
        Pressione F12 para DevTools
      </div>
    </div>
  );
}

function getDeviceType(width: number): string {
  if (width < 640) return "Mobile";
  if (width < 1024) return "Tablet";
  return "Desktop";
}
