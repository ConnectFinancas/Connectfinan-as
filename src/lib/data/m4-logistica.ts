import {
  BankTransaction,
  CashFlowPoint,
  DreLine,
  ExpenseSlice,
  MonthlyFinancials,
  Payable,
  Receivable,
  TaxObligation,
} from "@/lib/types";

export const monthlyFinancials: MonthlyFinancials[] = [
  { month: "Set/25", receita: 186000, despesa: 141000 },
  { month: "Out/25", receita: 198000, despesa: 148000 },
  { month: "Nov/25", receita: 245000, despesa: 172000 },
  { month: "Dez/25", receita: 338000, despesa: 231000 },
  { month: "Jan/26", receita: 214000, despesa: 168000 },
  { month: "Fev/26", receita: 205000, despesa: 159000 },
  { month: "Mar/26", receita: 222000, despesa: 167000 },
  { month: "Abr/26", receita: 231000, despesa: 172000 },
  { month: "Mai/26", receita: 239000, despesa: 176000 },
  { month: "Jun/26", receita: 248000, despesa: 180000 },
  { month: "Jul/26", receita: 257000, despesa: 184000 },
  { month: "Ago/26", receita: 268000, despesa: 189000 },
];

export const cashFlow: CashFlowPoint[] = [
  { month: "Set/25", entradas: 180000, saidas: 141000, saldo: 134000 },
  { month: "Out/25", entradas: 192000, saidas: 148000, saldo: 178000 },
  { month: "Nov/25", entradas: 238000, saidas: 172000, saldo: 244000 },
  { month: "Dez/25", entradas: 328000, saidas: 231000, saldo: 341000 },
  { month: "Jan/26", entradas: 207000, saidas: 168000, saldo: 380000 },
  { month: "Fev/26", entradas: 199000, saidas: 159000, saldo: 420000 },
  { month: "Mar/26", entradas: 215000, saidas: 167000, saldo: 468000 },
  { month: "Abr/26", entradas: 224000, saidas: 172000, saldo: 520000 },
  { month: "Mai/26", entradas: 232000, saidas: 176000, saldo: 576000 },
  { month: "Jun/26", entradas: 241000, saidas: 180000, saldo: 637000 },
  { month: "Jul/26", entradas: 249000, saidas: 184000, saldo: 702000 },
  { month: "Ago/26", entradas: 92000, saidas: 61000, saldo: 733000 },
];

export const dreCompetencia = "Julho/2026";
export const dreFechamento = "05/08/2026";

export const dreLines: DreLine[] = [
  { label: "Receita Bruta de Serviços", value: 257000 },
  { label: "(-) Impostos sobre Serviços (ISS, PIS, COFINS)", value: -18800, indent: true, negative: true },
  { label: "Receita Líquida", value: 238200, isSubtotal: true },

  { label: "Mão de obra operacional (armazém)", value: -62000, indent: true, negative: true },
  { label: "Materiais de embalagem e etiquetagem", value: -14500, indent: true, negative: true },
  { label: "Frete e transporte contratado", value: -28700, indent: true, negative: true },
  { label: "Locação de galpão e utilities", value: -19800, indent: true, negative: true },
  { label: "Custo dos Serviços Prestados (CSP)", value: -125000, isSubtotal: true, negative: true },
  { label: "Lucro Bruto", value: 113200, isSubtotal: true },

  { label: "Despesas administrativas", value: -16200, indent: true, negative: true },
  { label: "Despesas comerciais e marketing", value: -7800, indent: true, negative: true },
  { label: "Softwares e sistemas (ERP, WMS)", value: -5400, indent: true, negative: true },
  { label: "Pessoal administrativo", value: -21000, indent: true, negative: true },
  { label: "Depreciação e amortização", value: -3200, indent: true, negative: true },
  { label: "Despesas Operacionais", value: -53600, isSubtotal: true, negative: true },
  { label: "Resultado Operacional (EBIT)", value: 59600, isSubtotal: true },

  { label: "Receitas financeiras", value: 1400, indent: true },
  { label: "Despesas financeiras", value: -6100, indent: true, negative: true },
  { label: "Resultado Antes de IR/CSLL", value: 54900, isSubtotal: true },

  { label: "IRPJ e CSLL (Lucro Presumido)", value: -8700, indent: true, negative: true },
  { label: "Lucro Líquido do Período", value: 46200, isTotal: true },
];

export const expenseBreakdown: ExpenseSlice[] = [
  { label: "Mão de obra operacional", value: 62000, color: "#e8722c" },
  { label: "Frete e transporte", value: 28700, color: "#2b46a3" },
  { label: "Pessoal administrativo", value: 21000, color: "#0f9d6a" },
  { label: "Locação de galpão", value: 19800, color: "#d97706" },
  { label: "Despesas administrativas", value: 16200, color: "#8a5cf6" },
  { label: "Materiais e embalagem", value: 14500, color: "#2563eb" },
  { label: "Marketing", value: 7800, color: "#dc2626" },
  { label: "Despesas financeiras", value: 6100, color: "#64748b" },
  { label: "Softwares e sistemas", value: 5400, color: "#0ea5e9" },
  { label: "Outras despesas", value: 2500, color: "#94a3b8" },
];

export const payables: Payable[] = [
  { id: "p1", favorecido: "Armazém Log Park (Galpão)", categoria: "Aluguel", vencimento: "2026-08-05", valor: 18500, status: "atrasado" },
  { id: "p2", favorecido: "Transportadora Rápido Sul", categoria: "Frete/Transporte", vencimento: "2026-08-08", valor: 12400, status: "pendente" },
  { id: "p3", favorecido: "EmbalaFácil Distribuidora", categoria: "Materiais/Embalagem", vencimento: "2026-08-10", valor: 6870, status: "pendente" },
  { id: "p4", favorecido: "CEMIG Energia", categoria: "Utilidades", vencimento: "2026-08-12", valor: 3120, status: "pendente" },
  { id: "p5", favorecido: "WMS Cloud Sistemas", categoria: "Software/Sistemas", vencimento: "2026-08-15", valor: 1890, status: "agendado" },
  { id: "p6", favorecido: "FGTS/INSS - Folha Julho", categoria: "Encargos Trabalhistas", vencimento: "2026-08-20", valor: 15230, status: "pendente" },
  { id: "p7", favorecido: "Pró-labore Sócios", categoria: "Pró-labore", vencimento: "2026-08-30", valor: 12000, status: "pendente" },
  { id: "p8", favorecido: "TotalFork Manutenção", categoria: "Manutenção", vencimento: "2026-08-02", valor: 2450, status: "pago" },
  { id: "p9", favorecido: "Posto Ipiranga - Frota", categoria: "Combustível", vencimento: "2026-08-04", valor: 4380, status: "pago" },
  { id: "p10", favorecido: "Vivo Empresas", categoria: "Utilidades", vencimento: "2026-08-18", valor: 690, status: "pendente" },
];

export const receivables: Receivable[] = [
  { id: "r1", cliente: "Prime Import Comércio", descricao: "Prep + Armazenagem - Julho", vencimento: "2026-08-05", valor: 24800, status: "atrasado" },
  { id: "r2", cliente: "Bela Casa Utilidades", descricao: "Fulfillment Mensal - Julho", vencimento: "2026-08-07", valor: 18200, status: "pendente" },
  { id: "r3", cliente: "RM Distribuidora (FBA)", descricao: "Etiquetagem FBA - Lote 218", vencimento: "2026-08-10", valor: 9450, status: "pendente" },
  { id: "r4", cliente: "TechGadgets Brasil", descricao: "Armazenagem + Picking - Julho", vencimento: "2026-08-12", valor: 31200, status: "pendente" },
  { id: "r5", cliente: "Boa Vista Eletro", descricao: "Prep - Lote 190", vencimento: "2026-08-15", valor: 7600, status: "agendado" },
  { id: "r6", cliente: "Nordeste Cosméticos", descricao: "Fulfillment Mensal - Julho", vencimento: "2026-08-02", valor: 14300, status: "pago" },
  { id: "r7", cliente: "Casa & Cia", descricao: "Armazenagem - Julho", vencimento: "2026-08-20", valor: 11750, status: "pendente" },
  { id: "r8", cliente: "Fast Import Eletrônicos", descricao: "Prep + Transporte - Lote 205", vencimento: "2026-08-22", valor: 19980, status: "pendente" },
];

export const bankTransactions: BankTransaction[] = [
  { id: "b1", data: "2026-08-05", descricao: "PIX RECEBIDO - NORDESTE COSMETICOS", categoria: "Recebimento de Cliente", valor: 14300, status: "conciliado" },
  { id: "b2", data: "2026-08-04", descricao: "PAGAMENTO BOLETO - POSTO IPIRANGA", categoria: "Combustível", valor: -4380, status: "conciliado" },
  { id: "b3", data: "2026-08-04", descricao: "PAGAMENTO BOLETO - TOTALFORK MANUT.", categoria: "Manutenção", valor: -2450, status: "conciliado" },
  { id: "b4", data: "2026-08-03", descricao: "TED RECEBIDA - TECHGADGETS BRASIL", categoria: "Recebimento de Cliente", valor: 15000, status: "nao_conciliado" },
  { id: "b5", data: "2026-08-03", descricao: "TARIFA PACOTE DE SERVIÇOS", categoria: "Tarifas Bancárias", valor: -89, status: "nao_conciliado" },
  { id: "b6", data: "2026-08-02", descricao: "PIX ENVIADO - EMBALAFACIL DISTRIB.", categoria: "Materiais/Embalagem", valor: -3200, status: "nao_conciliado" },
  { id: "b7", data: "2026-08-01", descricao: "PIX RECEBIDO - BELA CASA UTILIDADES", categoria: "Recebimento de Cliente", valor: 9000, status: "nao_conciliado" },
  { id: "b8", data: "2026-07-31", descricao: "PAGAMENTO FOLHA - JULHO/2026", categoria: "Folha de Pagamento", valor: -58400, status: "conciliado" },
  { id: "b9", data: "2026-07-31", descricao: "IOF / JUROS APLICAÇÃO AUTOMÁTICA", categoria: "Receitas Financeiras", valor: 620, status: "conciliado" },
  { id: "b10", data: "2026-07-30", descricao: "PIX ENVIADO - RÁPIDO SUL TRANSPORTES", categoria: "Frete/Transporte", valor: -9800, status: "conciliado" },
  { id: "b11", data: "2026-07-29", descricao: "TED RECEBIDA - FAST IMPORT ELETRO.", categoria: "Recebimento de Cliente", valor: 19980, status: "conciliado" },
  { id: "b12", data: "2026-07-28", descricao: "DEBITO AUTOMATICO - VIVO EMPRESAS", categoria: "Utilidades", valor: -690, status: "conciliado" },
];

export const taxObligations: TaxObligation[] = [
  { id: "t1", nome: "FGTS", competencia: "07/2026", vencimento: "2026-08-07", valor: 6120, status: "atrasado" },
  { id: "t2", nome: "ISS - Prefeitura Municipal", competencia: "07/2026", vencimento: "2026-08-10", valor: 5140, status: "pendente" },
  { id: "t3", nome: "DCTFWeb (declaratória)", competencia: "07/2026", vencimento: "2026-08-15", valor: 0, status: "pendente" },
  { id: "t4", nome: "INSS (GPS)", competencia: "07/2026", vencimento: "2026-08-20", valor: 8340, status: "pendente" },
  { id: "t5", nome: "PIS/COFINS", competencia: "07/2026", vencimento: "2026-08-25", valor: 9250, status: "pendente" },
  { id: "t6", nome: "IRPJ/CSLL (Trimestral)", competencia: "2º Trim/2026", vencimento: "2026-07-31", valor: 18700, status: "pago" },
  { id: "t7", nome: "EFD-Contribuições", competencia: "07/2026", vencimento: "2026-08-14", valor: 0, status: "pendente" },
];

export const kpis = {
  receitaMes: { value: 257000, delta: 3.6 },
  despesaMes: { value: 184000, delta: 2.2 },
  lucroLiquido: { value: 46200, delta: 5.1 },
  saldoCaixa: { value: 733000, delta: 4.4 },
  contasReceberAberto: 122980,
  contasPagarAberto: 70700,
  margemLiquida: 18,
};
