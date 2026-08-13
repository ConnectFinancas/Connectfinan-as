"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, FileSpreadsheet, Landmark, Trash2, Users } from "lucide-react";
import { UploadBox } from "@/components/client/UploadBox";
import { CaixaFisicoManualTable } from "@/components/client/CaixaFisicoManualTable";
import { ConciliacaoResultado } from "@/components/client/ConciliacaoResultado";
import { useFinance, genId } from "@/lib/store/FinanceContext";
import { Payable, Receivable } from "@/lib/types";
import { parseFaturamento, parseBradesco, parsePagBank } from "@/lib/reconciliation/parsers";
import { conciliarDia } from "@/lib/reconciliation/match";
import { CaixaFisicoExtraido, MovimentoCaixaFisico } from "@/lib/reconciliation/types";
import { usePendencias } from "@/lib/reconciliation/pendenciasStore";
import { useConciliacaoHistorico, ResultadoSalvo } from "@/lib/reconciliation/historicoStore";
import { formatDateBR } from "@/lib/today";

type Extraido = { text: string; viaOcr: boolean; file: File } | null;

function DocumentosMjPrime() {
  const finance = useFinance();
  const { pendencias, upsertPendencias, limparTudo: limparPendencias } = usePendencias(finance.client.slug);
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
    () => (bradescoRaw ? parseBradesco(bradescoRaw.text, anoReferencia, bradescoRaw.viaOcr) : null),
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

  // Depende do objeto inteiro (não só da data): sem isso, enviar um documento novo ou
  // digitar uma linha do caixa físico depois do primeiro salvamento do dia não atualizava
  // o que ficava exibido — a tela ficava presa no primeiro resultado calculado.
  useEffect(() => {
    if (!resultado) return;
    historico.salvar(resultado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado]);

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
      ...(resultadoExibido.cartaoVendas ?? [])
        .filter((v) => v.status === "pendente")
        .map((v, i) => ({
          id: `cartaoVenda-${data}-${i}`,
          data,
          descricao: `Venda no cartão não identificada no PagBank (${v.vendaHora ?? ""})`,
          valor: v.vendaValor,
          tipo: "cartao" as const,
        })),
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

  function editarItem(
    tipo: "pix" | "dinheiro" | "cartaoVenda" | "pagamento",
    index: number,
    patch: { status?: "conciliado" | "pendente"; matchInfo?: string }
  ) {
    if (!dataSelecionada) return;

    // Se o item já tinha sido lançado automaticamente e o usuário corrigiu de volta pra
    // pendente, desfaz o lançamento em Contas a Receber pra não deixar duplicado/errado.
    if (tipo !== "pagamento" && patch.status === "pendente") {
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
      if (tipo === "cartaoVenda") {
        return {
          ...r,
          cartaoVendas: (r.cartaoVendas ?? []).map((it, i) =>
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

  // Prepara o(s) lançamento(s) equivalentes a uma chave (ex.: "pix-0", "cartaoVenda-2", "pagamento-2")
  // sem gravar nada ainda — usado tanto pelo clique individual quanto pelo lote.
  function prepararMigracao(
    chave: string
  ): { receivable?: Receivable; payable?: Payable; payableExtra?: Payable; precisaCategoriaFallback?: boolean } | null {
    if (!resultadoExibido) return null;
    const data = resultadoExibido.data;
    const migrados = resultadoExibido.migrados ?? {};
    if (migrados[chave]) return null;

    if (chave.startsWith("pix-") || chave.startsWith("dinheiro-") || chave.startsWith("cartaoVenda-")) {
      const tipo = chave.startsWith("pix-") ? "pix" : chave.startsWith("dinheiro-") ? "dinheiro" : "cartaoVenda";
      const idx = Number(chave.split("-")[1]);
      const item =
        tipo === "pix" ? resultadoExibido.pix[idx] : tipo === "dinheiro" ? resultadoExibido.dinheiro[idx] : (resultadoExibido.cartaoVendas ?? [])[idx];
      if (!item || item.status !== "conciliado") return null;
      const rotulo = tipo === "pix" ? "Pix" : tipo === "dinheiro" ? "Dinheiro" : "Cartão";
      const receivable: Receivable = {
        id: genId("r"),
        cliente: "—",
        classificacao: "Faturamento",
        categoria: "Faturamento Geral",
        vencimento: data,
        valor: item.vendaValor,
        status: "recebido",
        recebimento: data,
        descricao: `Venda ${rotulo}${item.vendaHora ? ` - ${item.vendaHora}` : ""}`,
        formaRecebimento: rotulo,
      };

      // Cartão: a diferença entre o valor vendido e o valor recebido no PagBank é a taxa
      // da maquineta — vira automaticamente uma despesa em Contas a Pagar, já paga (a taxa
      // é descontada na hora), pra ficar registrada junto com a venda.
      if (tipo === "cartaoVenda") {
        const cartaoItem = (resultadoExibido.cartaoVendas ?? [])[idx];
        const recebido = cartaoItem?.match?.valor;
        const taxa = recebido !== undefined ? Math.round((item.vendaValor - recebido) * 100) / 100 : 0;
        if (taxa > 0.01) {
          return {
            receivable,
            payableExtra: {
              id: genId("p"),
              favorecido: "—",
              classificacao: "DESPESAS FINANCEIRAS",
              categoria: "Tarifas de Maquininhas",
              vencimento: data,
              valor: taxa,
              status: "pago",
              pagamento: data,
              descricao: `Taxa maquineta - venda cartão${item.vendaHora ? ` ${item.vendaHora}` : ""}`,
            },
          };
        }
      }

      return { receivable };
    }

    if (chave.startsWith("pagamento-")) {
      const idx = Number(chave.split("-")[1]);
      const p = resultadoExibido.pagamentos[idx];
      if (!p || p.tipo !== "pagamento") return null;
      const ignorado = (resultadoExibido.ignorados ?? []).includes(chave);
      const match = ignorado ? undefined : p.matchLancamento;
      if (match) return { payable: { ...match, id: match.id } };
      return {
        payable: {
          id: genId("p"),
          favorecido: p.sugestao?.favorecido || "—",
          classificacao: "DESPESAS ADMINISTRATIVAS",
          categoria: "A Classificar",
          vencimento: p.data,
          valor: p.valor,
          status: "pago",
          pagamento: p.data,
          descricao: p.historico,
        },
        precisaCategoriaFallback: true,
      };
    }

    return null;
  }

  // Clique em "Conciliar" num item: só cria o lançamento quando ainda não existe (pagamento já
  // vinculado a um lançamento existente apenas confirma o vínculo, sem duplicar).
  function conciliarItem(chave: string) {
    if (!dataSelecionada) return;
    const preparo = prepararMigracao(chave);
    if (!preparo) return;
    if (preparo.receivable) finance.addReceivable([preparo.receivable]);
    if (preparo.payable) {
      const jaExiste = finance.payables.some((p) => p.id === preparo.payable!.id);
      if (!jaExiste) {
        if (preparo.precisaCategoriaFallback) finance.addCategoria("pagar", "DESPESAS ADMINISTRATIVAS", "A Classificar");
        finance.addPayable([preparo.payable]);
      }
    }
    if (preparo.payableExtra) finance.addPayable([preparo.payableExtra]);
    const id = preparo.receivable?.id ?? preparo.payable?.id;
    const chaves: Record<string, string> = {};
    if (id) chaves[chave] = id;
    if (preparo.payableExtra) chaves[`${chave}-taxa`] = preparo.payableExtra.id;
    if (Object.keys(chaves).length > 0) historico.marcarMigrados(dataSelecionada, chaves);
  }

  // Mesma lógica em lote, usada pela seleção múltipla ("Selecionar lançamentos" + Conciliar).
  function conciliarLote(chaves: string[]) {
    if (!dataSelecionada) return;
    const novosReceivables: Receivable[] = [];
    const novosPayables: Payable[] = [];
    const novasChaves: Record<string, string> = {};
    let precisaCategoriaFallback = false;

    chaves.forEach((chave) => {
      const preparo = prepararMigracao(chave);
      if (!preparo) return;
      if (preparo.receivable) novosReceivables.push(preparo.receivable);
      if (preparo.payable) {
        const jaExiste = finance.payables.some((p) => p.id === preparo.payable!.id);
        if (!jaExiste) {
          novosPayables.push(preparo.payable);
          if (preparo.precisaCategoriaFallback) precisaCategoriaFallback = true;
        }
      }
      if (preparo.payableExtra) {
        novosPayables.push(preparo.payableExtra);
        novasChaves[`${chave}-taxa`] = preparo.payableExtra.id;
      }
      const id = preparo.receivable?.id ?? preparo.payable?.id;
      if (id) novasChaves[chave] = id;
    });

    if (precisaCategoriaFallback) finance.addCategoria("pagar", "DESPESAS ADMINISTRATIVAS", "A Classificar");
    if (novosReceivables.length > 0) finance.addReceivable(novosReceivables);
    if (novosPayables.length > 0) finance.addPayable(novosPayables);
    if (Object.keys(novasChaves).length > 0) historico.marcarMigrados(dataSelecionada, novasChaves);
  }

  // "Desvincular": desfaz uma correspondência encontrada (automática ou manual), voltando o
  // item pra pendente — pra depois buscar outro lançamento ou criar um novo.
  function desvincularItem(chave: string) {
    if (!dataSelecionada) return;
    if (chave.startsWith("pix-") || chave.startsWith("dinheiro-") || chave.startsWith("cartaoVenda-")) {
      const tipo = chave.startsWith("pix-") ? "pix" : chave.startsWith("dinheiro-") ? "dinheiro" : "cartaoVenda";
      const idx = Number(chave.split("-")[1]);
      editarItem(tipo, idx, { status: "pendente", matchInfo: "" });
      return;
    }
    if (chave.startsWith("pagamento-")) {
      historico.desvincularMatch(dataSelecionada, chave);
    }
  }

  function desvincularLote(chaves: string[]) {
    chaves.forEach(desvincularItem);
  }

  function arquivarItem(chave: string) {
    if (dataSelecionada) historico.arquivarItem(dataSelecionada, chave);
  }

  function arquivarLote(chaves: string[]) {
    chaves.forEach(arquivarItem);
  }

  // "Desfazer conciliação": item já migrado volta a ficar pendente de confirmação. Se o
  // lançamento foi CRIADO pela conciliação, apaga ele; se era um lançamento que já existia
  // em Contas a Pagar (só foi vinculado), mantém — desfaz só o vínculo, sem apagar nada real.
  function desfazerConciliacao(chave: string) {
    if (!resultadoExibido || !dataSelecionada) return;
    const migrados = resultadoExibido.migrados ?? {};
    const id = migrados[chave];
    if (!id) return;

    if (chave.startsWith("pagamento-")) {
      const idx = Number(chave.split("-")[1]);
      const p = resultadoExibido.pagamentos[idx];
      const eraVinculoExistente = p?.matchLancamento?.id === id;
      if (!eraVinculoExistente) finance.deletePayables([id]);
      historico.desmarcarMigrado(dataSelecionada, chave);
      return;
    }

    // cartaoVenda pode ter uma taxa da maquineta lançada junto — desfaz os dois.
    const idTaxa = migrados[`${chave}-taxa`];
    if (idTaxa) {
      finance.deletePayables([idTaxa]);
      historico.desmarcarMigrado(dataSelecionada, `${chave}-taxa`);
    }

    finance.deleteReceivables([id]);
    historico.desmarcarMigrado(dataSelecionada, chave);
  }

  function desfazerConciliacaoLote(chaves: string[]) {
    chaves.forEach(desfazerConciliacao);
  }

  function desarquivarItem(chave: string) {
    if (dataSelecionada) historico.desarquivarItem(dataSelecionada, chave);
  }

  // Corrige manualmente a descrição/valor de um lançamento do extrato bancário quando a
  // leitura automática (OCR/PDF) não foi boa — hoje é o único tipo de item sem nenhum
  // "match" de valor confiável do lado da venda, então é o que mais precisa de correção.
  function editarPagamentoBanco(index: number, patch: { historico?: string; valor?: number }) {
    if (!dataSelecionada) return;
    historico.atualizarItem(dataSelecionada, (r) => ({
      ...r,
      pagamentos: r.pagamentos.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }

  // Apaga pendências + histórico salvo da conciliação (e os lançamentos que foram criados
  // automaticamente a partir dele, pra não duplicar ao refazer), voltando a tela ao zero.
  function limparConciliacao() {
    const confirmado = window.confirm(
      "Isso vai apagar todo o histórico e as pendências de conciliação salvos, além dos lançamentos criados automaticamente a partir deles em Contas a Receber/Pagar. Lançamentos que você criou manualmente não são afetados. Deseja continuar?"
    );
    if (!confirmado) return;

    const idsReceber: string[] = [];
    const idsPagar: string[] = [];
    Object.values(historico.historico).forEach((dia) => {
      Object.values(dia.migrados ?? {}).forEach((id) => {
        if (id.startsWith("r_")) idsReceber.push(id);
        else if (id.startsWith("p_")) idsPagar.push(id);
      });
    });
    if (idsReceber.length > 0) finance.deleteReceivables(idsReceber);
    if (idsPagar.length > 0) finance.deletePayables(idsPagar);

    historico.limparTudo();
    limparPendencias();
    setFaturamentoRaw(null);
    setPagbankRaw(null);
    setBradescoRaw(null);
    setCaixaMovs([]);
    setDataOverride(null);
    setUltimoUpload(null);
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-brand-900">Documentos do período</h2>
            <p className="mt-0.5 text-xs text-faint">
              Envie os 3 documentos para começar a conciliação. O relatório de faturamento é a base — as demais entradas
              são conferidas contra ele. O caixa físico é digitado manualmente logo abaixo.
            </p>
          </div>
          <button
            onClick={limparConciliacao}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-muted hover:border-danger-500/40 hover:text-danger-500 transition-colors"
          >
            <Trash2 size={13} />
            Limpar conciliação
          </button>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <UploadBox icon={Landmark} title="Extrato Bradesco" hint="PDF ou print do extrato" onExtracted={setBradescoRaw} />
          <UploadBox icon={Landmark} title="Extrato PagBank" hint="Extrato da conta/maquininha PagBank (PDF)" onExtracted={setPagbankRaw} />
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
          onEditarPagamentoBanco={editarPagamentoBanco}
          onLancado={(chave) => dataSelecionada && historico.marcarMigrados(dataSelecionada, { [chave]: "lancado" })}
          onConciliar={conciliarItem}
          onConciliarLote={conciliarLote}
          onDesvincular={desvincularItem}
          onDesvincularLote={desvincularLote}
          onArquivar={arquivarItem}
          onArquivarLote={arquivarLote}
          onDesarquivar={desarquivarItem}
          onDesfazer={desfazerConciliacao}
          onDesfazerLote={desfazerConciliacaoLote}
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
