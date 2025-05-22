
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // If user is already logged in, redirect to app
  useEffect(() => {
    if (user && !loading) {
      navigate('/app');
    }
  }, [user, loading, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-semibold text-sm">MEI</span>
          </div>
          <span className="font-semibold text-xl">MEI Finanças</span>
        </div>
        <Button onClick={() => navigate('/auth')}>Entrar</Button>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto py-16 px-4 md:px-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">
          Simplifique suas finanças como MEI
        </h1>
        <p className="text-xl text-center text-muted-foreground max-w-2xl mb-10">
          Uma ferramenta completa para gerenciar transações, acompanhar receitas e despesas, e tomar melhores decisões financeiras para o seu negócio.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Começar Agora
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth?tab=signup')}>
            Criar Conta
          </Button>
        </div>
        
        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="mb-4 p-3 rounded-full bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Controle Total</h3>
            <p className="text-muted-foreground">Gerencie suas transações com facilidade e tenha controle total das suas finanças.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="mb-4 p-3 rounded-full bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
            <p className="text-muted-foreground">Visualize seus dados financeiros com gráficos e relatórios fáceis de entender.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="mb-4 p-3 rounded-full bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Planos Flexíveis</h3>
            <p className="text-muted-foreground">Comece gratuitamente e atualize quando precisar de recursos avançados.</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-6 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MEI Finanças. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;
