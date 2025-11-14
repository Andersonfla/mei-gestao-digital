import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/types/finance';
import { formatCurrency } from './formatters';

interface ReportData {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  transactions: Transaction[];
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export const exportReportToPDF = (data: ReportData) => {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;
  let yPosition = 20;
  
  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Financeiro', pageWidth / 2, yPosition, { align: 'center' });
  
  // Período
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const periodText = `Período: ${data.period.startDate.toLocaleDateString('pt-BR')} - ${data.period.endDate.toLocaleDateString('pt-BR')}`;
  doc.text(periodText, pageWidth / 2, yPosition, { align: 'center' });
  
  // Resumo Financeiro
  yPosition += 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Tabela de resumo
  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: [
      ['Total de Receitas', formatCurrency(data.totalIncome)],
      ['Total de Despesas', formatCurrency(data.totalExpense)],
      ['Lucro/Prejuízo', formatCurrency(data.profit)],
      ['Margem de Lucro', `${data.profitMargin.toFixed(2)}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
  });
  
  // Transações Detalhadas
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transações Detalhadas', margin, yPosition);
  
  yPosition += 5;
  
  // Preparar dados das transações
  const transactionsData = data.transactions.map(t => [
    new Date(t.date).toLocaleDateString('pt-BR'),
    t.description || '-',
    t.category,
    t.type === 'entrada' ? 'Receita' : 'Despesa',
    `${t.type === 'entrada' ? '+' : '-'}${formatCurrency(t.value)}`,
  ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
    body: transactionsData.length > 0 ? transactionsData : [['Nenhuma transação encontrada', '', '', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 35, halign: 'right' },
    },
    styles: { fontSize: 9 },
  });
  
  // Rodapé
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Nome do arquivo
  const month = data.period.endDate.getMonth() + 1;
  const year = data.period.endDate.getFullYear();
  const fileName = `relatorio_financeiro_${month.toString().padStart(2, '0')}_${year}.pdf`;
  
  // Download
  doc.save(fileName);
};
