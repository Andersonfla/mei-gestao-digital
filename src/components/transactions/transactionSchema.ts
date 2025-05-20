
import { z } from "zod";

// Validation schema
export const transactionSchema = z.object({
  date: z.string().nonempty("Data é obrigatória"),
  description: z.string().optional(),
  category: z.string().nonempty("Categoria é obrigatória"),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

