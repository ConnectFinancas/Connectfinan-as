"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Square,
  Unlink,
  X,
} from "lucide-react";
import { ResultadoConciliacao } from "@/lib/reconciliation/match";
import { ResultadoSalvo } from "@/lib/reconciliation/historicoStore";
import { LancamentoModal } from "@/components/client/LancamentoModal";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";

type AbaPrincipal = "pendentes" | "movimentacoes";
type AbaTipo = "todos" | "recebimentos" | "pagamentos";

type Item = {
  chave: string;
  categoria: "recebimento" | "pagamento";
  rotulo: string; // "Pix" | "Dinheiro" | "Bradesco" | "PagBank"
  jaMigrado: boolean;
  temMatch: boolean; // banco encontrado (recebimento) ou lançamento encontrado (pagamento)
  naoRequerAcao: boolean; // transferência entre contas
  bancoValor: number;
  bancoData?: string;
  bancoDescricao: string;
  sistemaResumo: string;
  sistemaSemMatchTexto?: string; // exibido quando pagamento não achou lançamento
  prefillNovoLancamento?: {
    pessoa?: string;
    descricao: string;
    classificacao?: string;
    valor: number;
    vencimento: string;
  };
  // dados brutos p/ ações de correção (recebimento)
  correcao?: { tipo: "pix" | "dinheiro"; index: number; matchInfoAtual?: string };
};

function StatusPill({ jaMigrado, temMatch, naoRequerAcao }: { jaMigrado: boolean; temMatch: boolean; naoRequerAcao: boolean }) {
  if (naoRequerAcao) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">
        Transferência
      </span>
    );
  }
  if (jaMigrado) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-medium text-accent-500">
        <Check size={11} /> Conciliado
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

export function ConciliacaoResultado({
  resultado,
  datas,
  dataSelecionada,
  onNavegar,
  onEditarItem,
  onLancado,
  onConciliar,
  onConciliarLote,
  onDesvincular,
  onDesvincularLote,
  onArquivar,
  onArquivarLote,
  onDesarquivar,
}: {
  resultado: ResultadoConciliacao | ResultadoSalvo;
  datas?: string[];
  dataSelecionada?: string;
  onNavegar?: (data: string) => void;
  onEditarItem?: (
    tipo: "pix" | "dinheiro" | "pagamento",
    index: number,
    patch: { status?: "conciliado" | "pendente"; matchInfo?: string }
  ) => void;
  onLancado?: (chave: string) => void;
  onConciliar?: (chave: string) => void;
  onConciliarLote?: (chaves: string[]) => void;
  onDesvincular?: (chave: string) => void;
  onDesvincularLote?: (chaves: string[]) => void;
  onArquivar?: (chave: string) => void;
  onArquivarLote?: (chaves: string[]) => void;
  onDesarquivar?: (chave: string) => void;
}) {
  const migrados = "migrados" in resultado ? resultado.migrados ?? {} : {};
  const arquivados = "arquivados" in resultado ? resultado.arquivados ?? [] : [];
  const ignorados = "ignorados" in resultado ? resultado.ignorados ?? [] : [];
  const atualizadoEm = "atualizadoEm" in resultado ? resultado.atualizadoEm : undefined;

  const [taxaLancada, setTaxaLancada] = useState(false);
  const [lancarTaxa, setLancarTaxa] = useState(false);
  const [lancarPagamento, setLancarPagamento] = useState<{
    chave: string;
    pessoa: string;
    descricao: string;
    valor: number;
    vencimento: string;
  } | null>(null);
  const [editando, setEditando] = useState<{ tipo: "pix" | "dinheiro"; index: number } | null>(null);
  const [rascunho, setRascunho] = useState("");
  const [abaPrincipal, setAbaPrincipal] = useState<AbaPrincipal>("pendentes");
  const [abaTipo, setAbaTipo] = useState<AbaTipo>("todos");
  const [busca, setBusca] = useState("");
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [verArquivados, setVerArquivados] = useState(false);

  const { cartao, pix, dinheiro, pagamentos } = resultado;

  const itens: Item[] = useMemo(() => {
    const lista: Item[] = [];

    pix.forEach((item, i) => {
      const chave = `pix-${i}`;
      // "||" (não "??"): matchInfo pode ser "" depois de um "Desvincular" — nesse caso
      // deve voltar pro texto padrão, não ficar em branco.
      const bancoTxt = item.matchInfo || item.match?.historico;
      lista.push({
        chave,
        categoria: "recebimento",
        rotulo: "Pix",
        jaMigrado: !!migrados[chave],
        temMatch: item.status === "conciliado",
        naoRequerAcao: false,
        bancoValor: item.match?.valor ?? item.vendaValor,
        bancoData: item.match?.data,
        bancoDescricao: bancoTxt || "Ainda não encontrado no extrato do Bradesco",
        sistemaResumo: `Venda Pix${item.vendaHora ? ` · ${item.vendaHora}` : ""} · ${formatCurrencyPrecise(item.vendaValor)}`,
        correcao: { tipo: "pix", index: i, matchInfoAtual: bancoTxt },
      });
    });

    dinheiro.forEach((item, i) => {
      const chave = `dinheiro-${i}`;
      const bancoTxt = item.matchInfo || item.match?.historico;
      lista.push({
        chave,
        categoria: "recebimento",
        rotulo: "Dinheiro",
        jaMigrado: !!migrados[chave],
        temMatch: item.status === "conciliado",
        naoRequerAcao: false,
        bancoValor: item.match?.entrada ?? item.vendaValor,
        bancoData: item.match?.data,
        bancoDescricao: bancoTxt || "Ainda não encontrado no caixa físico",
        sistemaResumo: `Venda Dinheiro${item.vendaHora ? ` · ${item.vendaHora}` : ""} · ${formatCurrencyPrecise(item.vendaValor)}`,
        correcao: { tipo: "dinheiro", index: i, matchInfoAtual: bancoTxt },
      });
    });

    pagamentos.forEach((p, i) => {
      const chave = `pagamento-${i}`;
      if (p.tipo === "transferencia") {
        lista.push({
          chave,
          categoria: "pagamento",
          rotulo: p.origem === "bradesco" ? "Bradesco" : "PagBank",
          jaMigrado: true,
          temMatch: true,
          naoRequerAcao: true,
          bancoValor: p.valor,
          bancoData: p.data,
          bancoDescricao: p.historico,
          sistemaResumo: "Transferência entre contas da própria empresa — não entra no Contas a Pagar",
        });
        return;
      }
      const ignorado = ignorados.includes(chave);
      const match = ignorado ? undefined : p.matchLancamento;
      lista.push({
        chave,
        categoria: "pagamento",
        rotulo: p.origem === "bradesco" ? "Bradesco" : "PagBank",
        jaMigrado: !!migrados[chave],
        temMatch: !!match,
        naoRequerAcao: false,
        bancoValor: p.valor,
        bancoData: p.data,
        bancoDescricao: p.historico,
        sistemaResumo: match
          ? `${match.favorecido} · ${match.classificacao} / ${match.categoria} · ${formatCurrencyPrecise(match.valor)}`
          : "",
        sistemaSemMatchTexto: !match ? "Nenhum lançamento encontrado em Contas a Pagar com esse valor" : undefined,
        prefillNovoLancamento: !match
          ? {
              pessoa: p.sugestao?.favorecido,
              descricao: p.historico,
              classificacao: "DESPESAS ADMINISTRATIVAS",
              valor: p.valor,
              vencimento: p.data,
            }
          : undefined,
      });
    });

    return lista;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado]);

  const itensAtivos = itens.filter((i) => !arquivados.includes(i.chave));
  const itensArquivados = itens.filter((i) => arquivados.includes(i.chave));

  const totalPendentes = itensAtivos.filter((i) => !i.jaMigrado && !i.naoRequerAcao).length;
  const totalMovimentacoes = itensAtivos.length;

  const buscaNum = busca.trim() ? Number(busca.trim().replace(",", ".")) : null;
  function combina(item: Item) {
    if (!busca.trim()) return true;
    const termo = busca.trim().toLowerCase();
    if (item.bancoDescricao.toLowerCase().includes(termo) || item.sistemaResumo.toLowerCase().includes(termo)) return true;
    if (buscaNum !== null && !Number.isNaN(buscaNum)) {
      return Math.abs(item.bancoValor - buscaNum) < 0.01;
    }
    return false;
  }

  const itensVisiveis = itensAtivos
    .filter((i) => (abaPrincipal === "pendentes" ? !i.jaMigrado && !i.naoRequerAcao : true))
    .filter((i) => abaTipo === "todos" || (abaTipo === "recebimentos" ? i.categoria === "recebimento" : i.categoria === "pagamento"))
    .filter(combina);

  const contagemTodos = itensAtivos.filter((i) => abaPrincipal === "pendentes" ? !i.jaMigrado && !i.naoRequerAcao : true).length;
  const contagemRecebimentos = itensAtivos.filter(
    (i) => i.categoria === "recebimento" && (abaPrincipal === "pendentes" ? !i.jaMigrado && !i.naoRequerAcao : true)
  ).length;
  const contagemPagamentos = itensAtivos.filter(
    (i) => i.categoria === "pagamento" && (abaPrincipal === "pendentes" ? !i.jaMigrado && !i.naoRequerAcao : true)
  ).length;

  const valorPendente = itensAtivos
    .filter((i) => !i.jaMigrado && !i.naoRequerAcao)
    .reduce((acc, i) => acc + i.bancoValor, 0);

  const idx = datas && dataSelecionada ? datas.indexOf(dataSelecionada) : -1;
  const podeAnterior = datas && idx !== -1 && idx < datas.length - 1;
  const podeProximo = datas && idx > 0;

  function toggleSelecionado(chave: string) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  function selecionarTodosVisiveis() {
    setSelecionados(new Set(itensVisiveis.map((i) => i.chave)));
  }

  function limparSelecao() {
    setSelecionados(new Set());
    setModoSelecao(false);
  }

  function iniciarEdicao(tipo: "pix" | "dinheiro", index: number, atual?: string) {
    setEditando({ tipo, index });
    setRascunho(atual ?? "");
  }

  function salvarEdicao() {
    if (!editando || !onEditarItem) return;
    onEditarItem(editando.tipo, editando.index, { matchInfo: rascunho, status: rascunho.trim() ? "conciliado" : "pendente" });
    setEditando(null);
  }

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

      {/* Barra de informações, no estilo Conta Azul */}
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

      {/* Cartão — mantido como já estava */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-900">Cartão (Crédito + Débito)</h3>
          <StatusPill jaMigrado={!!migrados["cartao"]} temMatch={cartao.quantidadeBate} naoRequerAcao={false} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase text-faint">Faturado</p>
            <p className="text-sm font-semibold text-brand-900">{formatCurrencyPrecise(cartao.faturamentoTotal)}</p>
            <p className="text-[11px] text-faint">{cartao.faturamentoQtd} vendas</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-faint">Recebido no PagBank</p>
            <p className="text-sm font-semibold text-brand-900">{formatCurrencyPrecise(cartao.pagbankTotal)}</p>
            <p className="text-[11px] text-faint">{cartao.pagbankQtd} recebimentos</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-faint">Diferença (taxa maquineta)</p>
            <p className="text-sm font-semibold text-warn-500">{formatCurrencyPrecise(cartao.diferenca)}</p>
          </div>
          <div className="flex items-end">
            {taxaLancada || migrados["cartao-taxa"] ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent-100 px-3 py-2 text-xs font-medium text-accent-500">
                <Check size={12} />
                Taxa lançada
              </span>
            ) : (
              <button
                onClick={() => setLancarTaxa(true)}
                className="flex items-center gap-1.5 rounded-lg bg-client-accent px-3 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
              >
                <Plus size={12} />
                Lançar taxa da maquineta
              </button>
            )}
          </div>
        </div>
        {!cartao.quantidadeBate && (
          <p className="mt-3 text-xs text-warn-500">
            Quantidade de vendas no cartão ({cartao.faturamentoQtd}) diferente da quantidade de recebimentos no PagBank ({cartao.pagbankQtd}) — confira antes de lançar a taxa.
          </p>
        )}
        {cartao.quantidadeBate && cartao.valorBate && cartao.faturamentoTotal > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border-subtle bg-surface-muted px-3 py-2">
            <span className="text-xs text-muted">Faturamento do cartão conferido — pronto pra ir pro Contas a Receber</span>
            {migrados["cartao"] ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-500">
                <Check size={12} /> Conciliado
              </span>
            ) : (
              <button
                onClick={() => onConciliar?.("cartao")}
                className="rounded-lg bg-client-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
              >
                Conciliar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Abas + busca + seleção, estilo Conta Azul */}
      <div className="card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5 border-b border-border-subtle">
            <button
              onClick={() => setAbaPrincipal("pendentes")}
              className={`border-b-2 px-3 pb-2 text-sm transition-colors ${
                abaPrincipal === "pendentes" ? "border-client-accent font-medium text-brand-900" : "border-transparent text-muted hover:text-brand-900"
              }`}
            >
              Conciliações pendentes <span className="ml-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[11px]">{totalPendentes}</span>
            </button>
            <button
              onClick={() => setAbaPrincipal("movimentacoes")}
              className={`border-b-2 px-3 pb-2 text-sm transition-colors ${
                abaPrincipal === "movimentacoes" ? "border-client-accent font-medium text-brand-900" : "border-transparent text-muted hover:text-brand-900"
              }`}
            >
              Movimentações <span className="ml-1 rounded-full bg-surface-muted px-1.5 py-0.5 text-[11px]">{totalMovimentacoes}</span>
            </button>
          </div>
          <div className="relative w-full max-w-[220px]">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por valor ou descrição"
              className="w-full rounded-lg border border-border-subtle bg-surface-muted py-1.5 pl-7 pr-2 text-xs text-brand-900 placeholder:text-faint"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {([
              ["todos", `Todos (${contagemTodos})`],
              ["recebimentos", `Recebimentos (${contagemRecebimentos})`],
              ["pagamentos", `Pagamentos (${contagemPagamentos})`],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setAbaTipo(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  abaTipo === v ? "bg-client-accent text-white" : "text-muted hover:bg-surface-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {modoSelecao ? (
              <>
                <span className="text-xs text-faint">{selecionados.size} selecionado{selecionados.size !== 1 ? "s" : ""}</span>
                <button
                  onClick={selecionarTodosVisiveis}
                  className="rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
                >
                  Selecionar tudo
                </button>
                <button
                  disabled={selecionados.size === 0}
                  onClick={() => {
                    onConciliarLote?.([...selecionados]);
                    limparSelecao();
                  }}
                  className="flex items-center gap-1 rounded-lg bg-client-accent px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors disabled:opacity-40"
                >
                  <Check size={12} />
                  Conciliar
                </button>
                <button
                  disabled={selecionados.size === 0}
                  onClick={() => {
                    onDesvincularLote?.([...selecionados]);
                    limparSelecao();
                  }}
                  className="flex items-center gap-1 rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors disabled:opacity-40"
                >
                  <Unlink size={12} />
                  Desvincular
                </button>
                <button
                  disabled={selecionados.size === 0}
                  onClick={() => {
                    onArquivarLote?.([...selecionados]);
                    limparSelecao();
                  }}
                  className="flex items-center gap-1 rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors disabled:opacity-40"
                >
                  <Archive size={12} />
                  Arquivar
                </button>
                <button onClick={limparSelecao} className="text-faint hover:text-danger-500 transition-colors">
                  <X size={14} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setModoSelecao(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
              >
                <CheckSquare size={13} />
                Selecionar lançamentos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de itens em pares de quadrados: banco x sistema */}
      <div className="flex flex-col gap-3">
        {itensVisiveis.length === 0 && (
          <div className="card card-dashed flex items-center justify-center p-8 text-center text-sm text-muted">
            {abaPrincipal === "pendentes" ? "Nenhuma conciliação pendente nessa visão." : "Nenhum movimento nessa visão."}
          </div>
        )}
        {itensVisiveis.map((item) => (
          <div key={item.chave} className="card p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {modoSelecao && !item.naoRequerAcao && (
                  <button onClick={() => toggleSelecionado(item.chave)} className="text-muted hover:text-brand-900 transition-colors">
                    {selecionados.has(item.chave) ? <CheckSquare size={15} /> : <Square size={15} />}
                  </button>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    item.categoria === "recebimento" ? "bg-client-accent/10 text-client-accent" : "bg-surface-muted text-muted"
                  }`}
                >
                  {item.rotulo}
                </span>
              </div>
              <StatusPill jaMigrado={item.jaMigrado} temMatch={item.temMatch} naoRequerAcao={item.naoRequerAcao} />
            </div>

            <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
              {/* Lançamento do banco */}
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-faint">Lançamento do banco</p>
                {item.correcao && editando?.tipo === item.correcao.tipo && editando.index === item.correcao.index ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      autoFocus
                      value={rascunho}
                      onChange={(e) => setRascunho(e.target.value)}
                      placeholder="Descreva onde foi encontrado"
                      className="w-full rounded-md border border-border-subtle bg-white px-2 py-1 text-xs text-brand-900 placeholder:text-faint"
                    />
                    <button onClick={salvarEdicao} className="shrink-0 text-accent-500 hover:text-accent-600">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditando(null)} className="shrink-0 text-faint hover:text-danger-500">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-sm text-brand-900">{item.bancoDescricao}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted">
                      {formatCurrencyPrecise(item.bancoValor)}
                      {item.bancoData && <span className="text-faint"> · {formatDateBR(item.bancoData)}</span>}
                    </p>
                    {item.correcao && !item.jaMigrado && (
                      <button
                        onClick={() => iniciarEdicao(item.correcao!.tipo, item.correcao!.index, item.correcao!.matchInfoAtual)}
                        className="mt-1 text-[11px] font-medium text-client-accent hover:underline"
                      >
                        {item.temMatch ? "Corrigir" : "Buscar / informar manualmente"}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Botão central */}
              <div className="flex items-center justify-center">
                {item.naoRequerAcao ? (
                  <ArrowRight size={16} className="text-faint" />
                ) : item.jaMigrado ? (
                  <Check size={18} className="text-accent-500" />
                ) : item.categoria === "recebimento" ? (
                  item.temMatch ? (
                    <button
                      onClick={() => onConciliar?.(item.chave)}
                      className="rounded-lg bg-client-accent px-4 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
                    >
                      Conciliar
                    </button>
                  ) : (
                    <ArrowRight size={16} className="text-faint" />
                  )
                ) : item.temMatch ? (
                  <button
                    onClick={() => onConciliar?.(item.chave)}
                    className="rounded-lg bg-client-accent px-4 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
                  >
                    Conciliar
                  </button>
                ) : (
                  <ArrowRight size={16} className="text-faint" />
                )}
              </div>

              {/* Lançamento do sistema */}
              <div className="rounded-lg border border-border-subtle bg-surface-muted p-3">
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-faint">Lançamento do sistema</p>
                {item.sistemaSemMatchTexto ? (
                  <>
                    <p className="text-xs text-faint">{item.sistemaSemMatchTexto}</p>
                    {!item.jaMigrado && (
                      <button
                        onClick={() =>
                          setLancarPagamento({
                            chave: item.chave,
                            pessoa: item.prefillNovoLancamento?.pessoa ?? "",
                            descricao: item.prefillNovoLancamento?.descricao ?? "",
                            valor: item.prefillNovoLancamento?.valor ?? item.bancoValor,
                            vencimento: item.prefillNovoLancamento?.vencimento ?? resultado.data,
                          })
                        }
                        className="mt-1.5 flex items-center gap-1 rounded-lg border border-client-accent px-2.5 py-1.5 text-[11px] font-semibold text-client-accent hover:bg-client-accent/10 transition-colors"
                      >
                        <Plus size={11} />
                        Criar novo lançamento
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-brand-900">{item.sistemaResumo}</p>
                )}
              </div>
            </div>

            {!item.naoRequerAcao && !item.jaMigrado && (
              <div className="mt-2 flex justify-end">
                {item.temMatch && (
                  <button
                    onClick={() => onDesvincular?.(item.chave)}
                    className="flex items-center gap-1 text-[11px] font-medium text-faint hover:text-warn-500 transition-colors"
                    title="Desfaz essa correspondência"
                  >
                    <Unlink size={11} />
                    Desvincular
                  </button>
                )}
                <button
                  onClick={() => onArquivar?.(item.chave)}
                  className={`flex items-center gap-1 text-[11px] font-medium text-faint hover:text-danger-500 transition-colors ${item.temMatch ? "ml-3" : ""}`}
                  title="Arquiva esse item (erro de leitura)"
                >
                  <Archive size={11} />
                  Arquivar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {itensArquivados.length > 0 && (
        <div className="card p-4">
          <button
            onClick={() => setVerArquivados((v) => !v)}
            className="text-xs font-medium text-client-accent hover:underline"
          >
            {verArquivados ? "Ocultar" : `Ver lançamentos arquivados (${itensArquivados.length})`}
          </button>
          {verArquivados && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {itensArquivados.map((item) => (
                <li key={item.chave} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-muted">
                    {item.bancoDescricao} · {formatCurrencyPrecise(item.bancoValor)}
                  </span>
                  <button
                    onClick={() => onDesarquivar?.(item.chave)}
                    className="shrink-0 font-medium text-client-accent hover:underline"
                  >
                    Desarquivar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {lancarTaxa && (
        <LancamentoModal
          tipo="pagar"
          onClose={() => setLancarTaxa(false)}
          onSaved={() => {
            setTaxaLancada(true);
            onLancado?.("cartao-taxa");
          }}
          prefill={{
            descricao: `Taxa de maquininha - conciliação ${formatDateBR(resultado.data)}`,
            classificacao: "DESPESAS FINANCEIRAS",
            categoria: "Tarifas de Maquininhas",
            valor: cartao.diferenca,
            vencimento: resultado.data,
            status: "pago",
            dataPagamento: resultado.data,
          }}
        />
      )}
      {lancarPagamento && (
        <LancamentoModal
          tipo="pagar"
          onClose={() => setLancarPagamento(null)}
          onSaved={() => onLancado?.(lancarPagamento.chave)}
          prefill={{
            pessoa: lancarPagamento.pessoa,
            descricao: lancarPagamento.descricao,
            classificacao: "DESPESAS ADMINISTRATIVAS",
            valor: lancarPagamento.valor,
            vencimento: lancarPagamento.vencimento,
            status: "pago",
            dataPagamento: lancarPagamento.vencimento,
          }}
        />
      )}
    </div>
  );
}
