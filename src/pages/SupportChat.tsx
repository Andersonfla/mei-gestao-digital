import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, MessageSquare, Headphones, Crown, Clock, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthContext";
import { getOrCreateConversation, getMessages, sendMessage, createNewConversation, SupportMessage } from "@/services/supportService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RatingDialog } from "@/components/support/RatingDialog";

export default function SupportChat() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string>('open');
  const [conversationRating, setConversationRating] = useState<number | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
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
    const { conversation, error } = await getOrCreateConversation();
    
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a conversa de suporte.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (conversation) {
      setConversationId(conversation.id);
      setConversationStatus(conversation.status);
      setConversationRating(conversation.rating || null);
      
      // Se já tem mensagens, mostrar o chat automaticamente
      const msgs = await getMessages(conversation.id);
      if (msgs.length > 0) {
        setShowChat(true);
      }
      
      // Se a conversa está fechada e não foi avaliada, mostrar o diálogo de avaliação
      if (conversation.status === 'closed' && !conversation.rating && msgs.length > 0) {
        setShowRatingDialog(true);
      }
    }
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    
    const msgs = await getMessages(conversationId);
    setMessages(msgs);
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

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
          setMessages((prev) => [...prev, payload.new as SupportMessage]);
        }
      )
      .subscribe();

    return () => {
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const typingChannel = supabase.channel(`typing-${conversationId}`);
    typingChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await typingChannel.track({ typing: true, isAdmin: false });
      }
    });

    typingTimeoutRef.current = setTimeout(async () => {
      await typingChannel.track({ typing: false, isAdmin: false });
      supabase.removeChannel(typingChannel);
    }, 2000);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return;

    setSending(true);
    
    try {
      const success = await sendMessage(conversationId, newMessage.trim());

      if (success) {
        setNewMessage("");
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
        toast({
          title: "Erro",
          description: "Não foi possível enviar a mensagem.",
          variant: "destructive",
        });
      }
    } catch (error) {
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
    setShowChat(true);
    toast({
      title: "Novo atendimento iniciado",
      description: "Uma nova conversa foi criada com sucesso.",
    });
    setLoading(false);
  };

  const handleStartChat = () => {
    setShowChat(true);
    if (messages.length === 0) {
      toast({
        title: "Atendimento Iniciado",
        description: "Envie sua primeira mensagem e nossa equipe responderá em breve.",
      });
    }
  };

  const handleReopenConversation = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_conversations')
        .update({ status: 'open' })
        .eq('id', conversationId);

      if (error) throw error;

      setConversationStatus('open');
      setConversationRating(null);
      toast({
        title: "Conversa reaberta",
        description: "Você pode continuar enviando mensagens.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reabrir a conversa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmitted = () => {
    setConversationRating(1); // Set to any non-null value to indicate it's been rated
    toast({
      title: "Avaliação enviada",
      description: "Obrigado pelo seu feedback!",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando seu atendimento premium...</p>
        </div>
      </div>
    );
  }

  // Lobby Screen - Premium Design
  if (!showChat) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="max-w-3xl w-full border-primary/20 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          <CardHeader className="text-center space-y-6 pb-8 pt-12 relative">
            <div className="mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full p-8 w-32 h-32 flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/30 animate-fade-in">
              <Crown className="h-16 w-16 text-primary drop-shadow-lg" />
            </div>
            
            <div className="space-y-3 animate-fade-in">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Suporte Prioritário Exclusivo
              </CardTitle>
              <p className="text-xl text-foreground/80 max-w-xl mx-auto leading-relaxed">
                Seu canal de atendimento VIP. Nossa equipe está disponível para te ajudar com prioridade máxima.
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pb-12 relative">
            {/* Guarantee Card */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-xl p-8 text-center shadow-lg backdrop-blur-sm animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-primary/20 rounded-full p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="bg-primary/20 rounded-full p-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="font-semibold text-foreground text-lg mb-2">Tempo de Resposta Garantido</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Em média, menos de 1 hora
              </p>
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={handleStartChat}
              className="w-full h-16 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary animate-fade-in"
              size="lg"
            >
              <Headphones className="mr-3 h-6 w-6" />
              INICIAR NOVO ATENDIMENTO PRIORITÁRIO
            </Button>
            
            <p className="text-center text-sm text-muted-foreground animate-fade-in">
              Atendimento exclusivo para membros Premium
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chat Screen - Improved Design with Avatars
  return (
    <div className="container mx-auto max-w-5xl p-4 h-[calc(100vh-4rem)] animate-fade-in">
      <Card className="h-full flex flex-col shadow-xl border-primary/10">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-full p-2">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-bold">Chat de Suporte Prioritário</CardTitle>
              <CardDescription className="text-xs">
                {conversationStatus === 'open' ? 'Atendimento ativo' : 'Atendimento encerrado'}
              </CardDescription>
            </div>
            <Badge variant={conversationStatus === 'open' ? 'outline' : 'secondary'} className="gap-1">
              {conversationStatus === 'open' && <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
              {conversationStatus === 'open' ? 'Online' : 'Encerrado'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4 p-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-12 animate-fade-in">
                <div className="bg-primary/10 rounded-full p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <MessageSquare className="h-12 w-12 text-primary/50" />
                </div>
                <p className="text-lg font-medium">Seu atendimento começou!</p>
                <p className="text-sm mt-2">Envie sua primeira mensagem e nossa equipe responderá em breve.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sent_by_admin ? "justify-start" : "justify-end"
                  } animate-fade-in`}
                >
                  {message.sent_by_admin && (
                    <Avatar className="h-10 w-10 border-2 border-primary/20 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        SUP
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-md ${
                      message.sent_by_admin
                        ? "bg-card border border-border/50"
                        : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                    }`}
                  >
                    {message.sent_by_admin && (
                      <p className="text-xs font-semibold mb-1 text-primary">
                        Equipe de Suporte
                      </p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.sent_by_admin ? "text-muted-foreground" : "text-primary-foreground/70"
                    }`}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>

                  {!message.sent_by_admin && (
                    <Avatar className="h-10 w-10 border-2 border-primary/20 flex-shrink-0">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            
            {adminTyping && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <Avatar className="h-10 w-10 border-2 border-primary/20 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    SUP
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border/50 rounded-2xl px-5 py-3 shadow-md">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    Atendente digitando...
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {conversationStatus === 'closed' ? (
            <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2 border-dashed border-border shadow-lg animate-fade-in">
              <CardContent className="p-6 text-center space-y-4">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  {conversationRating ? (
                    <Star className="h-8 w-8 text-primary fill-primary" />
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1">
                    {conversationRating ? "Atendimento Avaliado" : "Atendimento Encerrado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {conversationRating 
                      ? "Obrigado pela sua avaliação! Você pode reabrir esta conversa ou iniciar um novo atendimento."
                      : "Este atendimento foi concluído. Você pode avaliar o atendimento, reabrir esta conversa ou iniciar um novo atendimento."
                    }
                  </p>
                </div>
                <div className="flex gap-3 justify-center pt-2 flex-wrap">
                  {!conversationRating && (
                    <Button
                      onClick={() => setShowRatingDialog(true)}
                      variant="default"
                      className="shadow-md"
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Avaliar Atendimento
                    </Button>
                  )}
                  <Button
                    onClick={handleReopenConversation}
                    variant="outline"
                    className="shadow-md"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Reabrir esta conversa
                  </Button>
                  <Button 
                    onClick={handleNewConversation}
                    className="shadow-md"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Iniciar novo atendimento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-3 pt-4 border-t animate-fade-in">
              <Textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={sending}
                className="flex-1 min-h-[80px] max-h-[160px] text-base shadow-sm resize-none"
                rows={3}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                size="icon"
                className="h-[80px] w-12 shadow-md self-end"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <RatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        conversationId={conversationId || ""}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
}
