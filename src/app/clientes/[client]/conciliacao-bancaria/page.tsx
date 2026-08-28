"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, FilePlus2, FileSpreadsheet, Landmark, PenLine, Send, Trash2, Users } from "lucide-react";
import { UploadBox } from "@/components/client/UploadBox";
import { CaixaFisicoManualTable } from "@/components/client/CaixaFisicoManualTable";
import { FaturamentoManualTable, PagBankManualTable, BradescoManualTable, StoneManualTable } from "@/components/client/ManualEntryTables";
import { ConciliacaoResultado, BankLabels } from "@/components/client/ConciliacaoResultado";
import { useFinance, genId } from "@/lib/store/FinanceContext";
import { Client, Payable, Receivable, TransferenciaConta } from "@/lib/types";
import { parseFaturamento, parseBradesco, parsePagBank } from "@/lib/reconciliation/parsers";
import { conciliarDia, conciliarDiaMjShoes, recalcularDinheiro } from "@/lib/reconciliation/match";
import { CaixaFisicoExtraido, MovimentoBradesco, MovimentoCaixaFisico, MovimentoPagBank, VendaExtraida } from "@/lib/reconciliation/types";
import { usePendencias } from "@/lib/reconciliation/pendenciasStore";
import { useConciliacaoHistorico, ResultadoSalvo } from "@/lib/reconciliation/historicoStore";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";

type Extraido = { text: string; viaOcr: boolean; file: File } | null;

// Configuração dos bancos usados na Conciliação Bancária de cada cliente. MJ Prime usa
// Bradesco (pix/saídas) + PagBank (cartão) com leitura automática de PDF/foto e a taxa da
// maquineta calculada por diferença entre venda e recebido. MJ Shoes usa Banco do Brasil +
// Stone, só por preenchimento manual (sem parser ainda — precisa de exemplo real do extrato
// pra calibrar), com a taxa da Stone somada direto do que já vem discriminado no relatório, e
// pedindo pro usuário confirmar manualmente a data da conciliação (documentos que chegam do
// cliente costumam cobrir vários dias de uma vez).
type BancoConfig = {
  banco1Chave: "pagbank" | "stone";
  banco1Nome: string;
  banco2Chave: "bradesco" | "bancoBrasil";
  banco2Nome: string;
  mostrarUploadFaturamento: boolean;
  // A leitura automática do PDF/foto (parsePagBank/parseBradesco) só existe pro formato da
  // MJ Prime — pra outros bancos ainda sem parser calibrado, o anexo continua disponível (fica
  // guardado e o texto lido pode ser consultado), mas os valores entram pelo preenchimento
  // manual mesmo, pra não arriscar extrair número errado de um formato desconhecido.
  leituraAutomatica: boolean;
  requerSelecaoData: boolean;
  taxaDoRelatorio: boolean;
  bankLabels: BankLabels;
};

function getBancoConfig(client: Client): BancoConfig {
  if (client.slug === "mj-shoes") {
    return {
      banco1Chave: "stone",
      banco1Nome: "Stone",
      banco2Chave: "bancoBrasil",
      banco2Nome: "Banco do Brasil",
      mostrarUploadFaturamento: false,
      leituraAutomatica: false,
      requerSelecaoData: true,
      taxaDoRelatorio: true,
      bankLabels: {
        cartao: "Stone",
        cartaoArtigo: "na",
        extrato: "Banco do Brasil",
        origemLabels: { stone: "Stone", bancoBrasil: "Banco do Brasil" },
        origemOrdem: ["stone", "bancoBrasil"],
        origemArtigo: { stone: "da" },
        taxaDoRelatorio: true,
      },
    };
  }
  return {
    banco1Chave: "pagbank",
    banco1Nome: "PagBank",
    banco2Chave: "bradesco",
    banco2Nome: "Bradesco",
    mostrarUploadFaturamento: true,
    leituraAutomatica: true,
    requerSelecaoData: false,
    taxaDoRelatorio: false,
    bankLabels: {
      cartao: "PagBank",
      extrato: "Bradesco",
      origemLabels: { pagbank: "PagBank", bradesco: "Bradesco", caixa: "Caixa Físico" },
      origemOrdem: ["pagbank", "caixa", "bradesco"],
    },
  };
}

function DocumentosCliente() {
  const finance = useFinance();
  const bancoConfig = getBancoConfig(finance.client);
  const { pendencias, upsertPendencias } = usePendencias(finance.client.slug);
  const historico = useConciliacaoHistorico(finance.client.slug);
  const [dataOverride, setDataOverride] = useState<string | null>(null);
  const [ultimoUpload, setUltimoUpload] = useState<string | null>(null);
  // Enquanto true, esconde o resultado do último dia já conciliado (que normalmente aparece
  // sozinho quando não há upload novo) — pra não misturar uma conciliação já pronta com o que
  // está sendo digitado/anexado agora pra um dia novo. Volta a false assim que um resultado novo
  // é calculado (ver efeito abaixo) ou quando o usuário navega pra uma data específica.
  const [iniciandoNova, setIniciandoNova] = useState(false);
  const [filtroPendencias, setFiltroPendencias] = useState("");
  const [verTodasPendencias, setVerTodasPendencias] = useState(false);

  const [faturamentoRaw, setFaturamentoRaw] = useState<Extraido>(null);
  const [pagbankRaw, setPagbankRaw] = useState<Extraido>(null);
  const [bradescoRaw, setBradescoRaw] = useState<Extraido>(null);
  const [caixaMovs, setCaixaMovs] = useState<MovimentoCaixaFisico[]>([]);
  // Preenchimento manual (alternativa ao anexo de documento) — soma com o que for lido dos
  // arquivos anexados, em vez de substituir, pra dar pra combinar upload + digitação.
  const [faturamentoManual, setFaturamentoManual] = useState<VendaExtraida[]>([]);
  const [pagbankManual, setPagbankManual] = useState<MovimentoPagBank[]>([]);
  const [bradescoManual, setBradescoManual] = useState<MovimentoBradesco[]>([]);
  const [mostrarManualFaturamento, setMostrarManualFaturamento] = useState(false);
  // Sem leitura automática pro banco, o preenchimento manual já é o principal jeito de entrar
  // com os valores — começa aberto, em vez de escondido atrás de um clique extra.
  const [mostrarManualPagbank, setMostrarManualPagbank] = useState(!bancoConfig.leituraAutomatica);
  const [mostrarManualBradesco, setMostrarManualBradesco] = useState(!bancoConfig.leituraAutomatica);
  // Só monta a conciliação depois que o usuário clicar em "Enviar informações" — evita ficar
  // recalculando/reorganizando as colunas a cada arquivo anexado, um por um.
  const [enviado, setEnviado] = useState(false);
  // Só usado quando bancoConfig.requerSelecaoData (MJ Shoes): o relatório enviado pelo cliente
  // costuma cobrir vários dias de uma vez, então em vez de assumir a data da primeira venda
  // lida, o sistema mostra as datas encontradas nos documentos e o usuário confirma qual delas
  // é a conciliação de agora.
  const [dataConciliacao, setDataConciliacao] = useState<string | null>(null);

  const faturamentoParsed = useMemo(() => (faturamentoRaw ? parseFaturamento(faturamentoRaw.text) : null), [faturamentoRaw]);
  const pagbankParsed = useMemo(
    () => (pagbankRaw && bancoConfig.leituraAutomatica ? parsePagBank(pagbankRaw.text) : null),
    [pagbankRaw, bancoConfig.leituraAutomatica]
  );
  const anoReferencia =
    (faturamentoParsed?.vendas[0]?.data ?? faturamentoManual[0]?.data)?.slice(0, 4) ?? String(new Date().getFullYear());
  const bradescoParsed = useMemo(
    () => (bradescoRaw && bancoConfig.leituraAutomatica ? parseBradesco(bradescoRaw.text, anoReferencia, bradescoRaw.viaOcr) : null),
    [bradescoRaw, anoReferencia, bancoConfig.leituraAutomatica]
  );

  // Junta o que veio do documento anexado (se houver) com o que foi digitado manualmente —
  // os dois convivem, então dá pra completar com a mão só o que faltou na leitura automática.
  const faturamento = useMemo(() => {
    const vendas = [...(faturamentoParsed?.vendas ?? []), ...faturamentoManual];
    if (vendas.length === 0) return null;
    const totalPorForma: Record<string, number> = {};
    vendas.forEach((v) => {
      totalPorForma[v.forma] = Math.round(((totalPorForma[v.forma] ?? 0) + v.valor) * 100) / 100;
    });
    const totalGeral = Math.round(vendas.reduce((a, v) => a + v.valor, 0) * 100) / 100;
    return { vendas, totalPorForma, totalGeral };
  }, [faturamentoParsed, faturamentoManual]);

  const pagbank = useMemo(() => {
    const movimentos = [...(pagbankParsed?.movimentos ?? []), ...pagbankManual];
    return movimentos.length > 0 ? { movimentos } : null;
  }, [pagbankParsed, pagbankManual]);

  const bradesco = useMemo(() => {
    const movimentos = [...(bradescoParsed?.movimentos ?? []), ...bradescoManual];
    return movimentos.length > 0 ? { movimentos, viaOcr: bradescoParsed?.viaOcr ?? false } : null;
  }, [bradescoParsed, bradescoManual]);

  const caixa: CaixaFisicoExtraido = useMemo(() => ({ movimentos: caixaMovs }), [caixaMovs]);

  // Datas distintas encontradas nos documentos/preenchimentos atuais — só usado quando o
  // cliente exige seleção manual de data (MJ Shoes), como um lembrete pro usuário confirmar
  // no campo de data qual delas é a conciliação de agora.
  const datasEncontradas = useMemo(() => {
    const todas = [
      ...(faturamento?.vendas.map((v) => v.data) ?? []),
      ...(pagbank?.movimentos.map((m) => m.data) ?? []),
      ...(bradesco?.movimentos.map((m) => m.data) ?? []),
      ...caixaMovs.map((m) => m.data),
    ];
    return [...new Set(todas)].sort();
  }, [faturamento, pagbank, bradesco, caixaMovs]);

  const dataReferencia = bancoConfig.requerSelecaoData ? dataConciliacao : faturamento?.vendas[0]?.data ?? null;

  const resultado = useMemo(() => {
    if (!enviado || !faturamento || !dataReferencia) return null;
    if (bancoConfig.requerSelecaoData) {
      return conciliarDiaMjShoes(
        dataReferencia,
        faturamento,
        pagbank ?? { movimentos: [] },
        bradesco ?? { movimentos: [], viaOcr: false },
        caixa,
        finance.payables
      );
    }
    return conciliarDia(
      dataReferencia,
      faturamento,
      pagbank ?? { movimentos: [] },
      bradesco ?? { movimentos: [], viaOcr: false },
      caixa,
      finance.payables,
      finance.client.titularKeywords ?? [finance.client.name.toUpperCase()]
    );
  }, [enviado, faturamento, pagbank, bradesco, caixa, dataReferencia, finance.payables, finance.client, bancoConfig.requerSelecaoData]);

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
    setIniciandoNova(false);
  }

  const dataSelecionada = dataOverride ?? resultado?.data ?? (iniciandoNova ? null : historico.datas[0]) ?? null;

  const resultadoExibido: ResultadoSalvo | null = dataSelecionada
    ? historico.historico[dataSelecionada] ?? (resultado?.data === dataSelecionada ? resultado : null)
    : null;

  useEffect(() => {
    if (!resultadoExibido) return;
    const data = resultadoExibido.data;
    const arquivados = resultadoExibido.arquivados ?? [];
    const migrados = resultadoExibido.migrados ?? {};
    const naoResolvido = (chave: string) => !arquivados.includes(chave) && !migrados[chave];
    const novasPendencias = [
      ...(resultadoExibido.cartaoVendas ?? [])
        .map((v, i) => ({ v, chave: `cartaoVenda-${i}` }))
        .filter(({ v, chave }) => v.status === "pendente" && naoResolvido(chave))
        .map(({ v, chave }) => ({
          id: `${chave}-${data}`,
          data,
          descricao: `Venda no cartão não identificada ${bancoConfig.bankLabels.cartaoArtigo ?? "no"} ${bancoConfig.banco1Nome} (${v.vendaHora ?? ""})`,
          valor: v.vendaValor ?? 0,
          tipo: "cartao" as const,
        })),
      ...resultadoExibido.pix
        .map((p, i) => ({ p, chave: `pix-${i}` }))
        .filter(({ p, chave }) => p.status === "pendente" && naoResolvido(chave))
        .map(({ p, chave }) => ({
          id: `${chave}-${data}`,
          data,
          descricao: `Pix não identificado no ${bancoConfig.banco2Nome} (${p.vendaHora ?? ""})`,
          valor: p.vendaValor ?? 0,
          tipo: "pix" as const,
        })),
      ...resultadoExibido.dinheiro
        .map((d, i) => ({ d, chave: `dinheiro-${i}` }))
        .filter(({ d, chave }) => d.status === "pendente" && naoResolvido(chave))
        .map(({ d, chave }) => ({
          id: `${chave}-${data}`,
          data,
          descricao: `Dinheiro não identificado no caixa físico (${d.vendaHora ?? ""})`,
          valor: d.vendaValor ?? 0,
          tipo: "dinheiro" as const,
        })),
      ...resultadoExibido.pagamentos
        .map((p, i) => ({ p, chave: `pagamento-${i}` }))
        .filter(({ p, chave }) => p.status === "pendente" && p.tipo === "pagamento" && naoResolvido(chave))
        .map(({ p, chave }) => ({
          id: `${chave}-${data}`,
          data,
          descricao: `[${p.origem}] ${p.historico}`,
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
  // sem gravar nada ainda — usado pelo clique em "Conciliar". Itens "sobra" (só do banco, sem
  // venda correspondente) e pagamentos sem lançamento encontrado não passam por aqui — esses usam
  // o fluxo de "Criar novo lançamento" (modal), que já entra na Contas a Receber/Pagar com o
  // usuário revisando classificação/categoria antes de salvar.
  function prepararMigracao(
    chave: string
  ): {
    receivable?: Receivable;
    payable?: Payable;
    transferencia?: TransferenciaConta;
    precisaCategoriaFallback?: boolean;
  } | null {
    if (!resultadoExibido) return null;
    const data = resultadoExibido.data;
    const migrados = resultadoExibido.migrados ?? {};
    if (migrados[chave]) return null;

    if (chave.startsWith("pix-") || chave.startsWith("dinheiro-") || chave.startsWith("cartaoVenda-")) {
      const tipo = chave.startsWith("pix-") ? "pix" : chave.startsWith("dinheiro-") ? "dinheiro" : "cartaoVenda";
      const idx = Number(chave.split("-")[1]);
      const rotulo = tipo === "pix" ? "Pix" : tipo === "dinheiro" ? "Dinheiro" : "Cartão";

      let valor: number | undefined;
      let vendaHora: string | undefined;
      if (tipo === "pix") {
        const it = resultadoExibido.pix[idx];
        if (!it || it.status !== "conciliado" || it.vendaValor === undefined) return null;
        valor = it.vendaValor;
        vendaHora = it.vendaHora;
      } else if (tipo === "dinheiro") {
        const it = resultadoExibido.dinheiro[idx];
        if (!it || it.status !== "conciliado" || it.vendaValor === undefined) return null;
        valor = it.vendaValor;
        vendaHora = it.vendaHora;
      } else {
        const it = (resultadoExibido.cartaoVendas ?? [])[idx];
        if (!it || it.status !== "conciliado" || it.vendaValor === undefined) return null;
        valor = it.vendaValor;
        vendaHora = it.vendaHora;
      }
      if (valor === undefined) return null;

      // Conta bancária onde o valor efetivamente entrou — cartão liquida no PagBank, pix no
      // Bradesco, dinheiro fica no caixa físico. Usado no ledger de Contas.
      const contaPorTipo = { pix: bancoConfig.banco2Nome, dinheiro: "Caixa Físico", cartaoVenda: bancoConfig.banco1Nome };

      const receivable: Receivable = {
        id: genId("r"),
        cliente: "—",
        classificacao: "Faturamento",
        categoria: "Faturamento Geral",
        vencimento: data,
        valor,
        status: "recebido",
        recebimento: data,
        descricao: `Venda ${rotulo}${vendaHora ? ` - ${vendaHora}` : ""}`,
        formaRecebimento: rotulo,
        conta: contaPorTipo[tipo],
      };
      return { receivable };
    }

    if (chave.startsWith("pagamento-")) {
      const idx = Number(chave.split("-")[1]);
      const p = resultadoExibido.pagamentos[idx];
      if (!p) return null;
      const contaPorOrigem: Record<string, string> = {
        [bancoConfig.banco1Chave]: bancoConfig.banco1Nome,
        [bancoConfig.banco2Chave]: bancoConfig.banco2Nome,
        caixa: "Caixa Físico",
      };
      if (p.tipo === "transferencia") {
        const contaOrigem = contaPorOrigem[p.origem] ?? p.origem;
        const contaDestino = p.contraparte
          ? contaPorOrigem[p.contraparte.origem] ?? p.contraparte.origem
          : contaOrigem === bancoConfig.banco2Nome
            ? bancoConfig.banco1Nome
            : bancoConfig.banco2Nome;
        return {
          transferencia: {
            id: genId("t"),
            data: p.data,
            valor: p.valor,
            contaOrigem,
            contaDestino,
            descricao: p.historico,
          },
        };
      }
      if (p.tipo !== "pagamento") return null;
      const ignorado = (resultadoExibido.ignorados ?? []).includes(chave);
      const match = ignorado ? undefined : p.matchLancamento;
      if (match) return { payable: { ...match, id: match.id, conta: match.conta ?? contaPorOrigem[p.origem] ?? p.origem } };
      return {
        payable: {
          id: genId("p"),
          favorecido: p.sugestao?.favorecido || "—",
          classificacao: p.sugestao?.classificacao || "DESPESAS ADMINISTRATIVAS",
          categoria: p.sugestao?.categoria || "A Classificar",
          vencimento: p.data,
          valor: p.valor,
          status: "pago",
          pagamento: p.data,
          descricao: p.historico,
          conta: contaPorOrigem[p.origem] ?? p.origem,
        },
        precisaCategoriaFallback: !p.sugestao?.categoria,
      };
    }

    return null;
  }

  // Clique em "Conciliar" num item: só cria o lançamento quando ainda não existe (pagamento já
  // vinculado a um lançamento existente apenas confirma o vínculo, sem duplicar). Transferência
  // entre contas não cria lançamento nenhum — só marca como conferida.
  function conciliarItem(chave: string) {
    if (!dataSelecionada) return;
    const preparo = prepararMigracao(chave);
    if (!preparo) return;
    if (preparo.transferencia) {
      finance.addTransferencia(preparo.transferencia);
      historico.marcarMigrados(dataSelecionada, { [chave]: preparo.transferencia.id });
      return;
    }
    if (preparo.receivable) finance.addReceivable([preparo.receivable]);
    if (preparo.payable) {
      const jaExiste = finance.payables.some((p) => p.id === preparo.payable!.id);
      if (!jaExiste) {
        if (preparo.precisaCategoriaFallback) finance.addCategoria("pagar", preparo.payable.classificacao, preparo.payable.categoria);
        finance.addPayable([preparo.payable]);
      }
    }
    const id = preparo.receivable?.id ?? preparo.payable?.id;
    if (id) historico.marcarMigrados(dataSelecionada, { [chave]: id });
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

  // "Excluir": remove o lançamento da conciliação — não aparece mais em nenhuma seção nem
  // na mensagem de pendências. Diferente de "Desfazer", não mexe em nada que já foi criado
  // em Contas a Receber/Pagar (só se aplica a itens ainda não conciliados).
  function excluirItem(chave: string) {
    if (dataSelecionada) historico.arquivarItem(dataSelecionada, chave);
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
      if (id.startsWith("t_")) finance.deleteTransferencias([id]);
      else if (!eraVinculoExistente && id !== "confirmado" && id !== "lancado") finance.deletePayables([id]);
      historico.desmarcarMigrado(dataSelecionada, chave);
      return;
    }

    if (id !== "lancado") finance.deleteReceivables([id]);
    historico.desmarcarMigrado(dataSelecionada, chave);
  }

  // "Marcar como transferência": reclassifica manualmente uma pendência de pagamento que o
  // sistema não detectou sozinho como transferência entre contas da própria empresa (ex.: mesmo
  // valor de saída no PagBank e entrada no Bradesco, mas com histórico diferente do esperado) —
  // em vez de virar um lançamento em Contas a Pagar, vira um movimento na aba Contas.
  function transformarEmTransferencia(chave: string) {
    if (!dataSelecionada || !resultadoExibido) return;
    if (!chave.startsWith("pagamento-")) return;
    if (resultadoExibido.migrados?.[chave]) return;
    const idx = Number(chave.split("-")[1]);
    const p = resultadoExibido.pagamentos[idx];
    if (!p || p.tipo !== "pagamento") return;

    const contaPorOrigem: Record<string, string> = {
      [bancoConfig.banco1Chave]: bancoConfig.banco1Nome,
      [bancoConfig.banco2Chave]: bancoConfig.banco2Nome,
      caixa: "Caixa Físico",
    };
    const contaOrigem = contaPorOrigem[p.origem] ?? p.origem;
    const contaDestino = contaOrigem === bancoConfig.banco2Nome ? bancoConfig.banco1Nome : bancoConfig.banco2Nome;
    const transferencia: TransferenciaConta = {
      id: genId("t"),
      data: p.data,
      valor: p.valor,
      contaOrigem,
      contaDestino,
      descricao: p.historico,
    };

    historico.atualizarItem(dataSelecionada, (r) => ({
      ...r,
      pagamentos: r.pagamentos.map((item, i) =>
        i === idx ? { ...item, tipo: "transferencia" as const, matchLancamento: undefined, sugestao: undefined } : item
      ),
    }));
    finance.addTransferencia(transferencia);
    historico.marcarMigrados(dataSelecionada, { [chave]: transferencia.id });
  }

  // Corrige manualmente a descrição/valor de um lançamento do extrato bancário quando a
  // leitura automática (OCR/PDF) não foi boa.
  function editarPagamentoBanco(index: number, patch: { historico?: string; valor?: number }) {
    if (!dataSelecionada) return;
    historico.atualizarItem(dataSelecionada, (r) => ({
      ...r,
      pagamentos: r.pagamentos.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }

  // Qualquer alteração no caixa físico (adicionar, remover ou corrigir uma linha lançada errada)
  // passa por aqui: além de guardar a lista atualizada, se o dia em edição é o mesmo que está
  // sendo exibido, já refaz o pareamento da seção "Dinheiro" com o valor corrigido — não precisa
  // desvincular/religar na mão, o item já volta a bater sozinho com a venda do faturamento.
  function atualizarCaixaMovs(novos: MovimentoCaixaFisico[]) {
    setCaixaMovs(novos);
    if (dataSelecionada && resultado && resultado.data === dataSelecionada) {
      historico.atualizarItem(dataSelecionada, (r) => ({
        ...r,
        dinheiro: recalcularDinheiro(r.dinheiro, novos),
      }));
    }
  }

  // Troca a posição de dois quadrados dentro da mesma seção (arrastar e soltar).
  function trocarOrdem(secao: string, ordemNatural: string[], chaveA: string, chaveB: string) {
    if (!dataSelecionada) return;
    historico.trocarOrdem(dataSelecionada, secao, ordemNatural, chaveA, chaveB);
  }

  // ---------- Taxa da maquineta: lançamento conjunto (soma de todas as diferenças do dia) ----------
  function taxasCartaoPendentes(): { chave: string; hora?: string; taxa: number }[] {
    if (!resultadoExibido) return [];
    return (resultadoExibido.cartaoVendas ?? [])
      .map((item, i) => {
        // MJ Shoes (Stone): a taxa já vem discriminada por lançamento no relatório, usada
        // direto — sem calcular por diferença como se faz com o PagBank da MJ Prime.
        const taxa = bancoConfig.taxaDoRelatorio
          ? item.match?.taxa
          : item.match?.valor !== undefined && item.vendaValor !== undefined
            ? Math.round((item.vendaValor - item.match.valor) * 100) / 100
            : undefined;
        if (taxa === undefined) return null;
        return taxa > 0.01 ? { chave: `cartaoVenda-${i}`, hora: item.vendaHora, taxa } : null;
      })
      .filter((x): x is { chave: string; hora: string | undefined; taxa: number } => x !== null);
  }

  function confirmarTaxaAgregada() {
    if (!dataSelecionada || !resultadoExibido) return;
    if (resultadoExibido.migrados?.["cartao-taxa-agregada"]) return;
    const itens = taxasCartaoPendentes();
    if (itens.length === 0) return;
    const total = Math.round(itens.reduce((a, i) => a + i.taxa, 0) * 100) / 100;
    const detalhe = itens.map((i) => `${i.hora ?? "—"}: ${formatCurrencyPrecise(i.taxa)}`).join(" · ");
    const payable: Payable = {
      id: genId("p"),
      favorecido: "—",
      classificacao: "DESPESAS FINANCEIRAS",
      categoria: "Tarifas de Maquininhas",
      vencimento: dataSelecionada,
      valor: total,
      status: "pago",
      pagamento: dataSelecionada,
      descricao: `Taxa maquineta ${formatDateBR(dataSelecionada)} — ${detalhe} (total ${formatCurrencyPrecise(total)})`,
      conta: bancoConfig.banco1Nome,
    };
    finance.addPayable([payable]);
    historico.marcarMigrados(dataSelecionada, { "cartao-taxa-agregada": payable.id });
  }

  function desfazerTaxaAgregada() {
    if (!dataSelecionada || !resultadoExibido) return;
    const id = resultadoExibido.migrados?.["cartao-taxa-agregada"];
    if (!id) return;
    finance.deletePayables([id]);
    historico.desmarcarMigrado(dataSelecionada, "cartao-taxa-agregada");
  }

  // Esvazia os quadros de anexo/preenchimento manual e o caixa físico, sem mexer em nada que já
  // foi salvo no histórico — usado tanto ao limpar a conciliação do dia atual quanto ao começar
  // uma nova, pra não ficar reaproveitando sem querer o que já foi digitado/anexado antes.
  function limparFormularios() {
    setFaturamentoRaw(null);
    setPagbankRaw(null);
    setBradescoRaw(null);
    setCaixaMovs([]);
    setFaturamentoManual([]);
    setPagbankManual([]);
    setBradescoManual([]);
    setDataConciliacao(null);
    setUltimoUpload(null);
    setEnviado(false);
  }

  // "Nova conciliação": limpa os quadros de anexo/preenchimento manual (que podem estar com
  // dados de um dia já concluído) e esconde o resultado do último dia conciliado que aparece
  // sozinho quando não há upload novo — assim o usuário começa um dia novo do zero, sem misturar
  // com o que já foi feito. Nada do que já está salvo no histórico é apagado.
  function iniciarNovaConciliacao() {
    const temRascunhoNaoEnviado =
      !enviado &&
      (!!faturamentoRaw ||
        !!pagbankRaw ||
        !!bradescoRaw ||
        caixaMovs.length > 0 ||
        faturamentoManual.length > 0 ||
        pagbankManual.length > 0 ||
        bradescoManual.length > 0);
    if (
      temRascunhoNaoEnviado &&
      !window.confirm(
        "Isso vai limpar os documentos e lançamentos que você anexou/digitou mas ainda não enviou. Deseja continuar?"
      )
    ) {
      return;
    }
    limparFormularios();
    setDataOverride(null);
    setIniciandoNova(true);
  }

  // Apaga a conciliação SÓ do dia que está sendo mostrado na tela (e os lançamentos que foram
  // criados automaticamente a partir dele, pra não duplicar ao refazer) — os demais dias já
  // conciliados não são tocados. Se o dia limpo é o que estava com documentos recém-enviados,
  // também limpa os anexos da tela pra poder recomeçar do zero.
  function limparConciliacao() {
    if (!dataSelecionada) return;
    const dia = historico.historico[dataSelecionada];

    const confirmado = window.confirm(
      `Isso vai apagar a conciliação do dia ${formatDateBR(dataSelecionada)} e os lançamentos criados automaticamente a partir dela em Contas a Receber/Pagar. Lançamentos criados manualmente não são afetados. Os outros dias já conciliados NÃO são apagados. Deseja continuar?`
    );
    if (!confirmado) return;

    if (dia) {
      const idsReceber: string[] = [];
      const idsPagar: string[] = [];
      const idsTransferencia: string[] = [];
      Object.values(dia.migrados ?? {}).forEach((id) => {
        if (id.startsWith("r_")) idsReceber.push(id);
        else if (id.startsWith("p_")) idsPagar.push(id);
        else if (id.startsWith("t_")) idsTransferencia.push(id);
      });
      if (idsReceber.length > 0) finance.deleteReceivables(idsReceber);
      if (idsPagar.length > 0) finance.deletePayables(idsPagar);
      if (idsTransferencia.length > 0) finance.deleteTransferencias(idsTransferencia);
      historico.removerDia(dataSelecionada);
    }
    upsertPendencias(dataSelecionada, []);

    if (resultado && resultado.data === dataSelecionada) {
      limparFormularios();
    }
    setDataOverride(null);
  }

  const datasComPendencia = useMemo(
    () => [...new Set(pendencias.map((p) => p.data))].sort().reverse(),
    [pendencias]
  );
  const pendenciasFiltradas = filtroPendencias ? pendencias.filter((p) => p.data === filtroPendencias) : pendencias;
  const pendenciasVisiveis =
    filtroPendencias || verTodasPendencias ? pendenciasFiltradas : pendenciasFiltradas.slice(0, 5);

  const podeEnviar = !!faturamento && !enviado;

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
              {bancoConfig.mostrarUploadFaturamento ? (
                <>
                  Anexe os documentos do dia e o caixa físico logo abaixo, ou clique em <strong>Preencher manualmente</strong> em
                  cada quadro pra digitar em vez de anexar.
                </>
              ) : (
                <>
                  Anexe os extratos em PDF pra guardar/conferir (a leitura automática ainda não está disponível pra esses bancos)
                  e transcreva os valores em <strong>Preencher manualmente</strong> em cada quadro, junto com as vendas do caderno
                  e o caixa físico logo abaixo.
                </>
              )}{" "}
              Só quando clicar em <strong>Enviar informações</strong> o sistema monta a conciliação — assim dá pra terminar de
              anexar/preencher tudo antes de qualquer leitura.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={iniciarNovaConciliacao}
              title="Limpa os quadros abaixo pra começar um dia novo — não apaga nada do que já foi conciliado"
              className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-muted hover:border-client-accent/40 hover:text-client-accent transition-colors"
            >
              <FilePlus2 size={13} />
              Nova conciliação
            </button>
            <button
              onClick={limparConciliacao}
              disabled={!dataSelecionada}
              title="Apaga só a conciliação do dia selecionado acima — os outros dias já conciliados não são afetados"
              className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-muted hover:border-danger-500/40 hover:text-danger-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={13} />
              Limpar conciliação deste dia
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <UploadBox
              icon={Landmark}
              title={`Extrato ${bancoConfig.banco2Nome}`}
              hint={
                bancoConfig.leituraAutomatica
                  ? "PDF ou fotos/prints do extrato — pode anexar mais de uma imagem"
                  : "PDF ou fotos/prints do extrato, pra guardar/conferir — os valores entram pelo preenchimento manual abaixo"
              }
              onExtracted={setBradescoRaw}
              multiple
            />
            <button
              onClick={() => setMostrarManualBradesco((v) => !v)}
              className="flex items-center justify-center gap-1 text-[11px] font-medium text-client-accent hover:underline"
            >
              <PenLine size={11} />
              {mostrarManualBradesco
                ? "Ocultar preenchimento manual"
                : bradescoManual.length > 0
                  ? `Preenchimento manual (${bradescoManual.length})`
                  : "Preencher manualmente"}
            </button>
            {mostrarManualBradesco && (
              <div className="card p-3">
                <BradescoManualTable movimentos={bradescoManual} onChange={setBradescoManual} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <UploadBox
              icon={Landmark}
              title={`Extrato ${bancoConfig.banco1Nome}`}
              hint={
                bancoConfig.leituraAutomatica
                  ? `Extrato da conta/maquininha ${bancoConfig.banco1Nome} — PDF ou fotos/prints`
                  : `PDF ou fotos/prints do extrato, pra guardar/conferir — os valores entram pelo preenchimento manual abaixo`
              }
              onExtracted={setPagbankRaw}
              multiple
            />
            <button
              onClick={() => setMostrarManualPagbank((v) => !v)}
              className="flex items-center justify-center gap-1 text-[11px] font-medium text-client-accent hover:underline"
            >
              <PenLine size={11} />
              {mostrarManualPagbank
                ? "Ocultar preenchimento manual"
                : pagbankManual.length > 0
                  ? `Preenchimento manual (${pagbankManual.length})`
                  : "Preencher manualmente"}
            </button>
            {mostrarManualPagbank && (
              <div className="card p-3">
                {bancoConfig.banco1Chave === "stone" ? (
                  <StoneManualTable movimentos={pagbankManual} onChange={setPagbankManual} />
                ) : (
                  <PagBankManualTable movimentos={pagbankManual} onChange={setPagbankManual} />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {bancoConfig.mostrarUploadFaturamento ? (
              <>
                <UploadBox
                  icon={FileSpreadsheet}
                  title="Relatório de faturamento"
                  hint="Vendas do período — PDF ou fotos/prints, base da conciliação"
                  onExtracted={setFaturamentoRaw}
                  multiple
                />
                <button
                  onClick={() => setMostrarManualFaturamento((v) => !v)}
                  className="flex items-center justify-center gap-1 text-[11px] font-medium text-client-accent hover:underline"
                >
                  <PenLine size={11} />
                  {mostrarManualFaturamento
                    ? "Ocultar preenchimento manual"
                    : faturamentoManual.length > 0
                      ? `Preenchimento manual (${faturamentoManual.length})`
                      : "Preencher manualmente"}
                </button>
                {mostrarManualFaturamento && (
                  <div className="card p-3">
                    <FaturamentoManualTable vendas={faturamentoManual} onChange={setFaturamentoManual} />
                  </div>
                )}
              </>
            ) : (
              <div className="card card-dashed p-4">
                <div className="mb-1 flex items-center gap-2">
                  <FileSpreadsheet size={15} className="text-client-accent" />
                  <h3 className="text-xs font-semibold text-brand-900">Vendas do período (caderno)</h3>
                </div>
                <p className="mb-3 text-[11px] text-faint">Transcreva aqui as vendas anotadas no caderno.</p>
                <FaturamentoManualTable vendas={faturamentoManual} onChange={setFaturamentoManual} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-brand-900">Movimento do caixa físico</h2>
        <CaixaFisicoManualTable movimentos={caixaMovs} onChange={atualizarCaixaMovs} />
      </div>

      {bancoConfig.requerSelecaoData && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Data da conciliação</h2>
          <p className="mt-0.5 text-xs text-faint">
            O relatório do caderno costuma trazer vários dias de uma vez — escolha qual data é essa conciliação.
          </p>
          {datasEncontradas.length > 0 && (
            <p className="mt-2 text-xs text-muted">
              Datas encontradas nos documentos: {datasEncontradas.map((d) => formatDateBR(d)).join(", ")}
            </p>
          )}
          <input
            type="date"
            value={dataConciliacao ?? ""}
            onChange={(e) => setDataConciliacao(e.target.value || null)}
            className="mt-3 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setEnviado(true)}
          disabled={!faturamento || (bancoConfig.requerSelecaoData && !dataConciliacao)}
          className="flex items-center gap-1.5 rounded-lg bg-client-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-client-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={14} />
          {enviado ? "Reenviar informações" : "Enviar informações"}
        </button>
      </div>
      {!faturamento && (
        <p className="-mt-3 text-right text-xs text-faint">
          Anexe ou preencha manualmente ao menos o relatório de faturamento pra poder enviar.
        </p>
      )}
      {faturamento && bancoConfig.requerSelecaoData && !dataConciliacao && (
        <p className="-mt-3 text-right text-xs text-faint">Escolha a data da conciliação acima pra poder enviar.</p>
      )}

      {podeEnviar === false && !resultadoExibido && (
        <div className="card card-dashed flex flex-col items-center gap-2 p-12 text-center">
          <p className="text-sm text-muted">
            {enviado
              ? "Nenhuma conciliação encontrada ainda — envie ao menos o relatório de faturamento."
              : bancoConfig.mostrarUploadFaturamento
                ? "Anexe os documentos do dia e clique em \"Enviar informações\" para montar a conciliação, ou escolha uma data já conciliada acima."
                : "Preencha os documentos do dia e clique em \"Enviar informações\" para montar a conciliação, ou escolha uma data já conciliada acima."}
          </p>
        </div>
      )}
      {resultadoExibido && (
        <ConciliacaoResultado
          resultado={resultadoExibido}
          datas={historico.datas}
          dataSelecionada={dataSelecionada ?? undefined}
          bankLabels={bancoConfig.bankLabels}
          onNavegar={setDataOverride}
          onEditarItem={editarItem}
          onEditarPagamentoBanco={editarPagamentoBanco}
          onLancado={(chave) => dataSelecionada && historico.marcarMigrados(dataSelecionada, { [chave]: "lancado" })}
          onConciliar={conciliarItem}
          onDesvincular={desvincularItem}
          onExcluir={excluirItem}
          onDesfazer={desfazerConciliacao}
          onMarcarTransferencia={transformarEmTransferencia}
          onReordenar={trocarOrdem}
          taxasCartaoPendentes={taxasCartaoPendentes()}
          onConfirmarTaxaAgregada={confirmarTaxaAgregada}
          onDesfazerTaxaAgregada={desfazerTaxaAgregada}
        />
      )}
    </div>
  );
}

function OutrasEmpresas() {
  const finance = useFinance();
  const [raw, setRaw] = useState<Extraido>(null);
  const [rawPagbank, setRawPagbank] = useState<Extraido>(null);
  const faturamento = useMemo(() => (raw ? parseFaturamento(raw.text) : null), [raw]);
  const pagbank = useMemo(() => (rawPagbank ? parsePagBank(rawPagbank.text) : null), [rawPagbank]);

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-brand-900">Movimento de outras empresas</h2>
        <p className="mt-0.5 text-xs text-faint">
          Relatórios de outras empresas do grupo, no mesmo formato — fica separado da conciliação da {finance.client.name}, sem
          lançar nada automaticamente em Contas a Pagar/DRE.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UploadBox icon={FileSpreadsheet} title="Relatório de faturamento" hint={`Mesmo formato usado na ${finance.client.name}`} onExtracted={setRaw} multiple />
          <UploadBox icon={Landmark} title="Extrato PagBank" hint={`Mesmo formato usado na ${finance.client.name}`} onExtracted={setRawPagbank} multiple />
        </div>
      </div>

      {(faturamento || pagbank) && (
        <div className="card overflow-hidden">
          <div className="p-5 pb-3">
            <h3 className="text-sm font-semibold text-brand-900">Lançamentos identificados</h3>
            <p className="text-xs text-faint">Apenas para consulta — não altera o financeiro da {finance.client.name}</p>
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
  const finance = useFinance();
  const [aba, setAba] = useState<"cliente" | "outras">("cliente");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-border-subtle">
        <button
          onClick={() => setAba("cliente")}
          className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-sm transition-colors ${
            aba === "cliente" ? "border-client-accent font-medium text-brand-900" : "border-transparent text-muted hover:text-brand-900"
          }`}
        >
          <Building2 size={14} />
          {finance.client.name}
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

      {aba === "cliente" ? <DocumentosCliente /> : <OutrasEmpresas />}
    </div>
  );
}
