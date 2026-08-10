import { ClientFinanceData } from "@/lib/types";

// Cliente novo: painel criado com a mesma estrutura da Thiago Bike (mesmas
// classificações/categorias como modelo inicial), mas sem nenhum lançamento
// ainda — os dados reais entram conforme forem enviados.
export const mjPrimeData: ClientFinanceData = {
  deducoesManuais: {
    impostos: 0,
    inadimplencia: 0,
    investimentos: 0,
  },

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
  resumoExecutivo: ["Ainda não há lançamentos cadastrados para a MJ Prime — os dados aparecem aqui assim que forem lançados."],
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
      ],
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
