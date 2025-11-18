
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
  const { categories, addTransaction, userSettings, refetchUserSettings, isPremiumCategory } = useFinance();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TransactionType>("entrada");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Revalidar configurações do usuário quando o componente montar
  useEffect(() => {
    refetchUserSettings();
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
      await refetchUserSettings();
      
      form.reset({
        date: new Date().toISOString().split('T')[0],
        value: "",
        description: "",
        category: "",
      });
      
    } catch (error: any) {
      console.error("Erro ao adicionar transação:", error);
      
      // Verificar se o erro é relacionado ao limite
      if (error.message && error.message.includes("Limite de transações atingido")) {
        toast({
          title: "Limite atingido",
          description: `Você atingiu o limite de ${userSettings.transactionLimit} lançamentos no plano gratuito.`,
          variant: "destructive",
        });
        
        // Automaticamente redirecionar para a página de upgrade
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
    <Card className="w-full max-w-full box-border mx-auto backdrop-blur-sm border-border/50" style={{ width: '100%', maxWidth: '100%' }}>
      <CardHeader className="w-full" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <CardTitle className="text-2xl w-full">Nova Transação</CardTitle>
        <CardDescription className="text-base w-full">
          Adicione uma nova entrada ou saída
        </CardDescription>
        <TransactionLimitIndicator userSettings={userSettings} />
      </CardHeader>
      <CardContent className="w-full box-border p-4 sm:p-6" style={{ width: '100%', maxWidth: '100%' }}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType)} className="w-full">
          <TabsList className="w-full mb-6 grid grid-cols-2 h-12">
            <TabsTrigger value="entrada" className="text-base font-medium data-[state=active]:bg-success data-[state=active]:text-white">Receita</TabsTrigger>
            <TabsTrigger value="saida" className="text-base font-medium data-[state=active]:bg-destructive data-[state=active]:text-white">Despesa</TabsTrigger>
          </TabsList>
          <TabsContent value="entrada" className="mt-0">
            <TransactionFormFields 
              form={form} 
              categories={filteredCategories} 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting} 
              type="entrada"
              isPremiumCategory={isPremiumCategory}
            />
          </TabsContent>
          <TabsContent value="saida" className="mt-0">
            <TransactionFormFields 
              form={form} 
              categories={filteredCategories} 
              onSubmit={onSubmit} 
              isSubmitting={isSubmitting}
              type="saida"
              isPremiumCategory={isPremiumCategory}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
