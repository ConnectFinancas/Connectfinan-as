export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function formatCurrencyPrecise(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatCompact(value: number): string {
  return value.toLocaleString("pt-BR", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });
}

// Inverso de formatCurrencyPrecise: lê um texto de valor digitado no formato brasileiro (ponto de
// milhar, vírgula decimal — ex.: "1.234,56") e devolve o número que ele representa. Trocar só a
// vírgula por ponto (sem remover o ponto de milhar primeiro) quebra qualquer valor acima de 999 —
// "1.500,00" viraria "1.500.00" (NaN) — por isso os dois passos, nessa ordem.
export function parseValorBR(raw: string): number {
  return Number(raw.trim().replace(/\./g, "").replace(",", "."));
}
