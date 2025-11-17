import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { format, parseISO } from "date-fns";
import { Calendar, FileText, Tag, TrendingDown, TrendingUp } from "lucide-react";

interface Transaction {
  id: string;
  date: Date | string;
  description?: string | null;
  category: string;
  type: string;
  value: number;
}

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function TransactionCard({ transaction, onDelete, isDeleting }: TransactionCardProps) {
  const formatDate = (date: Date | string) => {
    if (date instanceof Date) {
      return format(date, 'dd/MM/yyyy');
    }
    return format(parseISO(date), 'dd/MM/yyyy');
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Data */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(transaction.date)}</span>
            </div>

            {/* Descrição */}
            {transaction.description && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium break-words">{transaction.description}</span>
              </div>
            )}

            {/* Categoria */}
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{transaction.category}</span>
            </div>

            {/* Tipo e Valor */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                {transaction.type === 'entrada' ? (
                  <TrendingUp className="h-4 w-4 text-income" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-expense" />
                )}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'entrada'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'entrada' ? 'Receita' : 'Despesa'}
                </span>
              </div>
              
              <span
                className={`text-lg font-bold ${
                  transaction.type === 'entrada' ? 'text-income' : 'text-expense'
                }`}
              >
                {transaction.type === 'entrada' ? '+' : '-'}
                {formatCurrency(transaction.value)}
              </span>
            </div>
          </div>
        </div>

        {/* Botão de excluir */}
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => onDelete(transaction.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
