
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header com botões de login e experiência grátis */}
      <header className="py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-semibold text-sm">MEI</span>
          </div>
          <span className="font-semibold text-xl">MEI Finanças</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Login
          </Button>
          <Button onClick={() => navigate('/auth?tab=signup')} className="bg-violet-500 hover:bg-violet-600">
            Experimente Grátis
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto py-16 px-4 md:px-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6">
          <span className="block">Agenda financeira</span>
          <span className="block text-violet-500">simplificada</span>
          <span className="block">para MEI</span>
        </h1>
        <p className="text-xl text-center text-muted-foreground max-w-2xl mb-10">
          Reduza faltas, otimize sua agenda e proporcione uma experiência superior aos seus clientes com nossa plataforma de agendamento inteligente.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="bg-violet-500 hover:bg-violet-600" onClick={() => navigate('/auth?tab=signup')}>
            Comece grátis por 14 dias
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/app')}>
            Agende uma demonstração
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
        
        <p className="mt-8 text-center text-lg">
          +500 profissionais MEI já utilizam nossa plataforma
        </p>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-6 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MEI Finanças. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;
