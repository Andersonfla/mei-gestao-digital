
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { AnimatedTransactions } from "@/components/landing/AnimatedTransactions";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle dashboard button click
  const handleDashboardClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-10 shadow-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Heart className="text-primary h-6 w-6" />
            <div>
              <h1 className="font-bold text-lg">MEI Finanças</h1>
              <p className="text-xs text-muted-foreground">Gestão Simplificada</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#beneficios" className="text-muted-foreground hover:text-primary transition">Benefícios</a>
            <a href="#depoimentos" className="text-muted-foreground hover:text-primary transition">Depoimentos</a>
            <a href="#planos" className="text-muted-foreground hover:text-primary transition">Planos</a>
          </nav>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleDashboardClick}
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
                    Experimente Grátis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto pt-24 pb-10 flex flex-col md:flex-row min-h-screen">
        {/* Left: text and CTA */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center items-start">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Organize sua vida financeira <br />
            <span className="text-primary">simplificada</span> com o MEI Finanças
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Evite bagunça nas suas contas, acompanhe seus ganhos e despesas e fique em dia com o governo.
          </p>

          <Button 
            size="lg" 
            className="text-base px-6 py-6 h-auto"
            onClick={handleDashboardClick}
          >
            {user ? "Ir para o Dashboard" : "Comece com 20 lançamentos"}
          </Button>
        </div>

        {/* Right: animated transaction simulation */}
        <AnimatedTransactions />
      </div>
      
      {/* Benefits Section */}
      <BenefitsSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Planos Section Placeholder */}
      <section id="planos" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos Simples e Acessíveis
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Escolha o plano ideal para seu negócio
          </p>
          <Button 
            size="lg"
            onClick={handleDashboardClick}
          >
            {user ? "Ir para o Dashboard" : "Começar Agora"}
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 MEI Finanças. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
