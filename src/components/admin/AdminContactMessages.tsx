import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPendingMessages, getAllMessages, markMessageAsResolved, ContactMessage } from "@/services/contactMessageService";
import { format } from "date-fns";

export default function AdminContactMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, [showResolved]);

  const loadMessages = async () => {
    setLoading(true);
    const data = showResolved ? await getAllMessages() : await getPendingMessages();
    setMessages(data);
    setLoading(false);
  };

  const handleMarkAsResolved = async (messageId: string) => {
    setResolvingId(messageId);
    const { success } = await markMessageAsResolved(messageId);

    if (success) {
      toast({
        title: "Mensagem marcada como resolvida",
        description: "A mensagem foi movida para resolvidas.",
      });
      loadMessages();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a mensagem como resolvida.",
        variant: "destructive",
      });
    }
    setResolvingId(null);
  };

  const pendingCount = messages.filter(m => m.status === 'pendente').length;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Mensagens de Contato</h2>
          <p className="text-muted-foreground">
            Gerencie as mensagens recebidas através do formulário público
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={pendingCount > 0 ? "destructive" : "secondary"} className="text-sm px-3 py-1">
            {pendingCount} Pendente{pendingCount !== 1 ? 's' : ''}
          </Badge>
          <Button
            variant={showResolved ? "default" : "outline"}
            onClick={() => setShowResolved(!showResolved)}
          >
            {showResolved ? "Mostrar Pendentes" : "Mostrar Todas"}
          </Button>
        </div>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              {showResolved ? "Nenhuma mensagem encontrada" : "Nenhuma mensagem pendente"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card key={message.id} className={message.status === 'pendente' ? 'border-primary/50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{message.assunto}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="font-medium">{message.nome_completo}</span>
                      <span>•</span>
                      <a href={`mailto:${message.email_contato}`} className="hover:text-primary transition">
                        {message.email_contato}
                      </a>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={message.status === 'pendente' ? 'default' : 'secondary'}>
                      {message.status === 'pendente' ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolvido
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{message.mensagem}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Recebida em {format(new Date(message.data_recebimento), 'dd/MM/yyyy HH:mm')}
                    </p>
                    
                    {message.status === 'pendente' && (
                      <Button
                        onClick={() => handleMarkAsResolved(message.id)}
                        disabled={resolvingId === message.id}
                        size="sm"
                      >
                        {resolvingId === message.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Marcando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Resolvido
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
