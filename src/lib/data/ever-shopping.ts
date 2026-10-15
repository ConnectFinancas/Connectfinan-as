import { ClientFinanceData } from "@/lib/types";

// Cliente novo, vende por marketplace (Mercado Livre/Shopee/Tiktok/Shein) igual a Store Pluss —
// painel criado com a MESMA estrutura de DRE/Fluxo de Caixa dela (marketplaceManual na aba
// Informações do DRE, deduções de receita por canal agrupadas em "Deduções de Receita Ligadas à
// Venda", mesmas classificações/categorias de Contas a Pagar), mas sem nenhum lançamento ainda —
// os dados reais (marketplace e Contas a Pagar/Receber) entram conforme forem enviados pelo
// Ewerton. Diferente da Store Pluss, não tem a parte de Confecção (produção própria) nem a
// divisão de contas por empresa (BLAIMP) — ajustar se isso mudar.
export const everShoppingData: ClientFinanceData = {
  // Sempre que EDITAR os lançamentos/categorias abaixo, incremente este número — ver o comentário
  // de dataVersion em types.ts. Bump 1: estrutura inicial de DRE/Fluxo de Caixa (marketplace,
  // deduções de receita por canal, classificações de Contas a Pagar), replicando o padrão da
  // Store Pluss — ainda sem nenhum lançamento real.
  dataVersion: 1,

  deducoesManuais: {
    impostos: 0,
    inadimplencia: 0,
    investimentos: 0,
  },

  // Mesma ideia da Store Pluss: compra de produto já é representada pelo CMV informado por
  // marketplace (aba Informações do DRE), então não entra na despesa genérica pra não contar em
  // dobro. Logística, Impostos e Reembolso/Devolução saem da seção genérica porque viram linhas
  // destacadas (frete pago, imposto, devoluções) mais acima no DRE, dentro de "Deduções de
  // Receita Ligadas à Venda".
  classificacoesForaDoDre: ["COMPRA DE PRODUTOS", "DESPESAS LOGISTICAS", "IMPOSTOS", "REEMBOLSO CLIENTES", "devoluções"],
  classificacoesNoCmv: ["INSUMOS"],
  // Afiliados Tiktok sai do bloco genérico de DESPESAS COMERCIAIS / MARKETING e vira linha própria
  // dentro de "Deduções de Receita Ligadas à Venda" — evita contar o valor duas vezes.
  categoriasForaDoDre: [{ classificacao: "DESPESAS COMERCIAIS / MARKETING", categoria: "Afiliados Tiktok" }],

  // Estrutura idêntica à Store Pluss: dentro do grupo colapsável "Deduções de Receita Ligadas à
  // Venda", primeiro as deduções do Mercado Livre, depois Tiktok, depois Shopee/Shein (quando
  // tiverem dado), e só por último as genéricas (frete pago, devoluções e reembolso). Imposto
  // fica fora do grupo, como linha solta.
  linhasDestaqueDre: [
    {
      rotulo: "Frete Descontado pelo Mercado Livre",
      marketplaceCampo: { canal: "mercadoLivre", campo: "freteDescontado" },
      grupo: "Deduções de Receita Ligadas à Venda",
    },
    { rotulo: "Afiliados Mercado Livre", marketplaceCampo: { canal: "mercadoLivre", campo: "ads" }, grupo: "Deduções de Receita Ligadas à Venda" },
    {
      rotulo: "Frete Descontado direto do Tiktok",
      marketplaceCampo: { canal: "tiktok", campo: "freteDescontado" },
      grupo: "Deduções de Receita Ligadas à Venda",
    },
    {
      rotulo: "Afiliados Tiktok",
      categorias: [{ classificacao: "DESPESAS COMERCIAIS / MARKETING", categoria: "Afiliados Tiktok" }],
      grupo: "Deduções de Receita Ligadas à Venda",
    },
    { rotulo: "Ads Shopee", marketplaceCampo: { canal: "shopee", campo: "ads" }, grupo: "Deduções de Receita Ligadas à Venda" },
    {
      rotulo: "Frete pago (Transporte de Mercadorias compradas)",
      classificacoes: ["DESPESAS LOGISTICAS"],
      grupo: "Deduções de Receita Ligadas à Venda",
    },
    {
      rotulo: "Devoluções e Reembolso",
      categorias: [
        { classificacao: "REEMBOLSO CLIENTES", categoria: "reembolso" },
        { classificacao: "devoluções", categoria: "Devolução de Vendas" },
      ],
      grupo: "Deduções de Receita Ligadas à Venda",
    },
    { rotulo: "Imposto", classificacoes: ["IMPOSTOS"] },
  ],

  // Mesmo critério da Store Pluss pra Margem de Contribuição/Ponto de Equilíbrio: além do CMV,
  // comissão/frete/imposto/devoluções/afiliados também variam venda a venda.
  custosVariaveisDre: [
    "(-) Comissões de Marketplace",
    "Frete pago (Transporte de Mercadorias compradas)",
    "Frete Descontado direto do Tiktok",
    "Frete Descontado pelo Mercado Livre",
    "Imposto",
    "Devoluções e Reembolso",
    "Afiliados Mercado Livre",
    "Ads Shopee",
    "Afiliados Tiktok",
  ],

  fluxoCaixaPeriodo: "—",
  fluxoCaixaKpis: {
    saldoInicial: 0,
    recebimentos: 0,
    pagamentos: 0,
    geracaoLiquida: 0,
    geracaoLiquidaPct: 0,
    saldoFinal: 0,
    crescimentoCaixa: 0,
  },
  faturamentoXRecebimentos: {
    faturamento: 0,
    recebido: 0,
    conversaoEmCaixa: 0,
    diferenca: 0,
  },
  maioresRecebimentos: [],
  maioresPagamentos: [],
  indicesFinanceiros: [
    { label: "Índice de geração de caixa", value: "—" },
    { label: "Índice de consumo de caixa", value: "—" },
    { label: "Conversão do faturamento", value: "—" },
    { label: "Variação do caixa no período", value: "—" },
  ],
  destaquesPeriodo: [],
  resumoExecutivo: ["Ainda não há lançamentos cadastrados para a Ever Shopping — os dados aparecem aqui assim que forem lançados."],
  pontoDeAtencao: "Sem lançamentos no período.",

  seedReceivables: [],

  seedPayables: [],

  seedCategoriasPagar: [
    {
      classificacao: "DESPESAS C/ PESSOAS",
      color: "#a78bfa",
      padrao: true,
      categorias: [
        { nome: "Salário", padrao: true },
        { nome: "Pró-Labore", padrao: true },
        { nome: "Comissões de Vendas", padrao: true },
        { nome: "Vale Transporte", padrao: true },
        { nome: "INSS", padrao: true },
        { nome: "FGTS", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS ADMINISTRATIVAS",
      color: "#5b93fd",
      padrao: true,
      categorias: [
        { nome: "Aluguel", padrao: true },
        { nome: "Contabilidade", padrao: true },
        { nome: "Energia Elétrica", padrao: true },
        { nome: "Internet", padrao: true },
        { nome: "Telefonia", padrao: true },
        { nome: "Sistemas", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS FINANCEIRAS",
      color: "#f2665c",
      padrao: true,
      categorias: [
        { nome: "Tarifas Bancárias", padrao: true },
        { nome: "Tarifas de Maquininhas", padrao: true },
        { nome: "Multas / Taxas", padrao: true },
      ],
    },
    {
      classificacao: "CMV",
      color: "#22d3a0",
      padrao: true,
      categorias: [
        { nome: "Custo sobre Mercadorias Vendidas", padrao: true },
        { nome: "CSV (Custos sobre Serviços)", padrao: true },
      ],
    },
    {
      // Fora do DRE (ver classificacoesForaDoDre acima) — custo do produto já é representado pelo
      // CMV informado por marketplace, igual a Store Pluss. Continua aparecendo em Contas a Pagar
      // e no Fluxo de Caixa normalmente.
      classificacao: "COMPRA DE PRODUTOS",
      color: "#fb923c",
      padrao: true,
      categorias: [
        { nome: "Compras de Produtos", padrao: true },
      ],
    },
    {
      classificacao: "IMPOSTOS",
      color: "#f5c344",
      padrao: true,
      categorias: [
        { nome: "Imposto (Simples Nacional)", padrao: true },
        { nome: "ICMS", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS LOGISTICAS",
      color: "#38bdf8",
      padrao: true,
      categorias: [
        { nome: "Frete", padrao: true },
        { nome: "Combustível", padrao: true },
        { nome: "Manutenção de Veículos", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS COMERCIAIS / MARKETING",
      color: "#f472b6",
      padrao: true,
      categorias: [
        { nome: "Marketing", padrao: true },
        { nome: "Comercial", padrao: true },
        // Tarifas/comissões de marketplace, mesmas categorias da Store Pluss — "Afiliados Tiktok"
        // tem tratamento à parte (ver categoriasForaDoDre/linhasDestaqueDre acima).
        { nome: "Tarifa de Campanha de Publicidade", padrao: false },
        { nome: "Afiliados", padrao: false },
        { nome: "Afiliados Tiktok", padrao: false },
        { nome: "Comissão Tiktok (Taxa de Serviços)", padrao: false },
      ],
    },
    {
      // Entra no detalhamento do CMV (ver classificacoesNoCmv acima), igual Store Pluss.
      classificacao: "INSUMOS",
      color: "#06b6d4",
      padrao: true,
      categorias: [
        { nome: "Materiais Aplicados na Prestação de Serviços", padrao: true },
        { nome: "Embalagens", padrao: true },
      ],
    },
    {
      // Fora do DRE — vira linha de destaque "Devoluções e Reembolso" (ver linhasDestaqueDre).
      classificacao: "REEMBOLSO CLIENTES",
      color: "#f2665c",
      padrao: true,
      categorias: [{ nome: "reembolso", padrao: true }],
    },
    {
      // Fora do DRE — vira linha de destaque "Devoluções e Reembolso" (ver linhasDestaqueDre).
      classificacao: "devoluções",
      color: "#f2665c",
      padrao: true,
      categorias: [{ nome: "Devolução de Vendas", padrao: true }],
    },
    {
      classificacao: "DESPESAS EVENTUAIS",
      color: "#94a3b8",
      padrao: true,
      categorias: [
        { nome: "Material de Escritório", padrao: true },
        { nome: "Uso e Consumo", padrao: true },
        { nome: "Manutenção de Equipamentos", padrao: true },
      ],
    },
    {
      classificacao: "INVESTIMENTO",
      color: "#4f8dfd",
      padrao: true,
      categorias: [
        { nome: "Banco | Reserva de Emergência", padrao: true },
        { nome: "Nova Loja | Investimentos", padrao: true },
        { nome: "Compra | Ativos Mobilizados", padrao: true },
      ],
    },
  ],

  seedCategoriasReceber: [
    {
      classificacao: "Faturamento",
      color: "#22d3a0",
      padrao: true,
      categorias: [{ nome: "Faturamento Geral", padrao: true }],
    },
  ],
};
