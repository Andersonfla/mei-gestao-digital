
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useFinance } from "@/contexts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionType } from "@/types/finance";
import { useNavigate } from "react-router-dom";
import { TransactionFormFields } from "./TransactionFormFields";
import { TransactionLimitIndicator } from "./TransactionLimitIndicator";
import { TransactionFormValues, transactionSchema } from "./transactionSchema";
import { useAuth } from "@/contexts";

export function TransactionForm() {
  const { categories, addTransaction, userSettings, refetchUserSettings } = useFinance();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TransactionType>("entrada");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Revalidar configurações do usuário quando o componente montar e a cada 30 segundos
  useEffect(() => {
    // Consulta inicial
    refetchUserSettings();
    
    // Configurar revalidação periódica para manter os dados atualizados
    const intervalId = setInterval(() => {
      refetchUserSettings();
    }, 30000); // Revalidar a cada 30 segundos
    
    return () => clearInterval(intervalId);
  }, [refetchUserSettings]);
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      value: "",
      description: "",
      category: "",
    },
  });

  const filteredCategories = categories.filter(category => category.type === activeTab);

  async function onSubmit(data: TransactionFormValues) {
    try {
      setIsSubmitting(true);
      
      const newTransaction = {
        user_id: user?.id || "", 
        date: data.date,
        value: parseFloat(data.value),
        description: data.description || null,
        category: data.category,
        type: activeTab,
      };
      
      await addTransaction(newTransaction);
      
      // Revalidar as configurações após adicionar uma transação
      // para atualizar o contador imediatamente
      await refetchUserSettings();
      
      form.reset({
        date: new Date().toISOString().split('T')[0],
        value: "",
        description: "",
        category: "",
      });
      
    } catch (error: any) {
      // Verificar se o erro é relacionado ao limite
      if (error.message && error.message.includes("Limite de transações atingido")) {
        toast({
          title: "Limite atingido",
          description: `Você atingiu o limite de ${userSettings.transactionLimit} lançamentos no plano gratuito.`,
          variant: "destructive",
        });
        
        // Automatically redirect to the upgrade page
        navigate("/upgrade");
      } else {
        // Outros erros
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao adicionar a transação.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
        <CardDescription>
          Adicione uma nova entrada ou saída
          <TransactionLimitIndicator userSettings={userSettings} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType)} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="entrada" className="flex-1">Receita</TabsTrigger>
            <TabsTrigger value="saida" className="flex-1">Despesa</TabsTrigger>
          </TabsList>
          <TabsContent value="entrada" className="mt-0">
            <TransactionFormFields 
              form={form} 
              categories={filteredCategories} 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
              type="entrada"
            />
          </TabsContent>
          <TabsContent value="saida" className="mt-0">
            <TransactionFormFields 
              form={form} 
              categories={filteredCategories} 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting}
              type="saida"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
