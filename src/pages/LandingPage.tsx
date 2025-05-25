
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts";

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle dashboard button click
  const handleDashboardClick = () => {
    if (user) {
      navigate("/app");
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

        {/* Right: transaction simulation */}
        <div className="md:w-1/2 p-10 bg-white rounded-lg shadow-md mx-5 my-10 md:my-20">
          <h2 className="text-2xl font-bold mb-6">Lançamentos de Maio</h2>
          <div className="space-y-4">
            {[
              { hora: "09:00", desc: "Venda no cartão", valor: "R$ 150,00", tipo: "entrada", status: "confirmado" },
              { hora: "10:00", desc: "Compra de material", valor: "R$ 50,00", tipo: "saida", status: "confirmado" },
              { hora: "11:00", desc: "Pagamento de serviço", valor: "R$ 30,00", tipo: "saida", status: "pendente" },
              { hora: "14:00", desc: "Recebimento via PIX", valor: "R$ 200,00", tipo: "entrada", status: "confirmado" },
              { hora: "15:00", desc: "Venda à vista", valor: "R$ 85,00", tipo: "entrada", status: "confirmado" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 border rounded-lg shadow-sm bg-gray-50"
              >
                <div className="flex gap-4 items-center">
                  <div className="text-sm font-semibold">{item.hora}</div>
                  <div>
                    <div className="font-medium">{item.desc}</div>
                    <div className={`text-sm ${item.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                      {item.tipo === "entrada" ? "+" : "-"}{item.valor}
                    </div>
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.status === "confirmado" ? "bg-green-500" : "bg-blue-400"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer placeholder */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 MEI Finanças. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
