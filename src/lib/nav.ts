import {
  ArrowLeftRight,
  Calculator,
  ClipboardEdit,
  FileSpreadsheet,
  FlaskConical,
  Landmark,
  LayoutDashboard,
  LucideIcon,
  ReceiptText,
  Settings2,
  UploadCloud,
} from "lucide-react";
import { Client } from "@/lib/types";

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
      href: `${base}/informacoes-dre`,
      label: "Informações do DRE",
      shortLabel: "Informações do DRE",
      pageTitle: "Informações do DRE",
      subtitle: "Receita, CMV e comissão por marketplace, digitados manualmente",
      icon: ClipboardEdit,
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
      href: `${base}/precificacao`,
      label: "Precificação",
      shortLabel: "Precificação",
      pageTitle: "Precificação",
      subtitle: "Calculadora de margem, preço e ponto de equilíbrio por produto",
      icon: Calculator,
    },
    {
      href: `${base}/simulador`,
      label: "Simulador",
      shortLabel: "Simulador",
      pageTitle: "Simulador",
      subtitle: "Teste cenários antes de mexer nos dados reais da operação",
      icon: FlaskConical,
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
      subtitle: "Saldo e movimentações por conta bancária",
      icon: Landmark,
    },
  ];
}

// Mesmos itens de clientNavItems, já filtrados pelas abas que esse cliente não deve ver
// (conciliação externa, sem Informações do DRE) — usado tanto pelo menu horizontal padrão
// quanto pela barra lateral (navLayout: "sidebar").
export function visibleNavItems(
  client: Pick<Client, "conciliacaoExterna" | "temInformacoesDre" | "temPrecificacao">,
  base: string
): NavItem[] {
  return clientNavItems(base).filter((item) => {
    if (client.conciliacaoExterna && item.href === `${base}/conciliacao-bancaria`) return false;
    if (!client.temInformacoesDre && item.href === `${base}/informacoes-dre`) return false;
    if (!client.temPrecificacao && item.href === `${base}/precificacao`) return false;
    if (!client.temPrecificacao && item.href === `${base}/simulador`) return false;
    return true;
  });
}
