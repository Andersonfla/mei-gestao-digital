
import { z } from "zod";

// Validation schema
export const transactionSchema = z.object({
  date: z.string().nonempty("Data é obrigatória"),
  value: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Valor deve ser um número positivo",
  }),
  description: z.string().optional(),
  category: z.string().nonempty("Categoria é obrigatória"),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
