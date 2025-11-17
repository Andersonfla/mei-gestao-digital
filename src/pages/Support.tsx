import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateConversation, getMessages, sendMessage, SupportMessage } from "@/services/supportService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function Support() {
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      subscribeToMessages();
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
      console.log('✅ Conversa inicializada:', conversation.id);
      setConversationId(conversation.id);
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
        toast({
          title: "Sucesso",
          description: "Mensagem enviada!",
        });
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
            <div>
              <CardTitle>Suporte Prioritário</CardTitle>
              <CardDescription>
                Nossa equipe está disponível para ajudá-lo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col h-[calc(100%-5rem)] p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
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

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
