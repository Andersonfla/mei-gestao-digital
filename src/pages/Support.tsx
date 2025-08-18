import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle, BookOpen, ArrowLeft, Clock } from "lucide-react";

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/ce3c76bc-dc40-4d39-b9eb-f9154e5e9dbe.png" 
                alt="MEI Finanças" 
                className="h-8 w-auto"
              />
              <div>
                <h1 className="font-bold text-lg">MEI Finanças</h1>
                <p className="text-xs text-muted-foreground">Suporte e Atendimento</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Precisa de ajuda? <br />
              <span className="text-primary">Estamos aqui para você!</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nosso time de suporte está pronto para ajudar com qualquer dúvida sobre o sistema, 
              planos ou lançamentos. Entre em contato pelo canal que preferir.
            </p>
          </div>

          {/* Response Time Indicator */}
          <div className="flex items-center justify-center gap-2 mb-12 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              Atendimento em até 24h úteis
            </span>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Email Support */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">E-mail de Suporte</CardTitle>
                <CardDescription>
                  Envie sua dúvida detalhada e nossa equipe responderá rapidamente
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  asChild 
                  className="w-full"
                  onClick={() => window.open('mailto:suporte@meifinancas.com', '_blank')}
                >
                  <a href="mailto:suporte@meifinancas.com">
                    suporte@meifinancas.com
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">WhatsApp</CardTitle>
                <CardDescription>
                  Converse diretamente conosco pelo WhatsApp para suporte rápido
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  asChild 
                  variant="secondary" 
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <a href="https://wa.me/5511987654321?text=Olá! Preciso de suporte com o MEI Finanças" target="_blank" rel="noopener noreferrer">
                    Abrir WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">FAQ</CardTitle>
                <CardDescription>
                  Consulte as perguntas mais frequentes e encontre respostas imediatas
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild variant="outline" className="w-full">
                  <Link to="#faq">
                    Ver Perguntas Frequentes
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <section id="faq" className="bg-white dark:bg-card rounded-lg p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Como faço para adicionar uma nova transação?</h3>
                <p className="text-muted-foreground">
                  Acesse a seção "Transações" no menu lateral e clique em "Nova Transação". 
                  Preencha os campos obrigatórios e salve.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Posso cancelar minha assinatura a qualquer momento?</h3>
                <p className="text-muted-foreground">
                  Sim! Você pode cancelar sua assinatura a qualquer momento nas configurações da sua conta. 
                  Não há multas ou taxas de cancelamento.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Como funciona o período de teste gratuito?</h3>
                <p className="text-muted-foreground">
                  Você pode usar o sistema gratuitamente com até 20 lançamentos por mês. 
                  Para transações ilimitadas, upgrade para o plano premium.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Meus dados estão seguros?</h3>
                <p className="text-muted-foreground">
                  Sim! Utilizamos criptografia de ponta e hospedamos seus dados em servidores seguros. 
                  Seus dados financeiros são protegidos com os mais altos padrões de segurança.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Posso exportar meus dados?</h3>
                <p className="text-muted-foreground">
                  Sim! Você pode exportar seus relatórios e dados em formato PDF ou planilha 
                  diretamente do sistema, na seção de relatórios.
                </p>
              </div>
            </div>
          </section>

          {/* Additional Help */}
          <div className="text-center mt-12 p-6 bg-primary/5 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Ainda precisa de ajuda?</h3>
            <p className="text-muted-foreground mb-4">
              Nossa equipe está sempre disponível para garantir que você tenha a melhor experiência possível.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="mailto:suporte@meifinancas.com">
                  Enviar E-mail
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">
                  Voltar ao Início
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 MEI Finanças. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}