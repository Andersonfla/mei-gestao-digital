
import { FilterPeriod } from "@/components/dashboard/FilterPeriod";
import { ReportBarChart } from "@/components/reports/ReportBarChart";
import { ReportSummary } from "@/components/reports/ReportSummary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useFinance } from "@/contexts";
import { formatCurrency } from "@/lib/formatters";
import { format, parseISO } from "date-fns";
import { TransactionChart } from "@/components/dashboard/TransactionChart";
import { useState } from "react";

const Reports = () => {
  const { filteredTransactions, userSettings } = useFinance();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    // In a real app, this would generate a PDF or Excel file
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    
    if (userSettings.plan === 'free') {
      toast({
        title: "Recurso Premium",
        description: "Faça upgrade para o plano Premium para exportar relatórios.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Relatório exportado",
      description: "O relatório foi exportado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <FilterPeriod />
          <Button variant="default" onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exportando..." : "Exportar Relatório"}
          </Button>
        </div>
      </div>
      
      <ReportSummary />
      
      <div className="grid gap-6 lg:grid-cols-2">
        <ReportBarChart />
        
        <Card className="shadow-sm">
          <Dialog>
            <DialogTrigger asChild>
              <div className="p-6 flex flex-col items-center justify-center h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <h3 className="text-xl font-semibold mb-4">Visualizar Transações Detalhadas</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Clique para ver todas as transações do período selecionado em formato detalhado
                </p>
                <Button variant="outline">Ver detalhes</Button>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Transações Detalhadas</DialogTitle>
                <DialogDescription>
                  Lista completa de transações do período selecionado
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          Nenhuma transação encontrada para o período selecionado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{transaction.description || '-'}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs ${
                                transaction.type === 'entrada'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {transaction.type === 'entrada' ? 'Receita' : 'Despesa'}
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            transaction.type === 'entrada' ? 'text-income' : 'text-expense'
                          }`}>
                            {transaction.type === 'entrada' ? '+' : '-'}
                            {formatCurrency(transaction.value)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransactionChart type="entrada" />
        <TransactionChart type="saida" />
      </div>
    </div>
  );
};

export default Reports;
