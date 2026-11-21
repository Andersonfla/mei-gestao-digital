import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";
import { NewBenefitsSection } from "@/components/landing/NewBenefitsSection";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { PricingSection } from "@/components/landing/PricingSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FAQSection } from "@/components/landing/FAQSection";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth?tab=signup");
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm z-50 border-b border-border shadow-sm"
      >
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png" 
              alt="MEI Finanças" 
              className="h-10 w-auto"
            />
            <div>
              <span className="font-bold text-lg text-foreground">MEI Finanças</span>
              <p className="text-xs text-muted-foreground">Gestão Simplificada</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Button variant="ghost"
              onClick={() => scrollToSection('beneficios')}
              className="text-muted-foreground hover:text-primary transition"
            >
              Benefícios
            </Button>
            <Button variant="ghost"
              onClick={() => scrollToSection('como-funciona')}
              className="text-muted-foreground hover:text-primary transition"
            >
              Como Funciona
            </Button>
            <Button variant="ghost"
              onClick={() => scrollToSection('planos')}
              className="text-muted-foreground hover:text-primary transition"
            >
              Planos
            </Button>
            <Link to="/install" className="text-muted-foreground hover:text-primary transition">
              Instalar App
            </Link>
            <Link to="/suporte" className="text-muted-foreground hover:text-primary transition">
              Suporte
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleCTA}
              >
                Ir para o Dashboard
              </Button>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link to="/auth?tab=signup" className="hidden sm:block">
                  <Button variant="default" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    Criar Conta Gratuitamente
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <section className="pt-28 sm:pt-32 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-sm font-semibold text-primary mb-4">MEI Finanças</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-foreground tracking-normal mb-5">
              Você trabalha o mês inteiro. Mas sabe quanto realmente lucrou?
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-7">
              Controle suas receitas, despesas e resultados em um só lugar. Organize as finanças do seu MEI de maneira simples.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={handleCTA}>
                {user ? "Ir para o Dashboard" : "Começar Gratuitamente"}
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('como-funciona')}>Ver Como Funciona</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Plano gratuito · até 20 lançamentos por mês</p>
          </div>
          <DashboardPreview />
        </div>
      </section>

      {/* Seções */}
      <NewBenefitsSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />

      {/* Rodapé */}
      <footer className="bg-muted py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png" 
                  alt="MEI Finanças" 
                  className="h-8 w-auto"
                />
                <span className="font-bold text-foreground">MEI Finanças</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A solução completa para gestão financeira do seu MEI
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/auth?tab=signup" className="text-sm text-muted-foreground hover:text-primary transition">
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link to="/suporte" className="text-sm text-muted-foreground hover:text-primary transition">
                    Suporte
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition">
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MEI Finanças. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
