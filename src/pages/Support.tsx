import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateConversation, getMessages, sendMessage, createNewConversation, SupportMessage } from "@/services/supportService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function Support() {
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string>('open');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      subscribeToMessages();
      subscribeToTyping();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initConversation = async () => {
    console.log('🚀 Inicializando conversa de suporte...');
    const { conversation, error } = await getOrCreateConversation();
    
    if (error) {
      console.error('❌ Erro ao inicializar conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa de suporte. Detalhes: " + (error.message || error),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (conversation) {
      console.log('✅ Conversa inicializada:', conversation.id, 'Status:', conversation.status);
      setConversationId(conversation.id);
      setConversationStatus(conversation.status);
    } else {
      console.error('❌ Nenhuma conversa retornada');
      toast({
        title: "Erro",
        description: "Não foi possível criar a conversa de suporte.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!conversationId) {
      console.log('⚠️ Nenhum conversation ID para carregar mensagens');
      return;
    }
    
    console.log('📥 Carregando mensagens para conversa:', conversationId);
    const msgs = await getMessages(conversationId);
    console.log('✅ Mensagens carregadas:', msgs.length);
    setMessages(msgs);
  };

  const subscribeToMessages = () => {
    if (!conversationId) {
      console.log('⚠️ Nenhum conversation ID para subscrever');
      return;
    }

    console.log('🔔 Inscrevendo-se em mensagens para conversa:', conversationId);

    const channel = supabase
      .channel(`support-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('🔔 Nova mensagem recebida via realtime:', payload);
          setMessages((prev) => [...prev, payload.new as SupportMessage]);
        }
      )
      .subscribe((status) => {
        console.log('🔔 Status da subscription:', status);
      });

    return () => {
      console.log('🔕 Removendo subscription');
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    if (!conversationId) return;

    const typingChannel = supabase.channel(`typing-${conversationId}`, {
      config: { presence: { key: conversationId } }
    });

    typingChannel
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        const adminIsTyping = Object.values(state).some((presences: any) => 
          presences.some((p: any) => p.isAdmin && p.typing)
        );
        setAdminTyping(adminIsTyping);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  };

  const handleTyping = () => {
    if (!conversationId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing signal
    const typingChannel = supabase.channel(`typing-${conversationId}`);
    typingChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await typingChannel.track({ typing: true, isAdmin: false });
      }
    });

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      await typingChannel.track({ typing: false, isAdmin: false });
      supabase.removeChannel(typingChannel);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) {
      console.warn('⚠️ Tentativa de envio sem mensagem ou conversation ID');
      console.log('Message:', newMessage);
      console.log('Conversation ID:', conversationId);
      return;
    }

    console.log('📨 Tentando enviar mensagem...');
    setSending(true);
    
    try {
      const success = await sendMessage(conversationId, newMessage.trim());

      if (success) {
        console.log('✅ Mensagem enviada com sucesso!');
        setNewMessage("");
        // If conversation was closed, update status to open
        if (conversationStatus === 'closed') {
          setConversationStatus('open');
          toast({
            title: "Atendimento reaberto",
            description: "Sua conversa foi reaberta com sucesso.",
          });
        } else {
          toast({
            title: "Sucesso",
            description: "Mensagem enviada!",
          });
        }
      } else {
        console.error('❌ Falha ao enviar mensagem');
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao processar envio:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = async () => {
    setLoading(true);
    const { conversation, error } = await createNewConversation();
    
    if (error || !conversation) {
      toast({
        title: "Erro",
        description: "Não foi possível criar uma nova conversa.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setConversationId(conversation.id);
    setConversationStatus('open');
    setMessages([]);
    toast({
      title: "Novo atendimento iniciado",
      description: "Uma nova conversa foi criada com sucesso.",
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <CardTitle>Suporte Prioritário</CardTitle>
              <CardDescription>
                Nossa equipe está disponível para ajudá-lo
              </CardDescription>
            </div>
            {/* Debug info */}
            <div className="text-xs text-muted-foreground">
              {conversationId ? (
                <Badge variant="outline" className="gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Conectado
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Desconectado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col h-[calc(100%-5rem)] p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-muted p-2 rounded text-xs mb-4">
                <div>Conversation ID: {conversationId || 'Nenhum'}</div>
                <div>Total de mensagens: {messages.length}</div>
                <div>Status: {sending ? 'Enviando...' : 'Pronto'}</div>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Bem-vindo ao Suporte Prioritário!</p>
                <p className="text-sm mt-2">
                  Envie sua primeira mensagem e nossa equipe responderá em breve.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sent_by_admin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.sent_by_admin
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.sent_by_admin ? 'text-muted-foreground' : 'opacity-70'
                      }`}
                    >
                      {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {adminTyping && (
                <div className="px-6 py-2 text-sm text-muted-foreground italic">
                  Admin está digitando...
                </div>
              )}

              {/* Input Area */}
              <div className="border-t p-4">
                {conversationStatus === 'closed' ? (
                  <div className="bg-muted/50 p-6 rounded-lg border-2 border-dashed border-muted-foreground/20 text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Atendimento Encerrado
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                        variant="outline"
                      >
                        Reabrir esta conversa
                      </Button>
                      <Button 
                        onClick={handleNewConversation}
                        disabled={sending}
                      >
                        Iniciar novo atendimento
                      </Button>
                    </div>
                    {newMessage.trim() && (
                      <p className="text-xs text-muted-foreground">
                        Você pode reabrir esta conversa ou iniciar uma nova
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="resize-none"
                      rows={3}
                      disabled={sending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="self-end"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
