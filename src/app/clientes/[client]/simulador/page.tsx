"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { formatCurrencyPrecise } from "@/lib/format";
import { PLATAFORMA_LABEL, Plataforma, TAXAS_CONFERIDAS_EM, taxasAutomaticas } from "@/lib/precificacaoTaxas";

type Alvo = "margem" | "lucro";

function NumberField({
  label,
  value,
  onChange,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-faint">{label}</label>
      <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2.5">
        {suffix === "R$" && <span className="text-xs text-faint">R$</span>}
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-sm text-brand-900 outline-none"
        />
        {suffix === "%" && <span className="text-xs text-faint">%</span>}
      </div>
      {hint && <p className="mt-1 text-[11px] text-faint">{hint}</p>}
    </div>
  );
}

function BreakdownRow({ label, value, forte }: { label: string; value: string; forte?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${forte ? "" : "border-b border-border-subtle/60"}`}>
      <span className={forte ? "text-sm font-semibold text-brand-900" : "text-xs text-muted"}>{label}</span>
      <span className={forte ? "text-sm font-semibold text-client-accent" : "text-xs font-medium text-brand-900"}>{value}</span>
    </div>
  );
}

export default function SimuladorPage() {
  const [plataforma, setPlataforma] = useState<Plataforma>("shopee");
  const [preco, setPreco] = useState(0);
  const [alvo, setAlvo] = useState<Alvo>("margem");
  const [margemDesejada, setMargemDesejada] = useState(20);
  const [lucroDesejado, setLucroDesejado] = useState(0);
  const [impostoPct, setImpostoPct] = useState(0);
  const [afiliadosPct, setAfiliadosPct] = useState(0);
  const [custoVariavel, setCustoVariavel] = useState(0);
  const [outrasDespesas, setOutrasDespesas] = useState(0);
  const [custoFornecedor, setCustoFornecedor] = useState<number | "">("");

  const taxas = taxasAutomaticas(plataforma, preco);
  const comissaoValor = (preco * taxas.comissaoPct) / 100;
  const impostoValor = (preco * impostoPct) / 100;
  const afiliadosValor = (preco * afiliadosPct) / 100;
  const lucroAlvo = alvo === "margem" ? (preco * margemDesejada) / 100 : lucroDesejado;

  const custoMaximo =
    preco - comissaoValor - taxas.taxaFixa - impostoValor - afiliadosValor - custoVariavel - outrasDespesas - lucroAlvo;

  const margemResultante = preco > 0 ? (lucroAlvo / preco) * 100 : 0;
  const lucroResultante = lucroAlvo;

  const temFornecedor = custoFornecedor !== "" && custoFornecedor > 0;
  const fornecedorCabe = temFornecedor ? (custoFornecedor as number) <= custoMaximo : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex items-start gap-2.5 p-3.5 text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0 text-client-accent" />
        <p>
          Taxas de marketplace conferidas em {TAXAS_CONFERIDAS_EM} — confirme na Central do Vendedor antes de fechar um preço
          com fornecedor.
        </p>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-brand-900">Simulador — &quot;E se...&quot;</h2>
        <p className="mt-0.5 text-xs text-faint">Teste cenários antes de mexer nos dados reais da operação</p>

        <div className="mt-5">
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-faint">Marketplace</label>
          <div className="flex gap-2">
            {(["shopee", "tiktok"] as Plataforma[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlataforma(p)}
                className={`rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                  plataforma === p
                    ? "border-client-accent bg-client-accent/10 text-client-accent"
                    : "border-border-subtle text-muted hover:bg-surface-muted"
                }`}
              >
                {PLATAFORMA_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Preço de venda desejado (R$)" value={preco} onChange={setPreco} suffix="R$" />
          <div>
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-faint">Alvo</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAlvo("margem")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                  alvo === "margem" ? "border-client-accent bg-client-accent text-white" : "border-border-subtle text-muted hover:bg-surface-muted"
                }`}
              >
                Margem %
              </button>
              <button
                onClick={() => setAlvo("lucro")}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                  alvo === "lucro" ? "border-client-accent bg-client-accent text-white" : "border-border-subtle text-muted hover:bg-surface-muted"
                }`}
              >
                Lucro R$
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {alvo === "margem" ? (
            <NumberField label="Margem desejada (%)" value={margemDesejada} onChange={setMargemDesejada} suffix="%" />
          ) : (
            <NumberField label="Lucro desejado (R$)" value={lucroDesejado} onChange={setLucroDesejado} suffix="R$" />
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <NumberField label="Imposto (%)" value={impostoPct} onChange={setImpostoPct} suffix="%" />
          <NumberField label="Afiliados (%)" value={afiliadosPct} onChange={setAfiliadosPct} suffix="%" />
          <NumberField label="Custo variável / embalagem (R$)" value={custoVariavel} onChange={setCustoVariavel} suffix="R$" />
          <NumberField
            label="Outras despesas por venda (R$)"
            value={outrasDespesas}
            onChange={setOutrasDespesas}
            suffix="R$"
            hint="Frete que você paga, mídia rateada por unidade"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2">
          <NumberField
            label="Custo do fornecedor (R$) — opcional"
            value={custoFornecedor === "" ? 0 : custoFornecedor}
            onChange={(v) => setCustoFornecedor(v || "")}
            suffix="R$"
            hint="O preço que estão te oferecendo, pra checar se cabe"
          />
        </div>
      </div>

      {preco <= 0 ? (
        <div className="card p-5 text-center text-xs text-faint">Informe o preço de venda desejado pra simular.</div>
      ) : (
        <>
          <div className="card bg-client-accent/[0.06] p-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
              {alvo === "margem"
                ? `Custo máximo do produto pra bater ${margemDesejada}% de margem`
                : `Custo máximo do produto pra gerar ${formatCurrencyPrecise(lucroDesejado)} de lucro`}
            </p>
            <p className={`mt-2 text-4xl font-semibold tracking-tight ${custoMaximo >= 0 ? "text-client-accent" : "text-danger-500"}`}>
              {formatCurrencyPrecise(custoMaximo)}
            </p>
            <p className="mt-2 text-xs text-muted">
              {custoMaximo >= 0
                ? `Pagando isso, sua margem fica em ${margemResultante.toFixed(1)}% e o lucro em ${formatCurrencyPrecise(lucroResultante)}/un.`
                : "Com esse preço e essas taxas, não dá pra bater essa meta — nem custo zero cobriria."}
            </p>

            {temFornecedor && (
              <div
                className={`mx-auto mt-4 max-w-sm rounded-lg px-3.5 py-2.5 text-xs font-medium ${
                  fornecedorCabe ? "bg-accent-500/10 text-accent-500" : "bg-danger-500/10 text-danger-500"
                }`}
              >
                {fornecedorCabe
                  ? `Cabe! O fornecedor pediu ${formatCurrencyPrecise(custoFornecedor as number)}, ${formatCurrencyPrecise(custoMaximo - (custoFornecedor as number))} abaixo do máximo.`
                  : `Não cabe. O fornecedor pediu ${formatCurrencyPrecise(custoFornecedor as number)}, ${formatCurrencyPrecise((custoFornecedor as number) - custoMaximo)} acima do máximo.`}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-brand-900">De onde sai o número</h2>
            <div className="mt-3">
              <BreakdownRow label="Preço de venda" value={formatCurrencyPrecise(preco)} />
              <BreakdownRow label={`Comissão da plataforma (${taxas.comissaoPct.toFixed(1)}%)`} value={`− ${formatCurrencyPrecise(comissaoValor)}`} />
              {taxas.taxaFixa > 0 && <BreakdownRow label="Taxa fixa por venda" value={`− ${formatCurrencyPrecise(taxas.taxaFixa)}`} />}
              {impostoPct > 0 && <BreakdownRow label={`Imposto (${impostoPct.toFixed(1)}%)`} value={`− ${formatCurrencyPrecise(impostoValor)}`} />}
              {afiliadosPct > 0 && <BreakdownRow label={`Afiliados (${afiliadosPct.toFixed(1)}%)`} value={`− ${formatCurrencyPrecise(afiliadosValor)}`} />}
              {custoVariavel > 0 && <BreakdownRow label="Custo variável / embalagem" value={`− ${formatCurrencyPrecise(custoVariavel)}`} />}
              {outrasDespesas > 0 && <BreakdownRow label="Outras despesas por venda" value={`− ${formatCurrencyPrecise(outrasDespesas)}`} />}
              <BreakdownRow label="Lucro alvo" value={`− ${formatCurrencyPrecise(lucroAlvo)}`} />
              <div className="mt-1 pt-2">
                <BreakdownRow label="Custo máximo do produto" value={formatCurrencyPrecise(custoMaximo)} forte />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-faint">
              Taxas de marketplace verificadas em tabela por faixa de preço. Confirme na Central do Vendedor se mudou.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
