import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminLogs, AdminLog } from "@/services/adminLogsService";
import { RefreshCw, FileText, ArrowUp, ArrowDown, RotateCw, Ban, CheckCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const renderLogDetails = (details: any) => {
  if (!details) return "-";
  
  // Mudança de plano (upgrade/downgrade/renovação)
  if (details.change_type) {
    const planNames: Record<string, string> = {
      free: 'Gratuito',
      premium: 'Premium',
      master: 'Premium Master'
    };
    
    return (
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          {details.change_type === 'upgrade' && (
            <Badge variant="default" className="gap-1">
              <ArrowUp className="h-3 w-3" /> Upgrade
            </Badge>
          )}
          {details.change_type === 'downgrade' && (
            <Badge variant="destructive" className="gap-1">
              <ArrowDown className="h-3 w-3" /> Downgrade
            </Badge>
          )}
          {details.change_type === 'renovação' && (
            <Badge variant="secondary" className="gap-1">
              <RotateCw className="h-3 w-3" /> Renovação
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground">
          De: <span className="font-medium">{planNames[details.old_plan] || details.old_plan}</span> → 
          Para: <span className="font-medium">{planNames[details.new_plan] || details.new_plan}</span>
        </div>
        {details.duration_months > 0 && (
          <div className="text-muted-foreground">
            Duração: {details.duration_months} {details.duration_months === 1 ? 'mês' : 'meses'}
          </div>
        )}
        {details.new_subscription_end && (
          <div className="text-muted-foreground">
            Expira: {format(new Date(details.new_subscription_end), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        )}
      </div>
    );
  }
  
  // Suspensão/Ativação
  if (details.action_type === 'suspension' || details.action_type === 'reactivation') {
    return (
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          {details.action_type === 'suspension' && (
            <Badge variant="destructive" className="gap-1">
              <Ban className="h-3 w-3" /> Suspenso
            </Badge>
          )}
          {details.action_type === 'reactivation' && (
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Reativado
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground">
          Status anterior: <span className="font-medium">{details.old_status}</span>
        </div>
        {details.user_plan && (
          <div className="text-muted-foreground">
            Plano do usuário: <span className="font-medium">{details.user_plan}</span>
          </div>
        )}
      </div>
    );
  }
  
  // Exclusão permanente
  if (details.action_type === 'permanent_deletion') {
    return (
      <div className="space-y-1 text-xs">
        <Badge variant="destructive" className="gap-1">
          <Trash2 className="h-3 w-3" /> Exclusão Permanente
        </Badge>
        <div className="text-muted-foreground">
          Plano: <span className="font-medium">{details.deleted_user_plan || 'N/A'}</span>
        </div>
        <div className="text-muted-foreground">
          Transações: <span className="font-medium">{details.deleted_user_transactions || 0}</span>
        </div>
      </div>
    );
  }
  
  // Fallback para outros detalhes
  return (
    <div className="text-xs text-muted-foreground max-w-[300px] break-words">
      {JSON.stringify(details, null, 2)}
    </div>
  );
};

export function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getAdminLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Logs de Auditoria</CardTitle>
            <CardDescription>Registro de todas as ações administrativas</CardDescription>
          </div>
          <Button onClick={fetchLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p>Nenhum log encontrado</p>
            <p className="text-xs">As ações administrativas serão registradas aqui</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Usuário Afetado</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.target_user_email || "-"}</TableCell>
                    <TableCell className="max-w-[350px]">
                      {renderLogDetails(log.details)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="text-sm text-muted-foreground mt-4">
          Total: {logs.length} log(s)
        </div>
      </CardContent>
    </Card>
  );
}
