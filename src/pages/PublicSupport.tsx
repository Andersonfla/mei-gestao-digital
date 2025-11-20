import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createContactMessage } from "@/services/contactMessageService";
import { z } from "zod";

const contactSchema = z.object({
  nome_completo: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
  email_contato: z.string().trim().email("E-mail inválido").max(255, "E-mail deve ter no máximo 255 caracteres"),
  assunto: z.string().trim().min(5, "Assunto deve ter no mínimo 5 caracteres").max(200, "Assunto deve ter no máximo 200 caracteres"),
  mensagem: z.string().trim().min(10, "Mensagem deve ter no mínimo 10 caracteres").max(2000, "Mensagem deve ter no máximo 2000 caracteres")
});

export default function PublicSupport() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    email_contato: "",
    assunto: "",
    mensagem: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validação
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { success } = await createContactMessage(formData);

    if (success) {
      toast({
        title: "Mensagem enviada com sucesso!",
        description: `Recebemos sua solicitação e responderemos no e-mail ${formData.email_contato} em até 24 horas.`,
      });
      setFormData({
        nome_completo: "",
        email_contato: "",
        assunto: "",
        mensagem: ""
      });
    } else {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente ou entre em contato por e-mail.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Central de Suporte
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Estamos aqui para ajudar! Entre em contato conosco através do formulário abaixo ou por e-mail.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Email Card */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>E-mail Direto</CardTitle>
                  <CardDescription>Contato por e-mail tradicional</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Prefere enviar um e-mail diretamente? Entre em contato conosco:
              </p>
              <a 
                href="mailto:suporte@meifinancas.com.br"
                className="text-primary hover:underline font-medium text-lg"
              >
                suporte@meifinancas.com.br
              </a>
              <p className="text-sm text-muted-foreground mt-4">
                Respondemos em até 24 horas úteis
              </p>
            </CardContent>
          </Card>

          {/* Formulário Card */}
          <Card className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Formulário de Contato</CardTitle>
                  <CardDescription>Envie sua mensagem rapidamente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome_completo">Nome Completo</Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                    placeholder="Seu nome completo"
                    disabled={loading}
                    className={errors.nome_completo ? "border-destructive" : ""}
                  />
                  {errors.nome_completo && (
                    <p className="text-xs text-destructive mt-1">{errors.nome_completo}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email_contato">E-mail</Label>
                  <Input
                    id="email_contato"
                    type="email"
                    value={formData.email_contato}
                    onChange={(e) => setFormData({ ...formData, email_contato: e.target.value })}
                    placeholder="seu@email.com"
                    disabled={loading}
                    className={errors.email_contato ? "border-destructive" : ""}
                  />
                  {errors.email_contato && (
                    <p className="text-xs text-destructive mt-1">{errors.email_contato}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="assunto">Assunto</Label>
                  <Input
                    id="assunto"
                    value={formData.assunto}
                    onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                    placeholder="Qual é o motivo do contato?"
                    disabled={loading}
                    className={errors.assunto ? "border-destructive" : ""}
                  />
                  {errors.assunto && (
                    <p className="text-xs text-destructive mt-1">{errors.assunto}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="mensagem">Mensagem</Label>
                  <Textarea
                    id="mensagem"
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Descreva sua dúvida ou problema em detalhes..."
                    rows={6}
                    disabled={loading}
                    className={errors.mensagem ? "border-destructive" : ""}
                  />
                  {errors.mensagem && (
                    <p className="text-xs text-destructive mt-1">{errors.mensagem}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Info adicional */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Suporte Prioritário Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Clientes Premium e Premium Master têm acesso ao chat de suporte prioritário com atendimento em tempo real.{" "}
                  <a href="/auth" className="text-primary hover:underline font-medium">
                    Faça login para acessar
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
