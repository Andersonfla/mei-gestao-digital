
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinance } from "@/contexts/FinanceContext";

export function FilterPeriod() {
  const { filterPeriod, setFilterPeriod } = useFinance();
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtrar por:</span>
      <Select value={filterPeriod} onValueChange={(value: any) => setFilterPeriod(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecionar período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo o período</SelectItem>
          <SelectItem value="month">Mês atual</SelectItem>
          <SelectItem value="week">Última semana</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
