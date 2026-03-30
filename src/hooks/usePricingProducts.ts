import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pricingProductService } from "@/services/pricingProductService";
import type { PricingProductFormData } from "@/types/pricing";
import { toast } from "sonner";

export function usePricingProducts() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["pricing-products"],
    queryFn: pricingProductService.getProducts,
  });

  const createMutation = useMutation({
    mutationFn: (data: PricingProductFormData) => pricingProductService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar produto"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PricingProductFormData> }) =>
      pricingProductService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-products"] });
      toast.success("Produto atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar produto"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pricingProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-products"] });
      toast.success("Produto excluído!");
    },
    onError: () => toast.error("Erro ao excluir produto"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      pricingProductService.toggleProductActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-products"] });
    },
    onError: () => toast.error("Erro ao alterar status"),
  });

  return {
    products,
    isLoading,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    toggleActive: toggleActiveMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
