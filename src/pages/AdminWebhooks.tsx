import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Copy, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const WEBHOOK_URL = `https://ucnajqoapngtearuafkv.supabase.co/functions/v1/kiwify-webhook`;

export default function AdminWebhooks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [testEmail, setTestEmail] = useState("");
  const [testEvento, setTestEvento] = useState("assinatura renovada");
  const [testProduto, setTestProduto] = useState("Plano Premium");

  // Fetch webhook logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // Simulate webhook mutation
  const simulateWebhook = useMutation({
    mutationFn: async () => {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          evento: testEvento,
          produto: testProduto,
          token: '33codiyu0ng'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar webhook');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Webhook simulado com sucesso",
        description: `Plano atualizado para: ${data.plano}`,
      });
      queryClient.invalidateQueries({ queryKey: ['webhook-logs'] });
      setTestEmail("");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erro ao simular webhook",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(WEBHOOK_URL);
    toast({
      title: "✅ URL copiada",
      description: "URL do webhook copiada para a área de transferência",
    });
  };

  const handleSimulate = () => {
    if (!testEmail) {
      toast({
        title: "⚠️ Email obrigatório",
        description: "Por favor, insira um email para simular o webhook",
        variant: "destructive",
      });
      return;
    }
    simulateWebhook.mutate();
  };

  const getEventBadge = (evento: string) => {
    if (evento.includes('cancelada') || evento.includes('atrasada')) {
      return <Badge variant="destructive">{evento}</Badge>;
    }
    if (evento.includes('renovada') || evento.includes('aprovada')) {
      return <Badge className="bg-green-600">{evento}</Badge>;
    }
    return <Badge variant="secondary">{evento}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Webhooks Kiwify</h1>
        <p className="text-muted-foreground">Gerencie a integração com a Kiwify via webhooks</p>
      </div>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>URL do Webhook</CardTitle>
          <CardDescription>
            Copie esta URL e cadastre na Kiwify para receber eventos automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={WEBHOOK_URL} readOnly className="font-mono text-sm" />
            <Button onClick={copyWebhookUrl} variant="outline" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Token de segurança: <code className="bg-muted px-2 py-1 rounded">33codiyu0ng</code>
          </p>
        </CardContent>
      </Card>

      {/* Webhook Simulator */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Webhooks</CardTitle>
          <CardDescription>
            Teste a integração manualmente enviando eventos simulados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email do Usuário</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-evento">Evento</Label>
              <Select value={testEvento} onValueChange={setTestEvento}>
                <SelectTrigger id="test-evento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assinatura renovada">Assinatura Renovada</SelectItem>
                  <SelectItem value="assinatura aprovada">Assinatura Aprovada</SelectItem>
                  <SelectItem value="assinatura cancelada">Assinatura Cancelada</SelectItem>
                  <SelectItem value="assinatura atrasada">Assinatura Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-produto">Produto</Label>
              <Select value={testProduto} onValueChange={setTestProduto}>
                <SelectTrigger id="test-produto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plano Premium">Plano Premium</SelectItem>
                  <SelectItem value="Plano Básico">Plano Básico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleSimulate} 
            disabled={simulateWebhook.isPending}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {simulateWebhook.isPending ? 'Processando...' : 'Simular Webhook'}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Eventos</CardTitle>
          <CardDescription>
            Histórico dos 10 últimos webhooks processados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando logs...</p>
          ) : logs && logs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{log.email}</TableCell>
                      <TableCell>{getEventBadge(log.evento)}</TableCell>
                      <TableCell>{log.produto || '-'}</TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Sucesso
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {log.status}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum evento registrado ainda</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}