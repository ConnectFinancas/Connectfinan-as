"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, FileImage, FileSpreadsheet, Landmark, Users } from "lucide-react";
import { UploadBox } from "@/components/client/UploadBox";
import { CaixaFisicoManualTable } from "@/components/client/CaixaFisicoManualTable";
import { ConciliacaoResultado } from "@/components/client/ConciliacaoResultado";
import { useFinance, genId } from "@/lib/store/FinanceContext";
import { Receivable } from "@/lib/types";
import { parseFaturamento, parseBradesco, parsePagBank } from "@/lib/reconciliation/parsers";
import { conciliarDia } from "@/lib/reconciliation/match";
import { CaixaFisicoExtraido, MovimentoCaixaFisico } from "@/lib/reconciliation/types";
import { usePendencias } from "@/lib/reconciliation/pendenciasStore";
import { useConciliacaoHistorico, ResultadoSalvo } from "@/lib/reconciliation/historicoStore";
import { formatDateBR } from "@/lib/today";

type Extraido = { text: string; viaOcr: boolean; file: File } | null;

function DocumentosMjPrime() {
  const finance = useFinance();
  const { pendencias, upsertPendencias } = usePendencias(finance.client.slug);
  const historico = useConciliacaoHistorico(finance.client.slug);
  const [dataOverride, setDataOverride] = useState<string | null>(null);
  const [ultimoUpload, setUltimoUpload] = useState<string | null>(null);
  const [filtroPendencias, setFiltroPendencias] = useState("");
  const [verTodasPendencias, setVerTodasPendencias] = useState(false);

  const [faturamentoRaw, setFaturamentoRaw] = useState<Extraido>(null);
  const [pagbankRaw, setPagbankRaw] = useState<Extraido>(null);
  const [bradescoRaw, setBradescoRaw] = useState<Extraido>(null);
  const [caixaMovs, setCaixaMovs] = useState<MovimentoCaixaFisico[]>([]);

  const faturamento = useMemo(() => (faturamentoRaw ? parseFaturamento(faturamentoRaw.text) : null), [faturamentoRaw]);
  const pagbank = useMemo(() => (pagbankRaw ? parsePagBank(pagbankRaw.text) : null), [pagbankRaw]);
  const anoReferencia = faturamento?.vendas[0]?.data.slice(0, 4) ?? String(new Date().getFullYear());
  const bradesco = useMemo(
    () => (bradescoRaw ? parseBradesco(bradescoRaw.text, anoReferencia) : null),
    [bradescoRaw, anoReferencia]
  );
  const caixa: CaixaFisicoExtraido = useMemo(() => ({ movimentos: caixaMovs }), [caixaMovs]);

  const dataReferencia = faturamento?.vendas[0]?.data ?? null;

  const resultado = useMemo(() => {
    if (!faturamento || !dataReferencia) return null;
    return conciliarDia(
      dataReferencia,
      faturamento,
      pagbank ?? { movimentos: [] },
      bradesco ?? { movimentos: [], viaOcr: false },
      caixa,
      finance.payables
    );
  }, [faturamento, pagbank, bradesco, caixa, dataReferencia, finance.payables]);

  useEffect(() => {
    if (!resultado) return;
    historico.salvar(resultado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado?.data]);

  // Quando um novo upload traz um dia diferente, ele assume o foco automaticamente
  // (padrão sancionado do React p/ "resetar" estado durante o render, sem efeito).
  if (resultado && resultado.data !== ultimoUpload) {
    setUltimoUpload(resultado.data);
    setDataOverride(null);
  }

  const dataSelecionada = dataOverride ?? resultado?.data ?? historico.datas[0] ?? null;

  const resultadoExibido: ResultadoSalvo | null = dataSelecionada
    ? historico.historico[dataSelecionada] ?? (resultado?.data === dataSelecionada ? resultado : null)
    : null;

  useEffect(() => {
    if (!resultadoExibido) return;
    const data = resultadoExibido.data;
    const novasPendencias = [
      ...resultadoExibido.pix
        .filter((p) => p.status === "pendente")
        .map((p, i) => ({
          id: `pix-${data}-${i}`,
          data,
          descricao: `Pix não identificado no Bradesco (${p.vendaHora ?? ""})`,
          valor: p.vendaValor,
          tipo: "pix" as const,
        })),
      ...resultadoExibido.dinheiro
        .filter((d) => d.status === "pendente")
        .map((d, i) => ({
          id: `dinheiro-${data}-${i}`,
          data,
          descricao: `Dinheiro não identificado no caixa físico (${d.vendaHora ?? ""})`,
          valor: d.vendaValor,
          tipo: "dinheiro" as const,
        })),
      ...resultadoExibido.pagamentos
        .filter((p) => p.status === "pendente")
        .map((p, i) => ({
          id: `pagamento-${data}-${i}`,
          data,
          descricao: p.historico,
          valor: p.valor,
          tipo: "pagamento" as const,
        })),
    ];
    upsertPendencias(data, novasPendencias);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultadoExibido]);

  // Assim que um item de recebimento fica "conciliado", ele é lançado automaticamente em
  // Contas a Receber — sem precisar de botão. O mapa `migrados` evita lançar duas vezes.
  useEffect(() => {
    if (!resultadoExibido) return;
    const data = resultadoExibido.data;
    const migrados = resultadoExibido.migrados ?? {};
    const novosReceivables: Receivable[] = [];
    const novasChaves: Record<string, string> = {};

    resultadoExibido.pix.forEach((item, i) => {
      const chave = `pix-${i}`;
      if (item.status !== "conciliado" || migrados[chave]) return;
      const id = genId("r");
      novasChaves[chave] = id;
      novosReceivables.push({
        id,
        cliente: "—",
        classificacao: "Faturamento",
        categoria: "Faturamento Geral",
        vencimento: data,
        valor: item.vendaValor,
        status: "recebido",
        recebimento: data,
        descricao: `Venda Pix${item.vendaHora ? ` - ${item.vendaHora}` : ""}`,
        formaRecebimento: "Pix",
      });
    });

    resultadoExibido.dinheiro.forEach((item, i) => {
      const chave = `dinheiro-${i}`;
      if (item.status !== "conciliado" || migrados[chave]) return;
      const id = genId("r");
      novasChaves[chave] = id;
      novosReceivables.push({
        id,
        cliente: "—",
        classificacao: "Faturamento",
        categoria: "Faturamento Geral",
        vencimento: data,
        valor: item.vendaValor,
        status: "recebido",
        recebimento: data,
        descricao: `Venda Dinheiro${item.vendaHora ? ` - ${item.vendaHora}` : ""}`,
        formaRecebimento: "Dinheiro",
      });
    });

    const { cartao } = resultadoExibido;
    if (cartao.quantidadeBate && cartao.valorBate && cartao.faturamentoTotal > 0 && !migrados["cartao"]) {
      const id = genId("r");
      novasChaves["cartao"] = id;
      novosReceivables.push({
        id,
        cliente: "—",
        classificacao: "Faturamento",
        categoria: "Faturamento Geral",
        vencimento: data,
        valor: cartao.faturamentoTotal,
        status: "recebido",
        recebimento: data,
        descricao: "Vendas Cartão (Crédito + Débito)",
        formaRecebimento: "Cartão",
      });
    }

    if (novosReceivables.length > 0) {
      finance.addReceivable(novosReceivables);
      historico.marcarMigrados(data, novasChaves);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultadoExibido]);

  function editarItem(
    tipo: "pix" | "dinheiro" | "pagamento",
    index: number,
    patch: { status?: "conciliado" | "pendente"; matchInfo?: string }
  ) {
    if (!dataSelecionada) return;

    // Se o item já tinha sido lançado automaticamente e o usuário corrigiu de volta pra
    // pendente, desfaz o lançamento em Contas a Receber pra não deixar duplicado/errado.
    if ((tipo === "pix" || tipo === "dinheiro") && patch.status === "pendente") {
      const chave = `${tipo}-${index}`;
      const idMigrado = resultadoExibido?.migrados?.[chave];
      if (idMigrado) {
        finance.deleteReceivables([idMigrado]);
        historico.desmarcarMigrado(dataSelecionada, chave);
      }
    }

    historico.atualizarItem(dataSelecionada, (r) => {
      if (tipo === "pagamento") {
        return {
          ...r,
          pagamentos: r.pagamentos.map((p, i) => (i === index ? { ...p, status: patch.status ?? p.status } : p)),
        };
      }
      if (tipo === "pix") {
        return {
          ...r,
          pix: r.pix.map((it, i) =>
            i === index ? { ...it, matchInfo: patch.matchInfo ?? it.matchInfo, status: patch.status ?? it.status } : it
          ),
        };
      }
      return {
        ...r,
        dinheiro: r.dinheiro.map((it, i) =>
          i === index ? { ...it, matchInfo: patch.matchInfo ?? it.matchInfo, status: patch.status ?? it.status } : it
        ),
      };
    });
  }

  const datasComPendencia = useMemo(
    () => [...new Set(pendencias.map((p) => p.data))].sort().reverse(),
    [pendencias]
  );
  const pendenciasFiltradas = filtroPendencias ? pendencias.filter((p) => p.data === filtroPendencias) : pendencias;
  const pendenciasVisiveis =
    filtroPendencias || verTodasPendencias ? pendenciasFiltradas : pendenciasFiltradas.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {pendencias.length > 0 && (
        <div className="rounded-lg border border-warn-500/30 bg-warn-100 px-4 py-3 text-sm text-warn-500">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">
              {pendenciasFiltradas.length} conciliaç{pendenciasFiltradas.length > 1 ? "ões pendentes" : "ão pendente"}
              {filtroPendencias ? ` em ${formatDateBR(filtroPendencias)}` : " de períodos anteriores"}
            </span>
            <select
              value={filtroPendencias}
              onChange={(e) => {
                setFiltroPendencias(e.target.value);
                setVerTodasPendencias(false);
              }}
              className="rounded-md border border-warn-500/30 bg-white px-2 py-1 text-xs font-medium text-warn-600"
            >
              <option value="">Todas as datas</option>
              {datasComPendencia.map((d) => (
                <option key={d} value={d}>
                  {formatDateBR(d)}
                </option>
              ))}
            </select>
          </div>
          <ul className="mt-2 flex flex-col gap-0.5 text-xs">
            {pendenciasVisiveis.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => historico.historico[p.data] && setDataOverride(p.data)}
                  disabled={!historico.historico[p.data]}
                  className="text-left underline decoration-dotted hover:text-warn-600 disabled:no-underline disabled:cursor-default"
                >
                  {formatDateBR(p.data)} · {p.descricao}
                </button>
              </li>
            ))}
          </ul>
          {!filtroPendencias && pendenciasFiltradas.length > 5 && (
            <button
              onClick={() => setVerTodasPendencias((v) => !v)}
              className="mt-2 text-xs font-medium text-warn-600 underline decoration-dotted"
            >
              {verTodasPendencias ? "Ver menos" : `Ver todas (${pendenciasFiltradas.length})`}
            </button>
          )}
        </div>
      )}

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-brand-900">Documentos do período</h2>
        <p className="mt-0.5 text-xs text-faint">
          Envie os 4 documentos para começar a conciliação. O relatório de faturamento é a base — as demais entradas são
          conferidas contra ele.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UploadBox icon={Landmark} title="Extrato Bradesco" hint="PDF ou print do extrato" onExtracted={setBradescoRaw} />
          <UploadBox icon={Landmark} title="Extrato PagBank" hint="Extrato da conta/maquininha PagBank (PDF)" onExtracted={setPagbankRaw} />
          <UploadBox icon={FileImage} title="Foto do caixa físico" hint="Anexo de referência — digite os valores abaixo" />
          <UploadBox icon={FileSpreadsheet} title="Relatório de faturamento" hint="Vendas do período (PDF, base da conciliação)" onExtracted={setFaturamentoRaw} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-brand-900">Movimento do caixa físico</h2>
        <CaixaFisicoManualTable movimentos={caixaMovs} onChange={setCaixaMovs} />
      </div>

      {!resultadoExibido && (
        <div className="card card-dashed flex flex-col items-center gap-2 p-12 text-center">
          <p className="text-sm text-muted">
            Envie ao menos o relatório de faturamento para iniciar a conciliação do dia, ou escolha uma data já
            conciliada acima.
          </p>
        </div>
      )}
      {resultadoExibido && (
        <ConciliacaoResultado
          resultado={resultadoExibido}
          datas={historico.datas}
          dataSelecionada={dataSelecionada ?? undefined}
          onNavegar={setDataOverride}
          onEditarItem={editarItem}
          onLancado={(chave) => dataSelecionada && historico.marcarMigrados(dataSelecionada, { [chave]: "lancado" })}
        />
      )}
    </div>
  );
}

function OutrasEmpresas() {
  const [raw, setRaw] = useState<Extraido>(null);
  const [rawPagbank, setRawPagbank] = useState<Extraido>(null);
  const faturamento = useMemo(() => (raw ? parseFaturamento(raw.text) : null), [raw]);
  const pagbank = useMemo(() => (rawPagbank ? parsePagBank(rawPagbank.text) : null), [rawPagbank]);

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-brand-900">Movimento de outras empresas</h2>
        <p className="mt-0.5 text-xs text-faint">
          Relatórios de outras empresas do grupo, no mesmo formato — fica separado da conciliação da MJ Prime, sem lançar
          nada automaticamente em Contas a Pagar/DRE.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UploadBox icon={FileSpreadsheet} title="Relatório de faturamento" hint="Mesmo formato usado na MJ Prime" onExtracted={setRaw} />
          <UploadBox icon={Landmark} title="Extrato PagBank" hint="Mesmo formato usado na MJ Prime" onExtracted={setRawPagbank} />
        </div>
      </div>

      {(faturamento || pagbank) && (
        <div className="card overflow-hidden">
          <div className="p-5 pb-3">
            <h3 className="text-sm font-semibold text-brand-900">Lançamentos identificados</h3>
            <p className="text-xs text-faint">Apenas para consulta — não altera o financeiro da MJ Prime</p>
          </div>
          <div className="overflow-x-auto px-5 pb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left text-xs text-faint">
                  <th className="pb-2 font-medium">Origem</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 font-medium">Descrição</th>
                  <th className="pb-2 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {faturamento?.vendas.map((v, i) => (
                  <tr key={`v-${i}`} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 text-muted">Faturamento</td>
                    <td className="py-2 text-muted">{v.data}</td>
                    <td className="py-2 text-brand-900">
                      Venda {v.forma} · {v.hora}
                    </td>
                    <td className="py-2 text-right tabular-nums text-brand-900">R$ {v.valor.toFixed(2)}</td>
                  </tr>
                ))}
                {pagbank?.movimentos.map((m, i) => (
                  <tr key={`p-${i}`} className="border-b border-border-subtle last:border-0">
                    <td className="py-2 text-muted">PagBank</td>
                    <td className="py-2 text-muted">{m.data}</td>
                    <td className="py-2 text-brand-900">{m.descricao}</td>
                    <td className="py-2 text-right tabular-nums text-brand-900">R$ {m.valor.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConciliacaoBancariaPage() {
  const [aba, setAba] = useState<"mj-prime" | "outras">("mj-prime");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-border-subtle">
        <button
          onClick={() => setAba("mj-prime")}
          className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-sm transition-colors ${
            aba === "mj-prime" ? "border-client-accent font-medium text-brand-900" : "border-transparent text-muted hover:text-brand-900"
          }`}
        >
          <Building2 size={14} />
          MJ Prime
        </button>
        <button
          onClick={() => setAba("outras")}
          className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-sm transition-colors ${
            aba === "outras" ? "border-client-accent font-medium text-brand-900" : "border-transparent text-muted hover:text-brand-900"
          }`}
        >
          <Users size={14} />
          Movimento de outras empresas
        </button>
      </div>

      {aba === "mj-prime" ? <DocumentosMjPrime /> : <OutrasEmpresas />}
    </div>
  );
}
