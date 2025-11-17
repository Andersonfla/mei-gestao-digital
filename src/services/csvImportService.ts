import { toast } from "sonner";

export interface CSVTransaction {
  date: string;
  description: string;
  value: number;
  type: 'entrada' | 'saida';
}

export interface RecurringPattern {
  description: string;
  value: number;
  type: 'entrada' | 'saida';
  frequency: 'mensal' | 'semanal' | 'quinzenal' | 'trimestral';
  occurrences: number;
  dates: string[];
  category?: string;
}

export const csvImportService = {
  /**
   * Parse CSV file and extract transactions
   */
  parseCSV(csvContent: string): CSVTransaction[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error("Arquivo CSV vazio");
    }

    // Detectar separador (vírgula ou ponto-e-vírgula)
    const separator = csvContent.includes(';') ? ';' : ',';
    
    // Ignorar header se existir
    const hasHeader = this.isHeaderRow(lines[0], separator);
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const transactions: CSVTransaction[] = [];

    for (const line of dataLines) {
      try {
        const transaction = this.parseLine(line, separator);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        console.warn("Erro ao processar linha:", line, error);
      }
    }

    return transactions;
  },

  /**
   * Check if first row is a header
   */
  isHeaderRow(line: string, separator: string): boolean {
    const lowercaseLine = line.toLowerCase();
    return (
      lowercaseLine.includes('data') ||
      lowercaseLine.includes('date') ||
      lowercaseLine.includes('descrição') ||
      lowercaseLine.includes('description') ||
      lowercaseLine.includes('valor') ||
      lowercaseLine.includes('value')
    );
  },

  /**
   * Parse a single line of CSV
   * Expected formats:
   * - data,descrição,valor
   * - data,descrição,valor,tipo
   */
  parseLine(line: string, separator: string): CSVTransaction | null {
    const parts = line.split(separator).map(p => p.trim().replace(/"/g, ''));
    
    if (parts.length < 3) {
      return null;
    }

    const dateStr = parts[0];
    const description = parts[1];
    const valueStr = parts[2];
    const typeStr = parts[3]?.toLowerCase();

    // Parse date (support DD/MM/YYYY, YYYY-MM-DD, etc)
    const date = this.parseDate(dateStr);
    if (!date) {
      return null;
    }

    // Parse value (handle different formats: 1.234,56 or 1,234.56)
    const value = this.parseValue(valueStr);
    if (isNaN(value) || value === 0) {
      return null;
    }

    // Determine type
    let type: 'entrada' | 'saida';
    if (typeStr) {
      type = typeStr.includes('entrada') || typeStr.includes('credit') || typeStr.includes('receita') 
        ? 'entrada' 
        : 'saida';
    } else {
      // If no type specified, assume positive = entrada, negative = saida
      type = value > 0 ? 'entrada' : 'saida';
    }

    return {
      date,
      description,
      value: Math.abs(value),
      type,
    };
  },

  /**
   * Parse date string to ISO format
   */
  parseDate(dateStr: string): string | null {
    // Remove spaces
    dateStr = dateStr.trim();

    // Try DD/MM/YYYY
    const ddmmyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try YYYY-MM-DD
    const yyyymmddMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmddMatch) {
      const [, year, month, day] = yyyymmddMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try MM/DD/YYYY
    const mmddyyyyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyyMatch) {
      const [, month, day, year] = mmddyyyyMatch;
      // Assume american format if day > 12
      const parsedDay = parseInt(day);
      const parsedMonth = parseInt(month);
      if (parsedMonth > 12) {
        return `${year}-${day.padStart(2, '0')}-${month.padStart(2, '0')}`;
      }
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return null;
  },

  /**
   * Parse value string to number
   * Handles: 1.234,56 or 1,234.56 or -1234.56
   */
  parseValue(valueStr: string): number {
    // Remove currency symbols and spaces
    valueStr = valueStr.replace(/[R$\s€£¥]/g, '').trim();

    // Check if using comma as decimal separator (European format)
    if (valueStr.includes(',') && valueStr.includes('.')) {
      // Has both, determine which is decimal
      const lastComma = valueStr.lastIndexOf(',');
      const lastDot = valueStr.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // Comma is decimal: 1.234,56
        valueStr = valueStr.replace(/\./g, '').replace(',', '.');
      } else {
        // Dot is decimal: 1,234.56
        valueStr = valueStr.replace(/,/g, '');
      }
    } else if (valueStr.includes(',')) {
      // Only comma, assume it's decimal
      valueStr = valueStr.replace(',', '.');
    }

    return parseFloat(valueStr);
  },

  /**
   * Detect recurring patterns in transactions
   */
  detectRecurringPatterns(transactions: CSVTransaction[]): RecurringPattern[] {
    const patterns: RecurringPattern[] = [];
    
    // Group by description (normalized)
    const groupedByDescription = new Map<string, CSVTransaction[]>();
    
    for (const transaction of transactions) {
      const normalizedDesc = this.normalizeDescription(transaction.description);
      if (!groupedByDescription.has(normalizedDesc)) {
        groupedByDescription.set(normalizedDesc, []);
      }
      groupedByDescription.get(normalizedDesc)!.push(transaction);
    }

    // Analyze each group for patterns
    for (const [normalizedDesc, group] of groupedByDescription.entries()) {
      if (group.length < 2) continue; // Need at least 2 occurrences

      // Sort by date
      group.sort((a, b) => a.date.localeCompare(b.date));

      // Check if values are similar (within 5% tolerance)
      const avgValue = group.reduce((sum, t) => sum + t.value, 0) / group.length;
      const allSimilarValues = group.every(t => 
        Math.abs(t.value - avgValue) / avgValue < 0.05
      );

      if (!allSimilarValues) continue;

      // Calculate intervals between transactions
      const intervals: number[] = [];
      for (let i = 1; i < group.length; i++) {
        const days = this.daysBetween(group[i-1].date, group[i].date);
        intervals.push(days);
      }

      // Detect frequency based on average interval
      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
      const frequency = this.detectFrequency(avgInterval);

      if (frequency) {
        patterns.push({
          description: group[0].description,
          value: avgValue,
          type: group[0].type,
          frequency,
          occurrences: group.length,
          dates: group.map(t => t.date),
        });
      }
    }

    return patterns.sort((a, b) => b.occurrences - a.occurrences);
  },

  /**
   * Normalize description for pattern matching
   */
  normalizeDescription(description: string): string {
    return description
      .toLowerCase()
      .replace(/\d+/g, '') // Remove numbers
      .replace(/[^\w\s]/g, '') // Remove special chars
      .trim();
  },

  /**
   * Calculate days between two dates
   */
  daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Detect frequency based on average interval
   */
  detectFrequency(avgInterval: number): 'mensal' | 'semanal' | 'quinzenal' | 'trimestral' | null {
    if (avgInterval >= 6 && avgInterval <= 8) return 'semanal';
    if (avgInterval >= 13 && avgInterval <= 16) return 'quinzenal';
    if (avgInterval >= 28 && avgInterval <= 32) return 'mensal';
    if (avgInterval >= 88 && avgInterval <= 95) return 'trimestral';
    return null;
  },

  /**
   * Suggest category based on description
   */
  suggestCategory(description: string, type: 'entrada' | 'saida'): string | undefined {
    const lowerDesc = description.toLowerCase();

    if (type === 'entrada') {
      if (lowerDesc.includes('salario') || lowerDesc.includes('salário')) return 'Salário';
      if (lowerDesc.includes('freelance')) return 'Freelance';
      if (lowerDesc.includes('aluguel') || lowerDesc.includes('aluguel')) return 'Aluguel Recebido';
      return 'Outras Receitas';
    } else {
      if (lowerDesc.includes('aluguel') || lowerDesc.includes('aluguel')) return 'Moradia';
      if (lowerDesc.includes('energia') || lowerDesc.includes('luz')) return 'Energia';
      if (lowerDesc.includes('agua') || lowerDesc.includes('água')) return 'Água';
      if (lowerDesc.includes('internet') || lowerDesc.includes('telefone')) return 'Internet/Telefone';
      if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('streaming')) return 'Entretenimento';
      if (lowerDesc.includes('academia') || lowerDesc.includes('gym')) return 'Saúde';
      if (lowerDesc.includes('mercado') || lowerDesc.includes('supermercado')) return 'Alimentação';
      if (lowerDesc.includes('transporte') || lowerDesc.includes('uber') || lowerDesc.includes('gasolina')) return 'Transporte';
      return 'Outros Gastos';
    }
  },
};
