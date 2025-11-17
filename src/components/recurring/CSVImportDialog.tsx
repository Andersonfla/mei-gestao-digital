import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { csvImportService, RecurringPattern } from "@/services/csvImportService";
import { recurringTransactionService, frequencyLabels } from "@/services/recurringTransactionService";
import { formatCurrency } from "@/lib/formatters";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/contexts";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function CSVImportDialog({ open, onOpenChange, onImportComplete }: CSVImportDialogProps) {
  const { categories } = useFinance();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedPatterns, setDetectedPatterns] = useState<RecurringPattern[]>([]);
  const [selectedPatterns, setSelectedPatterns] = useState<Set<number>>(new Set());
  const [patternCategories, setPatternCategories] = useState<Map<number, string>>(new Map());
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError("Por favor, selecione um arquivo CSV válido");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const processCSV = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const content = await file.text();
      const transactions = csvImportService.parseCSV(content);
      
      if (transactions.length === 0) {
        setError("Nenhuma transação válida encontrada no arquivo");
        setIsProcessing(false);
        return;
      }

      const patterns = csvImportService.detectRecurringPatterns(transactions);
      
      if (patterns.length === 0) {
        setError("Nenhum padrão recorrente detectado. São necessárias pelo menos 2 ocorrências da mesma transação.");
        setIsProcessing(false);
        return;
      }

      // Auto-suggest categories
      const suggestedCategories = new Map<number, string>();
      patterns.forEach((pattern, index) => {
        const suggested = csvImportService.suggestCategory(pattern.description, pattern.type);
        if (suggested) {
          suggestedCategories.set(index, suggested);
        }
      });

      setDetectedPatterns(patterns);
      setPatternCategories(suggestedCategories);
      setSelectedPatterns(new Set(patterns.map((_, i) => i)));
      setStep('review');
    } catch (err: any) {
      console.error("Erro ao processar CSV:", err);
      setError(err.message || "Erro ao processar arquivo CSV");
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePattern = (index: number) => {
    const newSelected = new Set(selectedPatterns);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPatterns(newSelected);
  };

  const updateCategory = (index: number, category: string) => {
    const newCategories = new Map(patternCategories);
    newCategories.set(index, category);
    setPatternCategories(newCategories);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    setError("");

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const index of selectedPatterns) {
        const pattern = detectedPatterns[index];
        const category = patternCategories.get(index);

        if (!category) {
          errorCount++;
          continue;
        }

        try {
          await recurringTransactionService.createRecurringTransaction({
            description: pattern.description,
            type: pattern.type,
            category,
            value: pattern.value,
            frequency: pattern.frequency,
            start_date: new Date().toISOString().split('T')[0],
          });
          successCount++;
        } catch (err) {
          console.error("Erro ao criar transação recorrente:", err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        onImportComplete();
        handleClose();
      }

      if (errorCount > 0) {
        setError(`${successCount} transações importadas com sucesso, ${errorCount} falharam`);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao importar transações");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setDetectedPatterns([]);
    setSelectedPatterns(new Set());
    setPatternCategories(new Map());
    setStep('upload');
    setError("");
    onOpenChange(false);
  };

  const getCategoryOptions = (type: 'entrada' | 'saida') => {
    return categories.filter(cat => cat.type === type);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Importar Transações Recorrentes de CSV
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' 
              ? "Faça upload do extrato bancário em formato CSV para detectar padrões recorrentes automaticamente"
              : `${detectedPatterns.length} padrão(ões) recorrente(s) detectado(s). Revise e confirme antes de importar.`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="csv-file">Arquivo CSV</Label>
              <div className="flex gap-2">
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Button 
                  onClick={processCSV} 
                  disabled={!file || isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Processar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Format Help */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Formato esperado do CSV:</strong>
                <pre className="mt-2 text-xs bg-muted p-2 rounded">
data,descrição,valor,tipo{'\n'}
01/01/2024,Aluguel,-1500.00,saida{'\n'}
05/01/2024,Salário,5000.00,entrada
                </pre>
                <ul className="mt-2 text-xs space-y-1">
                  <li>• Separadores: vírgula (,) ou ponto-e-vírgula (;)</li>
                  <li>• Formato de data: DD/MM/YYYY ou YYYY-MM-DD</li>
                  <li>• Valores negativos = saída, positivos = entrada</li>
                  <li>• Coluna "tipo" é opcional</li>
                </ul>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Review Section */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {detectedPatterns.map((pattern, index) => (
                <Card key={index} className={selectedPatterns.has(index) ? 'border-primary' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedPatterns.has(index)}
                        onCheckedChange={() => togglePattern(index)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{pattern.description}</h4>
                            <Badge variant={pattern.type === 'entrada' ? 'default' : 'destructive'}>
                              {pattern.type === 'entrada' ? 'Entrada' : 'Saída'}
                            </Badge>
                            <Badge variant="outline">
                              {frequencyLabels[pattern.frequency]}
                            </Badge>
                          </div>
                          <span className={`font-bold ${pattern.type === 'entrada' ? 'text-income' : 'text-expense'}`}>
                            {formatCurrency(pattern.value)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3" />
                          {pattern.occurrences} ocorrências detectadas
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Categoria</Label>
                            <Select
                              value={patternCategories.get(index) || ''}
                              onValueChange={(value) => updateCategory(index, value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {getCategoryOptions(pattern.type).map((cat) => (
                                  <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {selectedPatterns.size} de {detectedPatterns.length} transações selecionadas para importação
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {step === 'review' && (
            <Button 
              onClick={handleImport} 
              disabled={selectedPatterns.size === 0 || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  Importar {selectedPatterns.size} Transação(ões)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
