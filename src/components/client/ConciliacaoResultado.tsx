"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Unlink,
  X,
} from "lucide-react";
import { ResultadoConciliacao } from "@/lib/reconciliation/match";
import { ResultadoSalvo } from "@/lib/reconciliation/historicoStore";
import { LancamentoModal } from "@/components/client/LancamentoModal";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";

// ---------- Modelo de dados: cada seção tem uma lista de linhas pareadas (sistema x banco) ----------

type Lado = {
  rotulo: string;
  descricao: string;
  valor: number;
  data?: string;
  hora?: string;
};

type Linha = {
  chave: string;
  // esquerda = sempre o lado do sistema (venda faturada, lançamento existente, ou em branco pra criar)
  esquerda: Lado | null;
  // direita = sempre o lado do banco/extrato (PagBank, caixa físico, Bradesco)
  direita: Lado | null;
  jaMigrado: boolean;
  isTransferencia?: boolean;
  // true nas linhas de pagamento (PagBank/Caixa/Bradesco) que podem ser reclassificadas
  // manualmente como transferência entre contas próprias, via o botão "Marcar como transferência".
  podeVirarTransferencia?: boolean;
  correcaoBanco?: { tipo: "pix" | "dinheiro" | "cartaoVenda"; index: number; matchInfoAtual?: string };
  correcaoPagamento?: { index: number };
  criarLancamento?: {
    tipo: "pagar" | "receber";
    pessoa?: string;
    descricao: string;
    classificacao?: string;
    categoria?: string;
    conta?: string;
    valor: number;
    vencimento: string;
  };
};

type Secao = {
  id: string;
  titulo: string;
  subtitulo: string;
  linhas: Linha[];
};

function StatusPill({ jaMigrado, temMatch, isTransferencia }: { jaMigrado: boolean; temMatch: boolean; isTransferencia?: boolean }) {
  if (jaMigrado) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-medium text-accent-500">
        <Check size={11} /> Conciliado
      </span>
    );
  }
  if (isTransferencia) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">
        Transferência
      </span>
    );
  }
  if (temMatch) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-client-accent/10 px-2 py-0.5 text-[11px] font-medium text-client-accent">
        Pronto pra conciliar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warn-100 px-2 py-0.5 text-[11px] font-medium text-warn-500">
      <AlertTriangle size={11} /> Pendente
    </span>
  );
}

function CaixaLado({ lado, placeholder }: { lado: Lado | null; placeholder: string }) {
  if (!lado) return <p className="text-xs text-faint">{placeholder}</p>;
  return (
    <>
      <p className="truncate text-sm text-brand-900">{lado.descricao}</p>
      <p className="mt-0.5 text-xs tabular-nums text-muted">
        {formatCurrencyPrecise(lado.valor)}
        {lado.hora && <span className="text-faint"> · {lado.hora}</span>}
        {lado.data && <span className="text-faint"> · {formatDateBR(lado.data)}</span>}
      </p>
    </>
  );
}

function LinhaConciliacao({
  linha,
  secaoId,
  ordemNatural,
  onConciliar,
  onDesvincular,
  onExcluir,
  onDesfazer,
  onMarcarTransferencia,
  onEditarItem,
  onEditarPagamentoBanco,
  onLancado,
  onReordenar,
}: {
  linha: Linha;
  secaoId: string;
  ordemNatural: string[];
  onConciliar?: (chave: string) => void;
  onDesvincular?: (chave: string) => void;
  onExcluir?: (chave: string) => void;
  onDesfazer?: (chave: string) => void;
  onMarcarTransferencia?: (chave: string) => void;
  onEditarItem?: (
    tipo: "pix" | "dinheiro" | "cartaoVenda" | "pagamento",
    index: number,
    patch: { status?: "conciliado" | "pendente"; matchInfo?: string }
  ) => void;
  onEditarPagamentoBanco?: (index: number, patch: { historico?: string; valor?: number }) => void;
  onLancado?: (chave: string) => void;
  onReordenar?: (secao: string, ordemNatural: string[], chaveA: string, chaveB: string) => void;
}) {
  const [editandoTexto, setEditandoTexto] = useState(false);
  const [rascunho, setRascunho] = useState(linha.correcaoBanco?.matchInfoAtual ?? "");
  const [editandoPagamento, setEditandoPagamento] = useState(false);
  const [rascunhoDescricao, setRascunhoDescricao] = useState(linha.direita?.descricao ?? "");
  const [rascunhoValor, setRascunhoValor] = useState(linha.direita ? String(linha.direita.valor).replace(".", ",") : "");
  const [lancarAberto, setLancarAberto] = useState(false);
  const [arrastandoSobre, setArrastandoSobre] = useState(false);

  const temMatch = !!linha.esquerda && !!linha.direita;

  function salvarTexto() {
    if (!linha.correcaoBanco || !onEditarItem) return;
    onEditarItem(linha.correcaoBanco.tipo, linha.correcaoBanco.index, {
      matchInfo: rascunho,
      status: rascunho.trim() ? "conciliado" : "pendente",
    });
    setEditandoTexto(false);
  }

  function salvarPagamento() {
    if (!linha.correcaoPagamento || !onEditarPagamentoBanco) return;
    const valorNum = Number(rascunhoValor.replace(",", "."));
    onEditarPagamentoBanco(linha.correcaoPagamento.index, {
      historico: rascunhoDescricao.trim() || undefined,
      valor: valorNum > 0 ? valorNum : undefined,
    });
    setEditandoPagamento(false);
  }

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", linha.chave)}
      onDragOver={(e) => {
        e.preventDefault();
        setArrastandoSobre(true);
      }}
      onDragLeave={() => setArrastandoSobre(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastandoSobre(false);
        const origem = e.dataTransfer.getData("text/plain");
        if (origem && origem !== linha.chave) onReordenar?.(secaoId, ordemNatural, origem, linha.chave);
      }}
      className={`card p-4 transition-shadow ${arrastandoSobre ? "ring-2 ring-client-accent" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex cursor-grab items-center gap-1.5 text-faint active:cursor-grabbing" title="Arraste pra trocar de posição">
          <GripVertical size={13} />
          <span className="text-[11px]">{linha.esquerda?.rotulo ?? linha.direita?.rotulo}</span>
        </div>
        <StatusPill jaMigrado={linha.jaMigrado} temMatch={temMatch} isTransferencia={linha.isTransferencia} />
      </div>

      <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        {/* Esquerda: sistema (venda / lançamento existente / criar novo) */}
        <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-faint">Sistema</p>
          {linha.esquerda ? (
            <CaixaLado lado={linha.esquerda} placeholder="" />
          ) : linha.criarLancamento && !linha.jaMigrado ? (
            <>
              <p className="text-xs text-faint">Nenhum lançamento encontrado no sistema</p>
              <button
                onClick={() => setLancarAberto(true)}
                className="mt-1.5 flex items-center gap-1 rounded-lg border border-client-accent px-2.5 py-1.5 text-[11px] font-semibold text-client-accent hover:bg-client-accent/10 transition-colors"
              >
                <Plus size={11} />
                Criar novo lançamento
              </button>
            </>
          ) : (
            <p className="text-xs text-faint">—</p>
          )}
        </div>

        {/* Botão central */}
        <div className="flex items-center justify-center">
          {linha.jaMigrado ? (
            <Check size={18} className="text-accent-500" />
          ) : temMatch ? (
            <button
              onClick={() => onConciliar?.(linha.chave)}
              className="rounded-lg bg-client-accent px-4 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
            >
              Conciliar
            </button>
          ) : (
            <ArrowRight size={16} className="text-faint" />
          )}
        </div>

        {/* Direita: banco (PagBank / Caixa físico / Bradesco) */}
        <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-faint">Banco</p>
          {linha.correcaoBanco && editandoTexto ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                placeholder="Descreva onde foi encontrado"
                className="w-full rounded-md border border-border-subtle bg-white px-2 py-1 text-xs text-brand-900 placeholder:text-faint"
              />
              <button onClick={salvarTexto} className="shrink-0 text-accent-500 hover:text-accent-600">
                <Check size={14} />
              </button>
              <button onClick={() => setEditandoTexto(false)} className="shrink-0 text-faint hover:text-danger-500">
                <X size={14} />
              </button>
            </div>
          ) : linha.correcaoPagamento && editandoPagamento ? (
            <div className="flex flex-col gap-1.5">
              <input
                autoFocus
                value={rascunhoDescricao}
                onChange={(e) => setRascunhoDescricao(e.target.value)}
                placeholder="Descrição do lançamento"
                className="w-full rounded-md border border-border-subtle bg-white px-2 py-1 text-xs text-brand-900 placeholder:text-faint"
              />
              <div className="flex items-center gap-1.5">
                <input
                  inputMode="decimal"
                  value={rascunhoValor}
                  onChange={(e) => setRascunhoValor(e.target.value)}
                  placeholder="Valor (ex.: 1200,00)"
                  className="w-full rounded-md border border-border-subtle bg-white px-2 py-1 text-xs text-brand-900 placeholder:text-faint"
                />
                <button onClick={salvarPagamento} className="shrink-0 text-accent-500 hover:text-accent-600">
                  <Check size={14} />
                </button>
                <button onClick={() => setEditandoPagamento(false)} className="shrink-0 text-faint hover:text-danger-500">
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <CaixaLado lado={linha.direita} placeholder="Ainda não encontrado no banco" />
              {linha.correcaoBanco && !linha.jaMigrado && (
                <button
                  onClick={() => {
                    setRascunho(linha.correcaoBanco!.matchInfoAtual ?? "");
                    setEditandoTexto(true);
                  }}
                  className="mt-1 text-[11px] font-medium text-client-accent hover:underline"
                >
                  {linha.direita ? "Corrigir" : "Buscar / informar manualmente"}
                </button>
              )}
              {linha.correcaoPagamento && !linha.jaMigrado && (
                <button
                  onClick={() => {
                    setRascunhoDescricao(linha.direita?.descricao ?? "");
                    setRascunhoValor(linha.direita ? String(linha.direita.valor).replace(".", ",") : "");
                    setEditandoPagamento(true);
                  }}
                  className="mt-1 text-[11px] font-medium text-client-accent hover:underline"
                >
                  Corrigir leitura
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {!linha.jaMigrado && (
        <div className="mt-2 flex justify-end">
          {temMatch && !linha.isTransferencia && (
            <button
              onClick={() => onDesvincular?.(linha.chave)}
              className="flex items-center gap-1 text-[11px] font-medium text-faint hover:text-warn-500 transition-colors"
              title="Desfaz essa correspondência"
            >
              <Unlink size={11} />
              Desvincular
            </button>
          )}
          {linha.podeVirarTransferencia && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Marcar esse lançamento como transferência entre contas da própria empresa? Ele deixa de virar um lançamento em Contas a Pagar e passa a aparecer na aba Contas."
                  )
                )
                  onMarcarTransferencia?.(linha.chave);
              }}
              className={`flex items-center gap-1 text-[11px] font-medium text-faint hover:text-client-accent transition-colors ${temMatch ? "ml-3" : ""}`}
              title="Reclassifica como transferência entre contas próprias"
            >
              <ArrowLeftRight size={11} />
              Marcar como transferência
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm("Excluir esse lançamento da conciliação? Ele não vai mais aparecer aqui.")) onExcluir?.(linha.chave);
            }}
            className={`flex items-center gap-1 text-[11px] font-medium text-faint hover:text-danger-500 transition-colors ${temMatch || linha.podeVirarTransferencia ? "ml-3" : ""}`}
            title="Exclui esse lançamento da conciliação"
          >
            <Trash2 size={11} />
            Excluir
          </button>
        </div>
      )}
      {linha.jaMigrado && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => onDesfazer?.(linha.chave)}
            className="flex items-center gap-1 text-[11px] font-medium text-faint hover:text-warn-500 transition-colors"
            title="Desfaz essa conciliação — remove o lançamento se ele foi criado por aqui"
          >
            <RotateCcw size={11} />
            Desfazer conciliação
          </button>
        </div>
      )}

      {lancarAberto && linha.criarLancamento && (
        <LancamentoModal
          tipo={linha.criarLancamento.tipo}
          onClose={() => setLancarAberto(false)}
          onSaved={() => {
            onLancado?.(linha.chave);
            setLancarAberto(false);
          }}
          prefill={{
            pessoa: linha.criarLancamento.pessoa,
            conta: linha.criarLancamento.conta,
            descricao: linha.criarLancamento.descricao,
            classificacao: linha.criarLancamento.classificacao,
            categoria: linha.criarLancamento.categoria,
            valor: linha.criarLancamento.valor,
            vencimento: linha.criarLancamento.vencimento,
            status: "pago",
            dataPagamento: linha.criarLancamento.vencimento,
          }}
        />
      )}
    </div>
  );
}

// Rótulos padrão (MJ Prime) — usados quando o chamador não passa "bankLabels", pra manter o
// comportamento de sempre sem precisar mexer nos outros clientes que já usam esse componente.
const DEFAULT_BANK_LABELS: BankLabels = {
  cartao: "PagBank",
  extrato: "Bradesco",
  origemLabels: { bradesco: "Bradesco", pagbank: "PagBank", caixa: "Caixa Físico" },
  origemOrdem: ["pagbank", "caixa", "bradesco"],
};

export type BankLabels = {
  /** Nome do banco/maquineta que recebe o cartão (seção "Recebimentos de Cartão"). */
  cartao: string;
  /** Artigo pra "recebido _ {cartao}" — "no" (PagBank, Banco do Brasil) ou "na" (Stone). Padrão "no". */
  cartaoArtigo?: string;
  /** Nome do banco do pix/extrato (seção "Recebimentos via Pix"). */
  extrato: string;
  /** Artigo pra "identificado _ {extrato}" — mesma ideia de cartaoArtigo. Padrão "no". */
  extratoArtigo?: string;
  /** origem (chave de PagamentoConciliacao) -> nome de exibição. */
  origemLabels: Record<string, string>;
  /** Ordem fixa das seções "Pagamentos do <banco>" — só aparecem se tiverem lançamento. */
  origemOrdem: string[];
  /** origem -> artigo usado no título ("do"/"da"), pra "Pagamentos da Stone" em vez de "Pagamentos do Stone". */
  origemArtigo?: Record<string, string>;
  /** true quando a taxa da maquineta já vem discriminada no relatório (Stone/MJ Shoes) em vez de
   * ser calculada por diferença entre bruto e recebido (PagBank/MJ Prime) — só muda o texto. */
  taxaDoRelatorio?: boolean;
};

export function ConciliacaoResultado({
  resultado,
  datas,
  dataSelecionada,
  bankLabels,
  onNavegar,
  onEditarItem,
  onLancado,
  onConciliar,
  onDesvincular,
  onExcluir,
  onDesfazer,
  onMarcarTransferencia,
  onEditarPagamentoBanco,
  onReordenar,
  taxasCartaoPendentes,
  onConfirmarTaxaAgregada,
  onDesfazerTaxaAgregada,
}: {
  resultado: ResultadoConciliacao | ResultadoSalvo;
  datas?: string[];
  dataSelecionada?: string;
  bankLabels?: BankLabels;
  onNavegar?: (data: string) => void;
  onEditarItem?: (
    tipo: "pix" | "dinheiro" | "cartaoVenda" | "pagamento",
    index: number,
    patch: { status?: "conciliado" | "pendente"; matchInfo?: string }
  ) => void;
  onEditarPagamentoBanco?: (index: number, patch: { historico?: string; valor?: number }) => void;
  onLancado?: (chave: string) => void;
  onConciliar?: (chave: string) => void;
  onDesvincular?: (chave: string) => void;
  onExcluir?: (chave: string) => void;
  onDesfazer?: (chave: string) => void;
  onMarcarTransferencia?: (chave: string) => void;
  onReordenar?: (secao: string, ordemNatural: string[], chaveA: string, chaveB: string) => void;
  taxasCartaoPendentes: { chave: string; hora?: string; taxa: number }[];
  onConfirmarTaxaAgregada?: () => void;
  onDesfazerTaxaAgregada?: () => void;
}) {
  const labels = bankLabels ?? DEFAULT_BANK_LABELS;
  const migrados = "migrados" in resultado ? resultado.migrados ?? {} : {};
  const arquivados = "arquivados" in resultado ? resultado.arquivados ?? [] : [];
  const ignorados = "ignorados" in resultado ? resultado.ignorados ?? [] : [];
  const ordens = "ordens" in resultado ? resultado.ordens ?? {} : {};
  const atualizadoEm = "atualizadoEm" in resultado ? resultado.atualizadoEm : undefined;

  const [busca, setBusca] = useState("");

  const { cartaoVendas = [], pix, dinheiro, pagamentos } = resultado;

  const secoes: Secao[] = useMemo(() => {
    const secCartao: Linha[] = cartaoVendas.map((item, i) => {
      const chave = `cartaoVenda-${i}`;
      const esquerda: Lado | null =
        item.vendaValor !== undefined ? { rotulo: "Cartão", descricao: `Venda Cartão${item.vendaHora ? ` · ${item.vendaHora}` : ""}`, valor: item.vendaValor, hora: item.vendaHora } : null;
      const direita: Lado | null = item.match
        ? { rotulo: labels.cartao, descricao: item.matchInfo || item.match.descricao, valor: item.match.valor, data: item.match.data }
        : item.matchInfo
          ? { rotulo: labels.cartao, descricao: item.matchInfo, valor: item.vendaValor ?? 0 }
          : null;
      return {
        chave,
        esquerda,
        direita,
        jaMigrado: !!migrados[chave],
        correcaoBanco: { tipo: "cartaoVenda", index: i, matchInfoAtual: item.matchInfo || item.match?.descricao },
        criarLancamento:
          !esquerda && direita
            ? { tipo: "receber", descricao: `Recebimento identificado ${labels.cartaoArtigo ?? "no"} ${labels.cartao} (cartão)`, classificacao: "Faturamento", categoria: "Faturamento Geral", valor: direita.valor, vencimento: direita.data || resultado.data }
            : undefined,
      };
    });

    const secDinheiro: Linha[] = dinheiro.map((item, i) => {
      const chave = `dinheiro-${i}`;
      const esquerda: Lado | null =
        item.vendaValor !== undefined ? { rotulo: "Dinheiro", descricao: `Venda Dinheiro${item.vendaHora ? ` · ${item.vendaHora}` : ""}`, valor: item.vendaValor, hora: item.vendaHora } : null;
      const direita: Lado | null = item.match
        ? { rotulo: "Caixa físico", descricao: item.matchInfo || item.match.historico, valor: item.match.entrada ?? 0, data: item.match.data }
        : item.matchInfo
          ? { rotulo: "Caixa físico", descricao: item.matchInfo, valor: item.vendaValor ?? 0 }
          : null;
      return {
        chave,
        esquerda,
        direita,
        jaMigrado: !!migrados[chave],
        correcaoBanco: { tipo: "dinheiro", index: i, matchInfoAtual: item.matchInfo || item.match?.historico },
        criarLancamento:
          !esquerda && direita
            ? { tipo: "receber", descricao: `Recebimento identificado no caixa físico`, classificacao: "Faturamento", categoria: "Faturamento Geral", valor: direita.valor, vencimento: direita.data || resultado.data }
            : undefined,
      };
    });

    const secPix: Linha[] = pix.map((item, i) => {
      const chave = `pix-${i}`;
      const esquerda: Lado | null =
        item.vendaValor !== undefined ? { rotulo: "Pix", descricao: `Venda Pix${item.vendaHora ? ` · ${item.vendaHora}` : ""}`, valor: item.vendaValor, hora: item.vendaHora } : null;
      const direita: Lado | null = item.match
        ? { rotulo: labels.extrato, descricao: item.matchInfo || item.match.historico, valor: item.match.valor, data: item.match.data }
        : item.matchInfo
          ? { rotulo: labels.extrato, descricao: item.matchInfo, valor: item.vendaValor ?? 0 }
          : null;
      return {
        chave,
        esquerda,
        direita,
        jaMigrado: !!migrados[chave],
        correcaoBanco: { tipo: "pix", index: i, matchInfoAtual: item.matchInfo || item.match?.historico },
        criarLancamento:
          !esquerda && direita
            ? { tipo: "receber", descricao: `Recebimento identificado ${labels.extratoArtigo ?? "no"} ${labels.extrato} (pix)`, classificacao: "Faturamento", categoria: "Faturamento Geral", valor: direita.valor, vencimento: direita.data || resultado.data }
            : undefined,
      };
    });

    const secTransferencia: Linha[] = [];
    const linhasPorOrigem = new Map<string, Linha[]>();

    pagamentos.forEach((p, i) => {
      const chave = `pagamento-${i}`;
      const rotuloBanco = labels.origemLabels[p.origem] ?? p.origem;

      if (p.tipo === "transferencia") {
        secTransferencia.push({
          chave,
          esquerda: { rotulo: rotuloBanco, descricao: p.historico, valor: p.valor, data: p.data },
          direita: p.contraparte
            ? { rotulo: labels.origemLabels[p.contraparte.origem] ?? p.contraparte.origem, descricao: p.contraparte.historico, valor: p.valor, data: p.contraparte.data }
            : null,
          jaMigrado: !!migrados[chave],
          isTransferencia: true,
        });
        return;
      }

      const ignorado = ignorados.includes(chave);
      const match = ignorado ? undefined : p.matchLancamento;
      const linha: Linha = {
        chave,
        esquerda: match ? { rotulo: "Contas a Pagar", descricao: `${match.favorecido} · ${match.classificacao} / ${match.categoria}`, valor: match.valor } : null,
        direita: { rotulo: rotuloBanco, descricao: p.historico, valor: p.valor, data: p.data },
        jaMigrado: !!migrados[chave],
        podeVirarTransferencia: true,
        correcaoPagamento: { index: i },
        criarLancamento: !match
          ? {
              tipo: "pagar",
              pessoa: p.sugestao?.favorecido,
              descricao: p.historico,
              classificacao: p.sugestao?.classificacao || "DESPESAS ADMINISTRATIVAS",
              conta: rotuloBanco,
              valor: p.valor,
              vencimento: p.data,
            }
          : undefined,
      };
      const arr = linhasPorOrigem.get(p.origem) ?? [];
      arr.push(linha);
      linhasPorOrigem.set(p.origem, arr);
    });

    // Seções de saída seguem a ordem configurada por cliente (labels.origemOrdem) — cada banco
    // vira uma seção "Pagamentos do <banco>", só aparece se tiver algum lançamento.
    const secoesSaida: Secao[] = labels.origemOrdem
      .map((origem) => ({
        id: `${origem}-saida`,
        titulo: `Pagamentos ${labels.origemArtigo?.[origem] ?? "do"} ${labels.origemLabels[origem] ?? origem}`,
        subtitulo: `Saídas ${labels.origemArtigo?.[origem] ?? "do"} ${labels.origemLabels[origem] ?? origem} × Contas a Pagar`,
        linhas: linhasPorOrigem.get(origem) ?? [],
      }))
      .filter((s) => s.linhas.length > 0);

    return [
      { id: "cartao", titulo: "Recebimentos de Cartão", subtitulo: `Vendas no cartão (crédito/débito) × recebido ${labels.cartaoArtigo ?? "no"} ${labels.cartao}`, linhas: secCartao },
      { id: "dinheiro", titulo: "Recebimentos em Dinheiro / Espécie", subtitulo: "Vendas em dinheiro × caixa físico", linhas: secDinheiro },
      { id: "pix", titulo: "Recebimentos via Pix e Depósitos", subtitulo: `Vendas em Pix × extrato ${labels.extrato}`, linhas: secPix },
      { id: "transferencia", titulo: "Transferências entre Contas", subtitulo: "Não entra no DRE nem no Contas a Pagar", linhas: secTransferencia },
      ...secoesSaida,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado, labels]);

  function ordenar(secao: Secao): Linha[] {
    const salva = ordens[secao.id];
    if (!salva) return secao.linhas;
    const porChave = new Map(secao.linhas.map((l) => [l.chave, l]));
    const presentes = salva.map((c) => porChave.get(c)).filter((l): l is Linha => !!l);
    const faltando = secao.linhas.filter((l) => !salva.includes(l.chave));
    return [...presentes, ...faltando];
  }

  const buscaNum = busca.trim() ? Number(busca.trim().replace(",", ".")) : null;
  function combina(linha: Linha) {
    if (!busca.trim()) return true;
    const termo = busca.trim().toLowerCase();
    const textos = [linha.esquerda?.descricao, linha.direita?.descricao].filter(Boolean).join(" ").toLowerCase();
    if (textos.includes(termo)) return true;
    if (buscaNum !== null && !Number.isNaN(buscaNum)) {
      const valores = [linha.esquerda?.valor, linha.direita?.valor].filter((v): v is number => v !== undefined);
      return valores.some((v) => Math.abs(v - buscaNum) < 0.01);
    }
    return false;
  }

  const todasLinhas = secoes.flatMap((s) => s.linhas);
  const linhasAtivas = todasLinhas.filter((l) => !arquivados.includes(l.chave));

  const dashTotal = linhasAtivas.length;
  const dashConciliados = linhasAtivas.filter((l) => l.jaMigrado).length;
  const dashPendentes = linhasAtivas.filter((l) => !l.jaMigrado && !l.isTransferencia).length;
  const dashTransferencias = linhasAtivas.filter((l) => l.isTransferencia).length;

  const valorPendente = linhasAtivas
    .filter((l) => !l.jaMigrado && !l.isTransferencia)
    .reduce((acc, l) => acc + (l.direita?.valor ?? l.esquerda?.valor ?? 0), 0);

  const idx = datas && dataSelecionada ? datas.indexOf(dataSelecionada) : -1;
  const podeAnterior = datas && idx !== -1 && idx < datas.length - 1;
  const podeProximo = datas && idx > 0;

  const totalTaxa = Math.round(taxasCartaoPendentes.reduce((a, i) => a + i.taxa, 0) * 100) / 100;
  const taxaJaLancada = !!migrados["cartao-taxa-agregada"];

  return (
    <div className="flex flex-col gap-5">
      {datas && datas.length > 0 && (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-1.5">
            <button
              disabled={!podeAnterior}
              onClick={() => podeAnterior && onNavegar?.(datas[idx + 1])}
              className="flex items-center gap-1 rounded-lg border border-border-subtle px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={13} />
              Anterior
            </button>
            <button
              disabled={!podeProximo}
              onClick={() => podeProximo && onNavegar?.(datas[idx - 1])}
              className="flex items-center gap-1 rounded-lg border border-border-subtle px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Próximo
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {datas.map((d) => (
              <button
                key={d}
                onClick={() => onNavegar?.(d)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  d === dataSelecionada ? "bg-client-accent text-white" : "bg-surface-muted text-muted hover:bg-border-subtle"
                }`}
              >
                {formatDateBR(d)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="text-xs text-muted">
          <p>
            Data da conciliação: <span className="font-medium text-brand-900">{formatDateBR(resultado.data)}</span>
          </p>
          {atualizadoEm && (
            <p className="mt-0.5">
              Última atualização:{" "}
              <span className="font-medium text-brand-900">
                {new Date(atualizadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </p>
          )}
        </div>
        <div className="text-right text-xs text-muted">
          <p>Valor pendente de conciliação</p>
          <p className="text-lg font-semibold text-warn-500">{formatCurrencyPrecise(valorPendente)}</p>
        </div>
      </div>

      <div className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase text-faint">Total</p>
          <p className="text-lg font-semibold text-brand-900">{dashTotal}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-faint">Conciliados</p>
          <p className="text-lg font-semibold text-accent-500">{dashConciliados}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-faint">Pendentes</p>
          <p className="text-lg font-semibold text-warn-500">{dashPendentes}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase text-faint">Transferências</p>
          <p className="text-lg font-semibold text-muted">{dashTransferencias}</p>
        </div>
      </div>

      <div className="card p-3">
        <div className="relative w-full max-w-[280px]">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por valor ou descrição"
            className="w-full rounded-lg border border-border-subtle bg-surface-muted py-1.5 pl-7 pr-2 text-xs text-brand-900 placeholder:text-faint"
          />
        </div>
      </div>

      {secoes.map((secao) => {
        const linhas = ordenar(secao)
          .filter((l) => !arquivados.includes(l.chave))
          .filter(combina);
        if (linhas.length === 0 && !busca.trim()) return null;
        return (
          <div key={secao.id} className="flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-semibold text-brand-900">
                {secao.titulo} <span className="ml-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[11px] font-normal text-muted">{secao.linhas.length}</span>
              </h3>
              <p className="text-xs text-faint">{secao.subtitulo}</p>
            </div>
            {linhas.length === 0 ? (
              <div className="card card-dashed flex items-center justify-center p-6 text-center text-sm text-muted">Nada nessa seção.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {linhas.map((linha) => (
                  <LinhaConciliacao
                    key={linha.chave}
                    linha={linha}
                    secaoId={secao.id}
                    ordemNatural={secao.linhas.map((l) => l.chave)}
                    onConciliar={onConciliar}
                    onDesvincular={onDesvincular}
                    onExcluir={onExcluir}
                    onDesfazer={onDesfazer}
                    onMarcarTransferencia={onMarcarTransferencia}
                    onEditarItem={onEditarItem}
                    onEditarPagamentoBanco={onEditarPagamentoBanco}
                    onLancado={onLancado}
                    onReordenar={onReordenar}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Lançamento conjunto da taxa da maquineta — soma todas as diferenças de cartão do dia */}
      {taxasCartaoPendentes.length > 0 && (
        <div className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-900">Taxa da maquineta — lançamento conjunto</h3>
            {taxaJaLancada ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-medium text-accent-500">
                <Check size={11} /> Lançado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-warn-100 px-2 py-0.5 text-[11px] font-medium text-warn-500">
                <AlertTriangle size={11} /> Aguardando confirmação
              </span>
            )}
          </div>
          <p className="text-xs text-faint">
            {labels.taxaDoRelatorio
              ? `Soma das taxas já discriminadas no relatório da ${labels.cartao} pra cada venda de cartão já identificada no dia. Confirme pra lançar tudo de uma vez em Contas a Pagar.`
              : `Soma da diferença (bruto − recebido ${labels.cartaoArtigo ?? "no"} ${labels.cartao}) de cada venda de cartão já identificada no dia. Confirme pra lançar tudo de uma vez em Contas a Pagar.`}
          </p>
          <ul className="mt-3 flex flex-col gap-1 text-xs text-muted">
            {taxasCartaoPendentes.map((t) => (
              <li key={t.chave} className="flex items-center justify-between border-b border-border-subtle py-1 last:border-0">
                <span>{t.hora ?? "—"}</span>
                <span className="tabular-nums text-brand-900">{formatCurrencyPrecise(t.taxa)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
            <span className="text-sm font-semibold text-brand-900">Total</span>
            <span className="text-base font-semibold text-warn-500">{formatCurrencyPrecise(totalTaxa)}</span>
          </div>
          <div className="mt-3 flex justify-end">
            {taxaJaLancada ? (
              <button
                onClick={() => onDesfazerTaxaAgregada?.()}
                className="flex items-center gap-1 text-[11px] font-medium text-faint hover:text-warn-500 transition-colors"
              >
                <RotateCcw size={11} />
                Desfazer lançamento
              </button>
            ) : (
              <button
                onClick={() => onConfirmarTaxaAgregada?.()}
                className="rounded-lg bg-client-accent px-4 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
              >
                Confirmar e lançar em Contas a Pagar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
