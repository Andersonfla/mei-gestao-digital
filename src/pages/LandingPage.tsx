import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";
import { NewBenefitsSection } from "@/components/landing/NewBenefitsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
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
      navigate("/auth");
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
              <h1 className="font-bold text-lg text-foreground">MEI Finanças</h1>
              <p className="text-xs text-muted-foreground">Gestão Simplificada</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('beneficios')}
              className="text-muted-foreground hover:text-primary transition"
            >
              Benefícios
            </button>
            <button 
              onClick={() => scrollToSection('como-funciona')}
              className="text-muted-foreground hover:text-primary transition"
            >
              Como Funciona
            </button>
            <button 
              onClick={() => scrollToSection('planos')}
              className="text-muted-foreground hover:text-primary transition"
            >
              Planos
            </button>
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
                <Link to="/auth">
                  <Button variant="default" className="bg-primary hover:bg-primary/90">
                    Criar Conta Gratuitamente
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background animado sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                A segurança e a simplicidade que suas finanças como MEI{" "}
                <span className="text-primary">merecem</span>
              </motion.h1>
              
              <motion.p
                className="text-xl text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Tome o controle financeiro do seu negócio com uma plataforma intuitiva, 
                segura e feita para você. Organize-se em minutos e foque no que realmente 
                importa: o crescimento da sua empresa.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  size="lg"
                  className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleCTA}
                >
                  Começar Gratuitamente
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  onClick={() => scrollToSection('como-funciona')}
                >
                  Ver Como Funciona
                </Button>
              </motion.div>
            </motion.div>

            {/* Mockup do Dashboard */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-8">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <img 
                      src="/lovable-uploads/5e39902a-2bd1-42c2-9a26-0af80a9d1669.png" 
                      alt="Dashboard Preview" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </motion.div>
                </div>
              </div>
              
              {/* Elementos decorativos */}
              <motion.div
                className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"
                animate={{
                  scale: [1.3, 1, 1.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seções */}
      <NewBenefitsSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
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
                  <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition">
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
              © 2025 MEI Finanças. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
