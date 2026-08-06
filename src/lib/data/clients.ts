import { Client } from "@/lib/types";

export const clients: Client[] = [
  {
    slug: "m4-logistica",
    name: "M4 Logística",
    legalName: "M4 Logística e Prep Center Ltda.",
    cnpj: "42.118.907/0001-30",
    segment: "Prep Center & Logística para E-commerce",
    monogram: "M4",
    accent: "#e8722c",
    accentDark: "#c25a1c",
    status: "ativo",
    responsible: "Ewerton Lucas",
    regime: "Lucro Presumido",
  },
  {
    slug: "grupo-vale-verde",
    name: "Grupo Vale Verde",
    legalName: "Vale Verde Distribuidora Ltda.",
    cnpj: "—",
    segment: "Distribuição de Alimentos",
    monogram: "VV",
    accent: "#3f8f5f",
    accentDark: "#2e6d47",
    status: "em_breve",
    responsible: "—",
    regime: "—",
  },
  {
    slug: "urbano-construcoes",
    name: "Urbano Construções",
    legalName: "Urbano Construções e Incorporações S.A.",
    cnpj: "—",
    segment: "Construção Civil",
    monogram: "UC",
    accent: "#8a5cf6",
    accentDark: "#6c3fd6",
    status: "em_breve",
    responsible: "—",
    regime: "—",
  },
  {
    slug: "nova-era-saude",
    name: "Nova Era Saúde",
    legalName: "Nova Era Clínica e Diagnóstico Ltda.",
    cnpj: "—",
    segment: "Saúde",
    monogram: "NE",
    accent: "#2563eb",
    accentDark: "#1d4fc4",
    status: "em_breve",
    responsible: "—",
    regime: "—",
  },
];

export function getClient(slug: string): Client | undefined {
  return clients.find((c) => c.slug === slug);
}
