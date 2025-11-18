import * as XLSX from 'xlsx';

export interface ExportData {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  transactions: Array<{
    date: string | Date;
    type: string;
    category: string;
    description?: string | null;
    value: number;
  }>;
  startDate: Date;
  endDate: Date;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: ExportData): void {
  const rows = [
    // Header
    ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor'],
    // Transactions
    ...data.transactions.map(t => [
      typeof t.date === 'string' ? t.date : t.date.toLocaleDateString('pt-BR'),
      t.type === 'entrada' ? 'Entrada' : 'Saída',
      t.category,
      t.description || '',
      t.value.toFixed(2)
    ]),
    // Summary
    [],
    ['RESUMO'],
    ['Total de Entradas', '', '', '', data.totalIncome.toFixed(2)],
    ['Total de Saídas', '', '', '', data.totalExpense.toFixed(2)],
    ['Lucro/Prejuízo', '', '', '', data.profit.toFixed(2)],
    ['Margem de Lucro', '', '', '', `${data.profitMargin.toFixed(2)}%`]
  ];

  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio-${data.endDate.toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel format (.xlsx)
 */
export function exportToExcel(data: ExportData): void {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Prepare transactions data
  const transactionsData = data.transactions.map(t => ({
    'Data': typeof t.date === 'string' ? t.date : t.date.toLocaleDateString('pt-BR'),
    'Tipo': t.type === 'entrada' ? 'Entrada' : 'Saída',
    'Categoria': t.category,
    'Descrição': t.description || '',
    'Valor': t.value
  }));
  
  // Create transactions sheet
  const ws = XLSX.utils.json_to_sheet(transactionsData);
  
  // Add summary data
  const summaryStartRow = transactionsData.length + 2;
  XLSX.utils.sheet_add_aoa(ws, [
    [],
    ['RESUMO FINANCEIRO'],
    ['Total de Entradas', data.totalIncome],
    ['Total de Saídas', data.totalExpense],
    ['Lucro/Prejuízo', data.profit],
    ['Margem de Lucro (%)', data.profitMargin]
  ], { origin: `A${summaryStartRow}` });
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Data
    { wch: 10 }, // Tipo
    { wch: 20 }, // Categoria
    { wch: 30 }, // Descrição
    { wch: 12 }  // Valor
  ];
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Financeiro');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `relatorio-${data.endDate.toISOString().split('T')[0]}.xlsx`);
}
