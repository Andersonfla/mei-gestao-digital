
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useFinance } from "@/contexts/FinanceContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionType } from "@/types/finance";
import { useNavigate } from "react-router-dom";

// Validation schema
const transactionSchema = z.object({
  date: z.string().nonempty("Data é obrigatória"),
  value: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Valor deve ser um número positivo",
  }),
  description: z.string().optional(),
  category: z.string().nonempty("Categoria é obrigatória"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function TransactionForm() {
  const { categories, addTransaction, userSettings } = useFinance();
  const { toast } = useToast();
  const navigate = useNavigate();
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
    if (userSettings.plan === 'free' && 
        userSettings.transactionCountThisMonth >= userSettings.transactionLimit) {
      toast({
        title: "Limite atingido",
        description: `Você atingiu o limite de ${userSettings.transactionLimit} lançamentos no plano gratuito.`,
        variant: "destructive",
      });
      
      // Automatically redirect to the upgrade page
      navigate("/upgrade");
      return;
    }
    
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

  const remainingTransactions = userSettings.plan === 'free'
    ? userSettings.transactionLimit - userSettings.transactionCountThisMonth
    : null;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Nova Transação</CardTitle>
        <CardDescription>
          Adicione uma nova entrada ou saída
          {remainingTransactions !== null && remainingTransactions >= 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              Restam {remainingTransactions} lançamentos no seu plano gratuito
            </div>
          )}
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

type TransactionFormFieldsProps = {
  form: any;
  categories: any[];
  onSubmit: (data: TransactionFormValues) => void;
  isSubmitting: boolean;
  type: TransactionType;
};

function TransactionFormFields({ form, categories, onSubmit, isSubmitting, type }: TransactionFormFieldsProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0,00"
                    step="0.01"
                    min="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={type === 'entrada' ? "Ex: Venda de produto" : "Ex: Material de escritório"} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
