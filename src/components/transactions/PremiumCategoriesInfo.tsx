import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useFinance } from "@/contexts";

const PREMIUM_CATEGORIES = [
  'Anúncios Online (Facebook/Instagram Ads)',
  'Google Ads',
  'TikTok Ads',
  'Tráfego Pago – Outros',
  'Fornecedores / Produtos',
  'Taxas e Impostos',
  'Ferramentas e Softwares'
];

export function PremiumCategoriesInfo() {
  const navigate = useNavigate();
  const { userSettings } = useFinance();

  // Só mostrar para usuários gratuitos
  if (userSettings.plan === 'premium' || userSettings.plan === 'master') {
    return null;
  }

  return (
    <Card className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Crown className="h-5 w-5" />
          Categorias Premium
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          Desbloqueie categorias especiais para tráfego pago e e-commerce
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PREMIUM_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center gap-2 p-2 rounded-md bg-white/50 dark:bg-gray-800/50">
                <Lock className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Essas categorias são ideais para quem trabalha com tráfego pago, dropshipping, afiliados e Cash on Delivery.
            </p>
            <Button 
              onClick={() => navigate("/upgrade")} 
              className="w-full"
              variant="outline"
              disabled
            >
              <Crown className="h-4 w-4 mr-2" />
              Método de pagamento temporariamente indisponível
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}