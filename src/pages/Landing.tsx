
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">MEI</span>
          </div>
          <span className="font-semibold text-xl">MEI Finanças</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/auth')} className="border-purple-500 text-purple-500 hover:bg-purple-900 hover:text-white">
            Login
          </Button>
          <Button onClick={() => navigate('/auth?tab=signup')} className="bg-purple-600 hover:bg-purple-700">
            Experimente Grátis
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center">
          Agenda financeira <span className="text-purple-400">simplificada</span> para MEI
        </h1>
        <p className="mt-4 text-center text-gray-400 max-w-xl">
          Reduza faltas, otimize sua agenda e proporcione uma experiência superior aos seus clientes com nossa plataforma de agendamento inteligente.
        </p>
        
        <div className="mt-6 flex gap-4">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/auth?tab=signup')}>
            Comece grátis por 14 dias
          </Button>
          <Button size="lg" variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-900 hover:text-white" onClick={() => navigate('/app')}>
            Agende uma demonstração
          </Button>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} MEI Finanças. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;
