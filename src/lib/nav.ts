import {
  ArrowLeftRight,
  FileSpreadsheet,
  LandmarkIcon,
  LayoutDashboard,
  LucideIcon,
  ReceiptText,
  ScrollText,
  Settings2,
  UploadCloud,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
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
      subtitle: "Resumo · receita, saídas e resultado",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: `${base}/contas-a-receber`,
      label: "Contas a Receber",
      shortLabel: "A Receber",
      subtitle: "Contas a Receber · títulos e recebimentos",
      icon: ReceiptText,
    },
    {
      href: `${base}/contas-a-pagar`,
      label: "Contas a Pagar",
      shortLabel: "A Pagar",
      subtitle: "Contas a Pagar · títulos e pagamentos",
      icon: ReceiptText,
    },
    {
      href: `${base}/faturamento-dre`,
      label: "Faturamento & DRE",
      shortLabel: "DRE",
      subtitle: "Faturamento & DRE · resultado do período",
      icon: FileSpreadsheet,
    },
    {
      href: `${base}/fluxo-de-caixa`,
      label: "Fluxo de Caixa",
      shortLabel: "Fluxo de Caixa",
      subtitle: "Fluxo de Caixa · entradas, saídas e saldo",
      icon: ArrowLeftRight,
    },
    {
      href: `${base}/importar-ofx`,
      label: "Importar OFX",
      shortLabel: "Importar OFX",
      subtitle: "Importar OFX · extrato e conciliação bancária",
      icon: UploadCloud,
    },
    {
      href: `${base}/cadastros`,
      label: "Cadastros",
      shortLabel: "Cadastros",
      subtitle: "Cadastros · categorias, clientes e fornecedores",
      icon: Settings2,
    },
  ];
}

export function clientExtraNavItems(base: string): NavItem[] {
  return [
    {
      href: `${base}/obrigacoes-fiscais`,
      label: "Obrigações Fiscais",
      shortLabel: "Obrigações",
      subtitle: "Obrigações Fiscais · guias e vencimentos",
      icon: ScrollText,
    },
    {
      href: `${base}/relatorios`,
      label: "Relatórios",
      shortLabel: "Relatórios",
      subtitle: "Relatórios · exportação em PDF ou Excel",
      icon: LandmarkIcon,
    },
  ];
}
