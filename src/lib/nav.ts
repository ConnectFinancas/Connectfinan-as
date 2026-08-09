import {
  ArrowLeftRight,
  FileSpreadsheet,
  Landmark,
  LayoutDashboard,
  LucideIcon,
  ReceiptText,
  Settings2,
  UploadCloud,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  pageTitle: string;
  subtitle: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function clientNavItems(base: string): NavItem[] {
  return [
    {
      href: base,
      label: "Resumo",
      shortLabel: "Resumo",
      pageTitle: "Financeiro",
      subtitle: "Resumo · receita, saídas e resultado",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `${base}/contas-a-receber`,
      label: "Contas a Receber",
      shortLabel: "Contas a Receber",
      pageTitle: "Contas a Receber",
      subtitle: "Boletos, recebimentos e inadimplência",
      icon: ReceiptText,
    },
    {
      href: `${base}/contas-a-pagar`,
      label: "Contas a Pagar",
      shortLabel: "Contas a Pagar",
      pageTitle: "Contas a Pagar",
      subtitle: "Fornecedores, despesas e folha",
      icon: ReceiptText,
    },
    {
      href: `${base}/faturamento-dre`,
      label: "Faturamento & DRE",
      shortLabel: "Faturamento & DRE",
      pageTitle: "Faturamento & DRE",
      subtitle: "Demonstrativo de resultado por competência",
      icon: FileSpreadsheet,
    },
    {
      href: `${base}/fluxo-de-caixa`,
      label: "Fluxo de Caixa",
      shortLabel: "Fluxo de Caixa",
      pageTitle: "Fluxo de Caixa",
      subtitle: "Entradas, saídas e saldo diário",
      icon: ArrowLeftRight,
    },
    {
      href: `${base}/conciliacao-bancaria`,
      label: "Conciliação Bancária",
      shortLabel: "Conciliação Bancária",
      pageTitle: "Conciliação Bancária",
      subtitle: "Concilie o extrato do banco com as contas · estilo Conta Azul",
      icon: UploadCloud,
    },
    {
      href: `${base}/cadastros`,
      label: "Cadastros",
      shortLabel: "Cadastros",
      pageTitle: "Cadastros Financeiros",
      subtitle: "Categorias e classificações do seu jeito",
      icon: Settings2,
    },
    {
      href: `${base}/contas`,
      label: "Contas",
      shortLabel: "Contas",
      pageTitle: "Contas",
      subtitle: "Em construção",
      icon: Landmark,
    },
  ];
}
