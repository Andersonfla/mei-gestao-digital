
// Format a number as currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Format date to Brazilian format
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}
