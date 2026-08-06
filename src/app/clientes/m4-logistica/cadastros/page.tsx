import { Plus, Tag, Truck, Users } from "lucide-react";

const categorias = [
  { nome: "Despesas Administrativas", tipo: "Saída" },
  { nome: "Despesas com Pessoal", tipo: "Saída" },
  { nome: "Custo dos Serviços (CMV)", tipo: "Saída" },
  { nome: "Despesas Logísticas", tipo: "Saída" },
  { nome: "Investimentos", tipo: "Saída" },
  { nome: "Impostos", tipo: "Saída" },
  { nome: "Despesas Financeiras", tipo: "Saída" },
  { nome: "Prestação de Serviços", tipo: "Entrada" },
];

const clientesM4 = [
  "Prime Import Comércio",
  "Bela Casa Utilidades",
  "RM Distribuidora (FBA)",
  "TechGadgets Brasil",
  "Boa Vista Eletro",
  "Nordeste Cosméticos",
  "Casa & Cia",
  "Fast Import Eletrônicos",
];

const fornecedores = [
  "Armazém Log Park",
  "Transportadora Rápido Sul",
  "EmbalaFácil Distribuidora",
  "CEMIG Energia",
  "WMS Cloud Sistemas",
  "TotalFork Manutenção",
  "Posto Ipiranga",
  "Vivo Empresas",
];

function CadastroCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof Tag;
  items: string[];
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-100 text-info-500">
            <Icon size={15} />
          </div>
          <h2 className="text-sm font-semibold text-brand-900">{title}</h2>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors">
          <Plus size={13} />
          Novo
        </button>
      </div>
      <ul className="divide-y divide-border-subtle">
        {items.map((item) => (
          <li key={item} className="flex items-center justify-between px-5 py-2.5 text-sm text-brand-900">
            {item}
            <span className="text-xs text-faint">ativo</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CadastrosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <h1 className="text-base font-semibold text-brand-900">Cadastros</h1>
        <p className="text-sm text-muted">Categorias financeiras, clientes e fornecedores da M4 Logística.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CadastroCard title="Categorias" icon={Tag} items={categorias.map((c) => `${c.nome} · ${c.tipo}`)} />
        <CadastroCard title="Clientes" icon={Users} items={clientesM4} />
        <CadastroCard title="Fornecedores" icon={Truck} items={fornecedores} />
      </div>
    </div>
  );
}
