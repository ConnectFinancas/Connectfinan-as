// Data de referência do painel (ano fiscal simulado da M4 Logística).
// Fixa para manter os indicadores de atraso consistentes com os dados de exemplo.
export const HOJE = new Date(2026, 7, 6); // 06/08/2026

export function parseISO(date: string): Date {
  return new Date(date + "T00:00:00");
}

export function isVencido(vencimento: string): boolean {
  return parseISO(vencimento).getTime() < HOJE.getTime();
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addMonths(dateISO: string, n: number): string {
  const d = parseISO(dateISO);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const lastDayOfTarget = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDayOfTarget));
  return toISO(target);
}

export function formatDateBR(dateISO: string): string {
  return parseISO(dateISO).toLocaleDateString("pt-BR");
}
