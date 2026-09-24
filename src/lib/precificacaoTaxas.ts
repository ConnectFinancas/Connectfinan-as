// Tabelas de taxa por plataforma, usadas pro preenchimento automático de "Comissão Plataforma
// (%)" e "Taxa Fixa por Venda (R$)" na Calculadora de Precificação. Marketplace muda taxa sem
// aviso — trate como ponto de partida editável, não como fonte de verdade; confira sempre na
// Central do Vendedor antes de decisões importantes.
export const TAXAS_CONFERIDAS_EM = "24/09/2026";

export type Plataforma = "shopee" | "tiktok";

export type FaixaTaxa = { comissaoPct: number; taxaFixa: number };

// Shopee — desde mar/2026 todos os vendedores estão no Programa de Frete Grátis (obrigatório),
// com uma única tabela por faixa de preço do produto, sem teto de comissão. A comissão por faixa
// já soma a taxa de serviço de pagamento (~2% sobre produto + frete) que a Shopee cobra à parte.
const TAXA_SERVICO_PAGAMENTO_SHOPEE = 2;

function faixaShopee(preco: number): FaixaTaxa {
  if (preco < 8) return { comissaoPct: 50, taxaFixa: 0 };
  if (preco < 80) return { comissaoPct: 20, taxaFixa: 4 };
  if (preco < 100) return { comissaoPct: 14, taxaFixa: 16 };
  if (preco < 200) return { comissaoPct: 14, taxaFixa: 20 };
  return { comissaoPct: 14, taxaFixa: 26 };
}

export function taxasAutomaticas(plataforma: Plataforma, preco: number): FaixaTaxa {
  if (plataforma === "shopee") {
    const faixa = faixaShopee(preco);
    return { comissaoPct: faixa.comissaoPct + TAXA_SERVICO_PAGAMENTO_SHOPEE, taxaFixa: faixa.taxaFixa };
  }
  // TikTok Shop — Programa de Frete Grátis: comissão fixa de 6% sobre o valor do produto,
  // independente do preço, sem taxa fixa por venda separada (regras de jul/2026).
  return { comissaoPct: 6, taxaFixa: 0 };
}

export const PLATAFORMA_LABEL: Record<Plataforma, string> = {
  shopee: "Shopee",
  tiktok: "TikTok Shop",
};
