import { BradescoExtraido, FaturamentoExtraido, FormaPagamento, PagBankExtraido, VendaExtraida } from "./types";

function toNumberBR(raw: string): number {
  const clean = raw
    .replace(/R\$\s?/gi, "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(clean);
}

function dateBRtoISO(dataBR: string, ano?: string): string {
  const [dd, mm, yyyy] = dataBR.split("/");
  const year = yyyy ?? ano ?? String(new Date().getFullYear());
  return `${year}-${mm}-${dd}`;
}

const FORMAS_CONHECIDAS: FormaPagamento[] = ["CARTAO DE CREDITO", "CARTAO DE DEBITO", "DINHEIRO", "PIX", "BOLETO", "TRANSFERENCIA"];

// ---------- Relatório de Faturamento (relatório "Vendas do período") ----------
export function parseFaturamento(text: string): FaturamentoExtraido {
  const antesDoResumo = text.split(/Vendas:\s*\d+/)[0];

  const headerRe = /(\d{2}\/\d{2}\/\d{4})\s+(\S+)\s+([\d.,]+)\s+(\d{2}:\d{2}:\d{2})\s+NFCe/g;
  const formaRe = new RegExp(`Forma de pagamento:\\s+([\\d.,]+)\\s+(${FORMAS_CONHECIDAS.join("|")})`, "g");

  const headers = [...antesDoResumo.matchAll(headerRe)].map((m) => ({
    data: dateBRtoISO(m[1]),
    vendedor: m[2],
    valor: toNumberBR(m[3]),
    hora: m[4],
  }));
  const formas = [...antesDoResumo.matchAll(formaRe)].map((m) => ({
    valor: toNumberBR(m[1]),
    forma: m[2] as FormaPagamento,
  }));

  const vendas: VendaExtraida[] = headers.map((h, i) => ({
    ...h,
    forma: formas[i]?.forma ?? "OUTROS",
  }));

  const totalPorForma: Record<string, number> = {};
  for (const v of vendas) {
    totalPorForma[v.forma] = Math.round(((totalPorForma[v.forma] ?? 0) + v.valor) * 100) / 100;
  }
  const totalGeral = Math.round(vendas.reduce((a, v) => a + v.valor, 0) * 100) / 100;

  return { vendas, totalPorForma, totalGeral };
}

// ---------- Extrato PagBank ----------
export function parsePagBank(text: string): PagBankExtraido {
  const re = /(\d{2}\/\d{2}\/\d{4})\s+Servi[cç]os financeiros - (.+?)\s+(-?R\$\s?[\d.,]+)/g;
  const movimentos = [...text.matchAll(re)].map((m) => ({
    data: dateBRtoISO(m[1]),
    descricao: m[2].trim(),
    valor: toNumberBR(m[3]),
  }));
  return { movimentos };
}

// ---------- Extrato Bradesco (PDF texto ou imagem via OCR) ----------
// Estrutura observada: marcadores de data "DD/MM" seguidos de um ou mais lançamentos
// (histórico + valor, às vezes com "Docto NNNNNN" no meio). Como o texto pode vir de OCR
// (imperfeito), o parser é tolerante: usa os valores monetários como âncora e associa o
// texto entre dois valores como histórico, carregando a última data vista.
//
// PIX RECEBIDO é tratado à parte porque o histórico traz a própria data no final
// ("REM: Fulano 05/08") — se não for extraído antes, esse "05/08" embutido é confundido
// com um novo marcador de data pelo parser genérico e o lançamento inteiro se perde.
export function parseBradesco(text: string, anoReferencia: string): BradescoExtraido {
  const pixRe = /PIX RECEBIDO\s+REM:?\s*(.+?)\s+(\d{2}\/\d{2})\s*(?:Docto\s*\d+)?\s*([\d.,]+)/g;
  const movimentos: { data: string; historico: string; valor: number }[] = [...text.matchAll(pixRe)].map((m) => ({
    data: dateBRtoISO(`${m[2]}/${anoReferencia}`),
    historico: `PIX RECEBIDO - ${m[1].trim()}`,
    valor: toNumberBR(m[3]),
  }));
  const remaining = text.replace(pixRe, "");

  const tokenRe = /(\d{2}\/\d{2})(?!\d)|(-?(?:R\$)?\s?\d{1,3}(?:\.\d{3})*,\d{2})/g;
  const tokens = [...remaining.matchAll(tokenRe)];

  let dataAtual: string | null = null;
  let cursor = 0;

  for (const tok of tokens) {
    const isData = !!tok[1];
    if (isData) {
      dataAtual = dateBRtoISO(`${tok[1]}/${anoReferencia}`);
      cursor = (tok.index ?? 0) + tok[0].length;
      continue;
    }
    // é um valor monetário
    const valorStr = tok[2]!;
    const valorIdx = tok.index ?? 0;
    const historicoRaw = remaining.slice(cursor, valorIdx);
    cursor = valorIdx + tok[0].length;

    const historico = historicoRaw
      .replace(/Docto\s*\d+/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!historico || /saldo\s*(anterior|total)/i.test(historico) || /^\d+([.,]\d+)?$/.test(historico)) continue;
    if (!dataAtual) continue;

    movimentos.push({ data: dataAtual, historico, valor: toNumberBR(valorStr) });
  }

  movimentos.sort((a, b) => a.data.localeCompare(b.data));
  return { movimentos, viaOcr: false };
}
