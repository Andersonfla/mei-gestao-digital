import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, MessageSquare, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllConversations, 
  getMessages, 
  sendAdminMessage, 
  closeConversation,
  reopenConversation,
  SupportConversation, 
  SupportMessage 
} from "@/services/supportService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const AdminSupport = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      subscribeToMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setLoading(true);
    const convs = await getAllConversations();
    setConversations(convs);
    setLoading(false);
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;
    
    const msgs = await getMessages(selectedConversation.id);
    setMessages(msgs);
  };

  const subscribeToMessages = () => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`admin-support-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    const success = await sendAdminMessage(selectedConversation.id, newMessage.trim());

    if (success) {
      setNewMessage("");
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    }
    setSending(false);
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    const success = await closeConversation(selectedConversation.id);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Conversa fechada com sucesso.",
      });
      loadConversations();
      setSelectedConversation(null);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível fechar a conversa.",
        variant: "destructive",
      });
    }
  };

  const handleReopenConversation = async () => {
    if (!selectedConversation) return;

    const success = await reopenConversation(selectedConversation.id);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Conversa reaberta com sucesso.",
      });
      loadConversations();
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) {
        setSelectedConversation({ ...updated, status: 'open' });
      }
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível reabrir a conversa.",
        variant: "destructive",
      });
    }
  };

  const getPlanBadge = (plan?: string) => {
    if (plan === 'master') {
      return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Premium Master</Badge>;
    }
    if (plan === 'premium') {
      return <Badge variant="secondary">Premium</Badge>;
    }
    return <Badge variant="outline">Free</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Conversas</CardTitle>
              <CardDescription>{conversations.length} conversas</CardDescription>
            </div>
            <Button size="sm" variant="ghost" onClick={loadConversations}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y overflow-y-auto max-h-[calc(100vh-20rem)]">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma conversa ainda</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-accent transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">
                        {conv.user_name || conv.user_email || 'Usuário'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.user_email}
                      </p>
                    </div>
                    {getPlanBadge(conv.user_plan)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(conv.last_message_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <Badge variant={conv.status === 'open' ? 'default' : 'outline'}>
                      {conv.status === 'open' ? 'Aberta' : 'Fechada'}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="md:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation.user_name || selectedConversation.user_email}
                    </CardTitle>
                    <CardDescription>{selectedConversation.user_email}</CardDescription>
                  </div>
                  {getPlanBadge(selectedConversation.user_plan)}
                </div>
                <div className="flex gap-2">
                  {selectedConversation.status === 'open' ? (
                    <Button size="sm" variant="outline" onClick={handleCloseConversation}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Fechar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={handleReopenConversation}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reabrir
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col h-[calc(100%-5rem)] p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sent_by_admin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-4 ${
                          message.sent_by_admin
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.sent_by_admin ? 'opacity-70' : 'text-muted-foreground'
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

              {/* Input */}
              {selectedConversation.status === 'open' && (
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua resposta..."
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
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione uma conversa para visualizar</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
