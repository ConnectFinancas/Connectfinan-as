import { ClientFinanceData } from "@/lib/types";

export const thiagoBikeData: ClientFinanceData = {
  deducoesManuais: {
    impostos: 0,
    inadimplencia: 0,
    investimentos: 0,
  },

  // ---------- Fluxo de Caixa (Agosto/2026) ----------
  fluxoCaixaPeriodo: "01/08/2026 a 31/08/2026",
  fluxoCaixaKpis: {
    saldoInicial: 8450.0,
    recebimentos: 3200.0,
    pagamentos: 1850.0,
    geracaoLiquida: 1350.0,
    geracaoLiquidaPct: 42.2,
    saldoFinal: 9800.0,
    crescimentoCaixa: 16.0,
  },
  faturamentoXRecebimentos: {
    faturamento: 3850.0,
    recebido: 3200.0,
    conversaoEmCaixa: 83.1,
    diferenca: -650.0,
  },
  maioresRecebimentos: [
    { data: "03/08", valor: 1890.0, pctTotal: 59.1 },
    { data: "12/08", valor: 780.0, pctTotal: 24.4 },
    { data: "20/08", valor: 530.0, pctTotal: 16.5 },
  ],
  maioresPagamentos: [
    { data: "05/08", valor: 950.0, pctTotal: 51.4 },
    { data: "10/08", valor: 600.0, pctTotal: 32.4 },
    { data: "15/08", valor: 300.0, pctTotal: 16.2 },
  ],
  indicesFinanceiros: [
    { label: "Índice de geração de caixa", value: "42,2%" },
    { label: "Índice de consumo de caixa", value: "57,8%" },
    { label: "Conversão do faturamento", value: "83,1%" },
    { label: "Variação do caixa no período", value: "+16,0%" },
  ],
  destaquesPeriodo: [
    { title: "Caixa encerrou em R$ 9.800,00", desc: "Gerou R$ 1.350,00 no período." },
    { title: "Geração positiva de R$ 1.350,00", desc: "42,2% dos recebimentos." },
    { title: "Conversão em caixa de 83,1%", desc: "Do que foi faturado, quanto entrou no caixa." },
    { title: "3 recebimentos · 3 pagamentos", desc: "Maior entrada = 59,1% do total." },
  ],
  resumoExecutivo: [
    "No período, a loja teve R$ 3.200,00 em recebimentos e R$ 1.850,00 em pagamentos, resultando em geração de caixa positiva de R$ 1.350,00 e variação de +16,0% no saldo.",
    "A conversão do faturamento em caixa foi de 83,1%, um bom sinal de que as vendas estão virando dinheiro em caixa rapidamente.",
  ],
  pontoDeAtencao:
    "Mais da metade dos recebimentos do período vieram de uma única venda — vale diversificar o fluxo de entradas ao longo do mês.",

  // ---------- Sementes (estado inicial) — Contas a Receber ----------
  seedReceivables: [
    { id: "tr1", cliente: "RODRIGO ALVES SANTOS", categoria: "Venda de Bicicletas", classificacao: "Receita de Vendas", vencimento: "2026-03-04", valor: 2190.0, status: "recebido", recebimento: "2026-03-04", descricao: "Bicicleta Speed Aro 700 - à vista" },
    { id: "tr2", cliente: "MARIANA COSTA LIMA", categoria: "Manutenção e Reparo", classificacao: "Receita de Serviços", vencimento: "2026-03-07", valor: 120.0, status: "recebido", recebimento: "2026-03-07", descricao: "Revisão completa + troca de corrente" },
    { id: "tr3", cliente: "PEDRO HENRIQUE OLIVEIRA", categoria: "Venda de Peças", classificacao: "Receita de Vendas", vencimento: "2026-03-11", valor: 340.0, status: "recebido", recebimento: "2026-03-11", descricao: "Kit de freios a disco" },
    { id: "tr4", cliente: "JULIANA FERREIRA SOUZA", categoria: "Venda de Bicicletas", classificacao: "Receita de Vendas", vencimento: "2026-03-15", valor: 1450.0, status: "recebido", recebimento: "2026-03-15", descricao: "Bicicleta MTB Aro 29 - entrada + 1x cartão" },
    { id: "tr5", cliente: "CARLOS EDUARDO PEREIRA", categoria: "Venda de Acessórios", classificacao: "Receita de Vendas", vencimento: "2026-03-18", valor: 210.0, status: "recebido", recebimento: "2026-03-18", descricao: "Capacete + luvas + garrafa" },
    { id: "tr6", cliente: "ANA BEATRIZ RODRIGUES", categoria: "Montagem de Bicicleta", classificacao: "Receita de Serviços", vencimento: "2026-03-22", valor: 90.0, status: "recebido", recebimento: "2026-03-22", descricao: "Montagem de bike comprada online" },
    { id: "tr7", cliente: "LUCAS GABRIEL MARTINS", categoria: "Venda de Bicicletas", classificacao: "Receita de Vendas", vencimento: "2026-03-26", valor: 890.0, status: "recebido", recebimento: "2026-03-26", descricao: "Bicicleta Urbana Aro 26" },
    { id: "tr8", cliente: "FERNANDA ALMEIDA ROCHA", categoria: "Venda de Bicicletas", classificacao: "Receita de Vendas", vencimento: "2026-08-03", valor: 1890.0, status: "pendente", descricao: "Bicicleta Speed Aro 700 - parcelado 3x" },
    { id: "tr9", cliente: "BRUNO CESAR TAVARES", categoria: "Manutenção e Reparo", classificacao: "Receita de Serviços", vencimento: "2026-08-12", valor: 780.0, status: "pendente", descricao: "Revisão de suspensão + peças" },
    { id: "tr10", cliente: "PATRICIA GOMES DIAS", categoria: "Venda de Acessórios", classificacao: "Receita de Vendas", vencimento: "2026-08-20", valor: 530.0, status: "pendente", descricao: "Ciclocomputador + suporte de celular" },
  ],

  // ---------- Sementes (estado inicial) — Contas a Pagar ----------
  seedPayables: [
    { id: "tp1", favorecido: "BIKE PARTS DISTRIBUIDORA LTDA", categoria: "Compra de Peças e Acessórios", classificacao: "CMV", vencimento: "2026-03-03", valor: 1850.0, status: "pago", pagamento: "2026-03-03", descricao: "Reposição de estoque - peças" },
    { id: "tp2", favorecido: "IMOBILIÁRIA CENTRO LTDA", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-03-05", valor: 2200.0, status: "pago", pagamento: "2026-03-05", descricao: "Aluguel da loja - março" },
    { id: "tp3", favorecido: "—", categoria: "DAS (Simples Nacional)", classificacao: "IMPOSTOS", vencimento: "2026-03-20", valor: 415.6, status: "pago", pagamento: "2026-03-20", descricao: "DAS competência 02/2026" },
    { id: "tp4", favorecido: "CIELO S.A.", categoria: "Taxa de Cartão", classificacao: "DESPESAS FINANCEIRAS", vencimento: "2026-03-06", valor: 187.4, status: "pago", pagamento: "2026-03-06", descricao: "Taxas de máquina de cartão - fevereiro" },
    { id: "tp5", favorecido: "THIAGO SILVA NASCIMENTO", categoria: "Pró-Labore", classificacao: "DESPESAS C/ PESSOAS", vencimento: "2026-03-05", valor: 3000.0, status: "pago", pagamento: "2026-03-05", descricao: "Pró-labore sócio - março" },
    { id: "tp6", favorecido: "AGÊNCIA PEDAL ADS", categoria: "Anúncios Redes Sociais", classificacao: "MARKETING", vencimento: "2026-03-10", valor: 350.0, status: "pago", pagamento: "2026-03-10", descricao: "Campanha Instagram/Facebook - março" },
    { id: "tp7", favorecido: "BICI IMPORT COMPONENTES", categoria: "Compra de Bicicletas", classificacao: "CMV", vencimento: "2026-03-17", valor: 4200.0, status: "pago", pagamento: "2026-03-17", descricao: "Compra de lote - 3 bicicletas speed" },
    { id: "tp8", favorecido: "ENEL DISTRIBUIÇÃO", categoria: "Energia Elétrica", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-03-12", valor: 245.3, status: "pago", pagamento: "2026-03-12", descricao: "Conta de luz - loja" },
    { id: "tp9", favorecido: "BIKE PARTS DISTRIBUIDORA LTDA", categoria: "Compra de Peças e Acessórios", classificacao: "CMV", vencimento: "2026-08-05", valor: 950.0, status: "pendente", descricao: "Reposição de estoque - agosto" },
    { id: "tp10", favorecido: "IMOBILIÁRIA CENTRO LTDA", categoria: "Aluguel", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-08-10", valor: 2200.0, status: "pendente", descricao: "Aluguel da loja - agosto" },
    { id: "tp11", favorecido: "CONTABILCONNECT ASSESSORIA", categoria: "Contabilidade", classificacao: "DESPESAS ADMINISTRATIVAS", vencimento: "2026-08-15", valor: 300.0, status: "pendente", descricao: "Honorários contábeis - agosto" },
  ],

  // ---------- Sementes (estado inicial) — Cadastros ----------
  seedCategoriasPagar: [
    {
      classificacao: "DESPESAS C/ PESSOAS",
      color: "#a78bfa",
      padrao: true,
      categorias: [
        { nome: "Salário", padrao: true },
        { nome: "Pró-Labore", padrao: true },
        { nome: "Comissão de Vendas", padrao: true },
        { nome: "INSS", padrao: true },
        { nome: "FGTS", padrao: true },
        { nome: "Vale Transporte", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS ADMINISTRATIVAS",
      color: "#5b93fd",
      padrao: true,
      categorias: [
        { nome: "Aluguel", padrao: true },
        { nome: "Sistemas (PDV)", padrao: true },
        { nome: "Internet", padrao: true },
        { nome: "Energia Elétrica", padrao: true },
        { nome: "Água", padrao: true },
        { nome: "Contabilidade", padrao: true },
      ],
    },
    {
      classificacao: "DESPESAS FINANCEIRAS",
      color: "#f2665c",
      padrao: true,
      categorias: [
        { nome: "Taxa de Cartão", padrao: true },
        { nome: "Taxa Bancária", padrao: true },
        { nome: "Juros de Empréstimo", padrao: true },
      ],
    },
    {
      classificacao: "CMV",
      color: "#22d3a0",
      padrao: true,
      categorias: [
        { nome: "Compra de Bicicletas", padrao: true },
        { nome: "Compra de Peças e Acessórios", padrao: true },
        { nome: "Frete de Fornecedores", padrao: true },
      ],
    },
    {
      classificacao: "IMPOSTOS",
      color: "#f5c344",
      padrao: true,
      categorias: [
        { nome: "DAS (Simples Nacional)", padrao: true },
        { nome: "ICMS", padrao: false },
      ],
    },
    {
      classificacao: "MARKETING",
      color: "#f472b6",
      padrao: false,
      categorias: [
        { nome: "Anúncios Redes Sociais", padrao: false },
        { nome: "Material Gráfico", padrao: false },
      ],
    },
    {
      classificacao: "INVESTIMENTO",
      color: "#4f8dfd",
      padrao: false,
      categorias: [
        { nome: "Equipamentos de Oficina", padrao: false },
        { nome: "Reforma da Loja", padrao: false },
      ],
    },
  ],

  seedCategoriasReceber: [
    {
      classificacao: "Receita de Vendas",
      color: "#22d3a0",
      padrao: true,
      categorias: [
        { nome: "Venda de Bicicletas", padrao: true },
        { nome: "Venda de Peças", padrao: true },
        { nome: "Venda de Acessórios", padrao: true },
      ],
    },
    {
      classificacao: "Receita de Serviços",
      color: "#ef4444",
      padrao: true,
      categorias: [
        { nome: "Manutenção e Reparo", padrao: true },
        { nome: "Montagem de Bicicleta", padrao: true },
      ],
    },
  ],
};
