
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useFinance } from "@/contexts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionType } from "@/types/finance";
import { TransactionFormFields } from "./TransactionFormFields";
import { TransactionLimitIndicator } from "./TransactionLimitIndicator";
import { TransactionFormValues, transactionSchema } from "./transactionSchema";

export function TransactionForm() {
  const { categories, addTransaction, userSettings } = useFinance();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TransactionType>("entrada");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        user_id: '', // This will be set automatically by the backend
        date: data.date,
        value: parseFloat(data.value),
        description: data.description || null,
        category: data.category,
        type: activeTab,
      };
      
      await addTransaction(newTransaction);
      form.reset({
        date: new Date().toISOString().split('T')[0],
        value: "",
        description: "",
        category: "",
      });
      
    } catch (error) {
      // Error handling is done in the mutation
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
