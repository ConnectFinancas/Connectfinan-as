import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  FileSpreadsheet,
  LandmarkIcon,
  LayoutDashboard,
  LucideIcon,
  ReceiptText,
  ScrollText,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function clientNavItems(base: string): NavItem[] {
  return [
    { href: base, label: "Visão Geral", icon: LayoutDashboard, exact: true },
    { href: `${base}/dre`, label: "DRE", icon: ReceiptText },
    { href: `${base}/fluxo-de-caixa`, label: "Fluxo de Caixa", icon: ArrowLeftRight },
    { href: `${base}/contas-a-pagar`, label: "Contas a Pagar", icon: ArrowDownCircle },
    { href: `${base}/contas-a-receber`, label: "Contas a Receber", icon: ArrowUpCircle },
    { href: `${base}/conciliacao`, label: "Conciliação Bancária", icon: LandmarkIcon },
    { href: `${base}/obrigacoes-fiscais`, label: "Obrigações Fiscais", icon: ScrollText },
    { href: `${base}/relatorios`, label: "Relatórios", icon: FileSpreadsheet },
  ];
}
