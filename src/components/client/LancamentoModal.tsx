"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useFinance, genId } from "@/lib/store/FinanceContext";
import { addMonths, HOJE, toISO } from "@/lib/today";
import { Payable, Receivable, Status } from "@/lib/types";

const NOVA_CATEGORIA = "__nova__";

export function LancamentoModal({
  tipo,
  onClose,
  entry,
}: {
  tipo: "pagar" | "receber";
  onClose: () => void;
  entry?: Payable | Receivable;
}) {
  const finance = useFinance();
  const isEdit = !!entry;
  const categorias = tipo === "pagar" ? finance.categoriasPagar : finance.categoriasReceber;
  const existentes = tipo === "pagar" ? finance.payables.map((p) => p.favorecido) : finance.receivables.map((r) => r.cliente);
  const pessoas = useMemo(() => [...new Set(existentes)].filter((n) => n !== "—"), [existentes]);
  const contasExistentes =
    tipo === "pagar" ? finance.payables.map((p) => p.conta) : finance.receivables.map((r) => r.formaRecebimento);
  const contas = useMemo(
    () => [...new Set(contasExistentes)].filter((c): c is string => !!c),
    [contasExistentes]
  );

  const entryPessoa = entry ? (tipo === "pagar" ? (entry as Payable).favorecido : (entry as Receivable).cliente) : "";
  const entryConta = entry ? (tipo === "pagar" ? (entry as Payable).conta : (entry as Receivable).formaRecebimento) : "";
  const entryDataPagamento = entry
    ? (tipo === "pagar" ? (entry as Payable).pagamento : (entry as Receivable).recebimento)
    : "";
  const entryEraPago = entry ? entry.status === "pago" || entry.status === "recebido" : false;

  const [pessoa, setPessoa] = useState(entryPessoa === "—" ? "" : entryPessoa);
  const [conta, setConta] = useState(entryConta ?? "");
  const [descricao, setDescricao] = useState(entry?.descricao ?? "");
  const [classificacao, setClassificacao] = useState(entry?.classificacao ?? categorias[0]?.classificacao ?? "");
  const [categoria, setCategoria] = useState(entry?.categoria ?? "");
  const [novaCategoriaNome, setNovaCategoriaNome] = useState("");
  const [vencimento, setVencimento] = useState(entry?.vencimento ?? toISO(HOJE));
  const [valor, setValor] = useState(entry ? String(entry.valor).replace(".", ",") : "");
  const [parcelas, setParcelas] = useState(1);
  const [modoParcelas, setModoParcelas] = useState<"dividir" | "cheio">("dividir");
  const [status, setStatus] = useState<"pendente" | "pago">(entryEraPago ? "pago" : "pendente");
  const [dataPagamento, setDataPagamento] = useState(entryDataPagamento ?? "");
  const [erro, setErro] = useState("");

  const grupoAtual = categorias.find((c) => c.classificacao === classificacao);
  const categoriaFinal = categoria === NOVA_CATEGORIA ? novaCategoriaNome.trim() : categoria;

  function handleSalvar() {
    const valorNum = Number(valor.replace(",", "."));
    if (!descricao.trim() || !classificacao || !categoriaFinal || !vencimento || !valorNum) {
      setErro("Preencha descrição, classificação, categoria, vencimento e valor.");
      return;
    }
    if (status === "pago" && !dataPagamento) {
      setErro("Informe a data de pagamento/recebimento ou deixe o status como Em aberto.");
      return;
    }

    if (categoria === NOVA_CATEGORIA && categoriaFinal) {
      finance.addCategoria(tipo, classificacao, categoriaFinal);
    }

    const statusFinal: Status = status === "pago" ? (tipo === "pagar" ? "pago" : "recebido") : "pendente";
    const pessoaFinal = pessoa.trim() || "—";

    if (isEdit && entry) {
      if (tipo === "pagar") {
        finance.updatePayables([entry.id], {
          favorecido: pessoaFinal,
          categoria: categoriaFinal,
          classificacao,
          vencimento,
          valor: valorNum,
          status: statusFinal,
          pagamento: status === "pago" ? dataPagamento : undefined,
          descricao: descricao.trim(),
          conta: conta.trim() || undefined,
        });
      } else {
        finance.updateReceivables([entry.id], {
          cliente: pessoaFinal,
          categoria: categoriaFinal,
          classificacao,
          vencimento,
          valor: valorNum,
          status: statusFinal,
          recebimento: status === "pago" ? dataPagamento : undefined,
          descricao: descricao.trim(),
          formaRecebimento: conta.trim() || undefined,
        });
      }
      onClose();
      return;
    }

    const n = Math.max(1, parcelas);
    const valorParcela = modoParcelas === "dividir" ? Math.round((valorNum / n) * 100) / 100 : valorNum;

    if (tipo === "pagar") {
      const entries: Payable[] = Array.from({ length: n }, (_, i) => ({
        id: genId("p"),
        favorecido: pessoaFinal,
        categoria: categoriaFinal,
        classificacao,
        vencimento: addMonths(vencimento, i),
        valor: valorParcela,
        status: statusFinal,
        pagamento: status === "pago" ? dataPagamento : undefined,
        descricao: n > 1 ? `${descricao.trim()} (${i + 1}/${n})` : descricao.trim(),
        conta: conta.trim() || undefined,
      }));
      finance.addPayable(entries);
    } else {
      const entries: Receivable[] = Array.from({ length: n }, (_, i) => ({
        id: genId("r"),
        cliente: pessoaFinal,
        categoria: categoriaFinal,
        classificacao,
        vencimento: addMonths(vencimento, i),
        valor: valorParcela,
        status: statusFinal,
        recebimento: status === "pago" ? dataPagamento : undefined,
        descricao: n > 1 ? `${descricao.trim()} (${i + 1}/${n})` : descricao.trim(),
        formaRecebimento: conta.trim() || undefined,
      }));
      finance.addReceivable(entries);
    }

    onClose();
  }

  function handleExcluir() {
    if (!entry) return;
    if (tipo === "pagar") finance.deletePayables([entry.id]);
    else finance.deleteReceivables([entry.id]);
    onClose();
  }

  const label = tipo === "pagar" ? "despesa" : "conta a receber";
  const pessoaLabel = tipo === "pagar" ? "Fornecedor" : "Cliente";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10 sm:pt-16" onClick={onClose}>
      <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-900">{isEdit ? `Editar ${label}` : `Nova ${label}`}</h2>
          <button onClick={onClose} className="text-faint hover:text-brand-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">{pessoaLabel}</label>
            <input
              list="pessoas-lista"
              value={pessoa}
              onChange={(e) => setPessoa(e.target.value)}
              placeholder={tipo === "pagar" ? "Ex.: Imobiliária Silva" : "Ex.: Loja XPTO Ltda"}
              className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900 placeholder:text-faint"
            />
            <datalist id="pessoas-lista">
              {pessoas.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              {tipo === "pagar" ? "Conta" : "Forma de Recebimento"}
            </label>
            <input
              list="contas-lista"
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              placeholder={tipo === "pagar" ? "Ex.: Banco do Brasil" : "Ex.: Pix"}
              className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900 placeholder:text-faint"
            />
            <datalist id="contas-lista">
              {contas.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Descrição</label>
            <input
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={tipo === "pagar" ? "Ex.: Aluguel do galpão" : "Ex.: Serviço de prep - lote 12"}
              className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900 placeholder:text-faint"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Classificação Financeira</label>
              <select
                value={classificacao}
                onChange={(e) => {
                  setClassificacao(e.target.value);
                  setCategoria("");
                }}
                className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
              >
                {categorias.map((c) => (
                  <option key={c.classificacao} value={c.classificacao}>
                    {c.classificacao}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
              >
                <option value="">Selecione...</option>
                {grupoAtual?.categorias.map((c) => (
                  <option key={c.nome} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
                <option value={NOVA_CATEGORIA}>+ Nova categoria...</option>
              </select>
              {categoria === NOVA_CATEGORIA && (
                <input
                  autoFocus
                  value={novaCategoriaNome}
                  onChange={(e) => setNovaCategoriaNome(e.target.value)}
                  placeholder="Nome da nova categoria"
                  className="mt-2 w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900 placeholder:text-faint"
                />
              )}
            </div>
          </div>
          <p className="-mt-2 text-[11px] text-faint">
            Escolha a classificação e a categoria muda conforme ela. Não achou? Use <span className="text-brand-700">+ Nova categoria...</span> no fim da lista.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Vencimento</label>
              <input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Valor (R$)</label>
              <input
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900 placeholder:text-faint"
              />
            </div>
          </div>

          {!isEdit && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Parcelas</label>
                  <input
                    type="number"
                    min={1}
                    value={parcelas}
                    onChange={(e) => setParcelas(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Como lançar as parcelas</label>
                  <select
                    value={modoParcelas}
                    onChange={(e) => setModoParcelas(e.target.value as "dividir" | "cheio")}
                    disabled={parcelas <= 1}
                    className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900 disabled:opacity-50"
                  >
                    <option value="dividir">Dividir o valor total</option>
                    <option value="cheio">Valor cheio em cada parcela</option>
                  </select>
                </div>
              </div>
              {parcelas > 1 && (
                <p className="-mt-2 text-[11px] text-faint">
                  Gera {parcelas} lançamentos, sempre no dia {new Date(vencimento + "T00:00:00").getDate()}, um por mês.
                </p>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  const v = e.target.value as "pendente" | "pago";
                  setStatus(v);
                  if (v === "pendente") setDataPagamento("");
                }}
                className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
              >
                <option value="pendente">Em aberto</option>
                <option value="pago">{tipo === "pagar" ? "Pago" : "Recebido"}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Data de {tipo === "pagar" ? "pagamento" : "recebimento"}
              </label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                disabled={status !== "pago"}
                className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900 disabled:opacity-50"
              />
            </div>
          </div>

          {erro && <p className="text-xs text-danger-500">{erro}</p>}

          <div className="mt-1 flex gap-3">
            {isEdit && (
              <button
                onClick={handleExcluir}
                className="rounded-lg border border-danger-500/40 px-4 py-2.5 text-sm font-semibold text-danger-500 hover:bg-danger-500/10 transition-colors"
              >
                Excluir
              </button>
            )}
            <button
              onClick={handleSalvar}
              className="flex-1 rounded-lg bg-client-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-client-accent-dark transition-colors"
            >
              {isEdit ? "Salvar alterações" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
