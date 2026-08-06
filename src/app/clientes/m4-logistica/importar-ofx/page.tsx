import { CheckCircle2, CircleDashed, Landmark, UploadCloud } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { bankTransactions } from "@/lib/data/m4-logistica";
import { formatCurrencyPrecise } from "@/lib/format";

export default function ImportarOfxPage() {
  const naoConciliado = bankTransactions.filter((t) => t.status === "nao_conciliado");
  const conciliado = bankTransactions.filter((t) => t.status === "conciliado");
  const saldoExtrato = bankTransactions.reduce((a, t) => a + t.valor, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="card card-dashed flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info-100 text-info-500">
          <UploadCloud size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-900">Importar extrato bancário (.OFX)</p>
          <p className="mt-1 text-xs text-faint">Arraste o arquivo aqui ou clique para selecionar — Banco Itaú, Sicoob, e demais bancos compatíveis</p>
        </div>
        <button className="mt-1 rounded-lg bg-accent-500 px-4 py-2 text-xs font-semibold text-brand-950 hover:bg-accent-600 transition-colors">
          Selecionar arquivo OFX
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Saldo Movimentado (extrato)" value={saldoExtrato} icon={Landmark} accent="#5b93fd" hint="período exibido" />
        <KpiCard label="Itens Conciliados" value={conciliado.length} icon={CheckCircle2} accent="#22d3a0" hint="lançamentos" />
        <KpiCard label="Pendentes de Conciliação" value={naoConciliado.length} icon={CircleDashed} accent="#f2a93c" hint="lançamentos" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h2 className="text-sm font-semibold text-brand-900">Extrato Bancário — Banco Itaú · Conta Corrente</h2>
            <p className="text-xs text-faint">Últimos lançamentos importados</p>
          </div>
        </div>
        <div className="overflow-x-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-xs text-faint">
                <th className="pb-2 font-medium">Data</th>
                <th className="pb-2 font-medium">Descrição</th>
                <th className="pb-2 font-medium">Categoria</th>
                <th className="pb-2 font-medium text-right">Valor</th>
                <th className="pb-2 pl-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {bankTransactions.map((t) => (
                <tr key={t.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-3 whitespace-nowrap text-muted">
                    {new Date(t.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </td>
                  <td className="py-3 font-medium text-brand-900">{t.descricao}</td>
                  <td className="py-3 text-muted">{t.categoria}</td>
                  <td className={`py-3 text-right font-medium tabular-nums ${t.valor < 0 ? "text-danger-500" : "text-accent-500"}`}>
                    {formatCurrencyPrecise(t.valor)}
                  </td>
                  <td className="py-3 pl-4">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
