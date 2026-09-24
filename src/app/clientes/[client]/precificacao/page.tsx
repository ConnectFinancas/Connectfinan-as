"use client";

import { useMemo, useState } from "react";
import { Info, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useFinance } from "@/lib/store/FinanceContext";
import { usePrecificacao } from "@/lib/store/precificacaoStore";
import { formatCurrencyPrecise } from "@/lib/format";
import { PLATAFORMA_LABEL, Plataforma, TAXAS_CONFERIDAS_EM, taxasAutomaticas } from "@/lib/precificacaoTaxas";

type Modo = "preco" | "margem" | "lucro";

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{value}</p>
      <p className="mt-1.5 text-xs text-faint">{hint}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  auto,
  onAuto,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  auto?: boolean;
  onAuto?: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <label className="text-[10px] font-medium uppercase tracking-wide text-faint">{label}</label>
        {auto && (
          <button
            type="button"
            onClick={onAuto}
            title="Recalcular automaticamente pra essa faixa de preço"
            className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold text-client-accent hover:bg-client-accent/10 transition-colors"
          >
            <RefreshCw size={9} /> Auto
          </button>
        )}
      </div>
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
    </div>
  );
}

export default function PrecificacaoPage() {
  const { client } = useFinance();
  const { custosFixos, produtos, adicionarCustoFixo, removerCustoFixo, salvarProduto, removerProduto } = usePrecificacao(client.slug);

  const [plataforma, setPlataforma] = useState<Plataforma>("shopee");
  const [nomeProduto, setNomeProduto] = useState("");
  const [custoProduto, setCustoProduto] = useState(0);
  const [custoVariavel, setCustoVariavel] = useState(0);
  const [preco, setPreco] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [comissaoPct, setComissaoPct] = useState(() => taxasAutomaticas("shopee", 0).comissaoPct);
  const [taxaFixa, setTaxaFixa] = useState(() => taxasAutomaticas("shopee", 0).taxaFixa);
  const [impostoPct, setImpostoPct] = useState(0);
  const [afiliadosPct, setAfiliadosPct] = useState(0);
  const [modo, setModo] = useState<Modo>("preco");
  const [margemDesejada, setMargemDesejada] = useState(30);
  const [lucroDesejado, setLucroDesejado] = useState(0);

  const [novoCustoNome, setNovoCustoNome] = useState("");
  const [novoCustoValor, setNovoCustoValor] = useState(0);

  function trocarPlataforma(p: Plataforma) {
    setPlataforma(p);
    const auto = taxasAutomaticas(p, preco);
    setComissaoPct(auto.comissaoPct);
    setTaxaFixa(auto.taxaFixa);
  }

  function autoComissaoTaxa() {
    const auto = taxasAutomaticas(plataforma, preco);
    setComissaoPct(auto.comissaoPct);
    setTaxaFixa(auto.taxaFixa);
  }

  const precoCheio = desconto > 0 && desconto < 100 ? preco / (1 - desconto / 100) : preco;
  const custoFixoUnit = custoProduto + custoVariavel + taxaFixa;
  const pctCustos = (comissaoPct + impostoPct + afiliadosPct) / 100;
  const lucro = preco * (1 - pctCustos) - custoFixoUnit;
  const margemPct = preco > 0 ? (lucro / preco) * 100 : 0;
  const viavel = lucro >= 0;

  const denominadorMargem = 1 - pctCustos - margemDesejada / 100;
  const precoParaMargem = denominadorMargem > 0 ? custoFixoUnit / denominadorMargem : null;

  const denominadorLucro = 1 - pctCustos;
  const precoParaLucro = denominadorLucro > 0 ? (lucroDesejado + custoFixoUnit) / denominadorLucro : null;

  const totalCustosFixosMensais = custosFixos.reduce((acc, c) => acc + c.valor, 0);

  const margemMediaProdutos = useMemo(() => {
    if (produtos.length === 0) return null;
    return produtos.reduce((acc, p) => acc + p.margemPct, 0) / produtos.length;
  }, [produtos]);

  const pontoEquilibrio = margemMediaProdutos && margemMediaProdutos > 0 ? totalCustosFixosMensais / (margemMediaProdutos / 100) : null;

  const simulador: { plataforma: Plataforma; comissaoPct: number; taxaFixa: number; margemPct: number; lucro: number }[] = (
    ["shopee", "tiktok"] as Plataforma[]
  ).map((p) => {
    const auto = taxasAutomaticas(p, preco);
    const custoFixoUnitSim = custoProduto + custoVariavel + auto.taxaFixa;
    const pctCustosSim = (auto.comissaoPct + impostoPct + afiliadosPct) / 100;
    const lucroSim = preco * (1 - pctCustosSim) - custoFixoUnitSim;
    return {
      plataforma: p,
      comissaoPct: auto.comissaoPct,
      taxaFixa: auto.taxaFixa,
      margemPct: preco > 0 ? (lucroSim / preco) * 100 : 0,
      lucro: lucroSim,
    };
  });

  function handleSalvarProduto() {
    if (!nomeProduto.trim() || preco <= 0) return;
    salvarProduto({
      nome: nomeProduto.trim(),
      plataforma,
      custoProduto,
      custoVariavel,
      preco,
      desconto,
      comissaoPct,
      taxaFixa,
      impostoPct,
      afiliadosPct,
      margemPct,
      lucro,
    });
    setNomeProduto("");
  }

  function handleAdicionarCustoFixo() {
    if (!novoCustoNome.trim() || novoCustoValor <= 0) return;
    adicionarCustoFixo(novoCustoNome.trim(), novoCustoValor);
    setNovoCustoNome("");
    setNovoCustoValor(0);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex items-start gap-2.5 p-3.5 text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0 text-client-accent" />
        <p>
          Taxas de comissão conferidas em {TAXAS_CONFERIDAS_EM} — marketplace pode mudar sem aviso, confirme na Central do
          Vendedor antes de decisões importantes. Programa de Frete Grátis considerado em ambas as plataformas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi
          label="Custos Fixos Mensais"
          value={formatCurrencyPrecise(totalCustosFixosMensais)}
          hint={`${custosFixos.length} custo(s) recorrente(s) cadastrado(s)`}
        />
        <Kpi
          label="Ponto de Equilíbrio"
          value={pontoEquilibrio !== null ? formatCurrencyPrecise(pontoEquilibrio) : "—"}
          hint={
            margemMediaProdutos !== null
              ? `Faturamento mínimo · margem média de ${margemMediaProdutos.toFixed(1)}% (${produtos.length} produto(s))`
              : "Cadastre custos fixos e salve produtos pra calcular"
          }
        />
        <Kpi label="Produtos Cadastrados" value={String(produtos.length)} hint="Salvos na calculadora abaixo" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-brand-900">Custos Fixos Mensais</h2>
            <p className="mt-0.5 text-xs text-faint">Aluguel, assinaturas, folha administrativa — usados no ponto de equilíbrio</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Nome</label>
            <input
              value={novoCustoNome}
              onChange={(e) => setNovoCustoNome(e.target.value)}
              placeholder="ex.: Aluguel"
              className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Valor mensal (R$)</label>
            <input
              type="number"
              value={novoCustoValor || ""}
              onChange={(e) => setNovoCustoValor(Number(e.target.value))}
              className="w-32 rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
            />
          </div>
          <button
            onClick={handleAdicionarCustoFixo}
            className="flex items-center gap-1.5 rounded-lg bg-client-accent px-3 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
          >
            <Plus size={13} /> Adicionar
          </button>
        </div>
        {custosFixos.length > 0 && (
          <div className="mt-4 flex flex-col gap-1.5">
            {custosFixos.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
                <span className="text-brand-900">{c.nome}</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-brand-900">{formatCurrencyPrecise(c.valor)}</span>
                  <button onClick={() => removerCustoFixo(c.id)} className="text-faint hover:text-danger-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-brand-900">Calculadora de Precificação</h2>
        <p className="mt-0.5 text-xs text-faint">Análise de margem de contribuição por produto e plataforma de venda</p>

        <div className="mt-5">
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-faint">Plataforma de Venda</label>
          <div className="flex gap-2">
            {(["shopee", "tiktok"] as Plataforma[]).map((p) => (
              <button
                key={p}
                onClick={() => trocarPlataforma(p)}
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
          <p className="mt-1.5 text-[11px] text-faint">Comissão e taxa fixa preenchidas automaticamente conforme a tabela da plataforma.</p>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-faint">Nome do produto</label>
          <input
            value={nomeProduto}
            onChange={(e) => setNomeProduto(e.target.value)}
            placeholder="ex.: Vestido Longo Feminino"
            className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2.5 text-sm text-brand-900 placeholder:text-faint"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Custo do Produto (R$)" value={custoProduto} onChange={setCustoProduto} suffix="R$" />
          <NumberField label="Custo Variável — Embalagem/Etiqueta (R$)" value={custoVariavel} onChange={setCustoVariavel} suffix="R$" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Preço de Venda (R$)" value={preco} onChange={setPreco} suffix="R$" />
          <NumberField label="Desconto (%)" value={desconto} onChange={setDesconto} suffix="%" />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-client-accent/[0.06] px-3.5 py-2.5">
          <span className="text-xs text-muted">Preço Cheio (calculado)</span>
          <span className="text-sm font-semibold text-client-accent">{formatCurrencyPrecise(precoCheio)}</span>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-faint">Taxas e Comissões</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <NumberField label="Comissão Plataforma (%)" value={comissaoPct} onChange={setComissaoPct} suffix="%" auto onAuto={autoComissaoTaxa} />
            <NumberField label="Taxa Fixa por Venda (R$)" value={taxaFixa} onChange={setTaxaFixa} suffix="R$" auto onAuto={autoComissaoTaxa} />
            <NumberField label="Imposto (%)" value={impostoPct} onChange={setImpostoPct} suffix="%" />
            <NumberField label="Afiliados (%)" value={afiliadosPct} onChange={setAfiliadosPct} suffix="%" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_auto]">
          <div className="card bg-surface-muted p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">Margem Real</p>
            <p className={`mt-1.5 text-2xl font-semibold ${margemPct >= 0 ? "text-accent-500" : "text-danger-500"}`}>
              {margemPct.toFixed(1)}%
            </p>
            <p className={`text-xs ${lucro >= 0 ? "text-accent-500" : "text-danger-500"}`}>{formatCurrencyPrecise(lucro)}</p>
          </div>

          <div className="card p-4">
            <div className="flex gap-1.5">
              {([
                { id: "preco", label: "Por Preço" },
                { id: "margem", label: "Por Margem" },
                { id: "lucro", label: "Por Lucro" },
              ] as { id: Modo; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModo(m.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    modo === m.id ? "border-client-accent bg-client-accent text-white" : "border-border-subtle text-muted hover:bg-surface-muted"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              {modo === "preco" && (
                <p className="text-xs text-faint">
                  Informe o preço acima pra ver a margem, o lucro e o detalhamento de custos. Tirou uma taxa? O lucro sobe na hora.
                </p>
              )}
              {modo === "margem" && (
                <div>
                  <div className="flex items-center justify-between text-xs text-faint">
                    <span>Margem desejada</span>
                    <span className="font-medium text-brand-900">{margemDesejada}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={95}
                    value={margemDesejada}
                    onChange={(e) => setMargemDesejada(Number(e.target.value))}
                    className="mt-2 w-full accent-[color:var(--client-accent)]"
                  />
                  <p className="mt-2 text-xs text-faint">
                    Preço para essa margem:{" "}
                    <span className="font-semibold text-client-accent">
                      {precoParaMargem !== null ? formatCurrencyPrecise(precoParaMargem) : "inviável com essas taxas"}
                    </span>{" "}
                    — digite no Preço de Venda acima se quiser usar.
                  </p>
                </div>
              )}
              {modo === "lucro" && (
                <div>
                  <label className="text-[10px] font-medium uppercase tracking-wide text-faint">Lucro desejado (R$)</label>
                  <input
                    type="number"
                    value={lucroDesejado || ""}
                    onChange={(e) => setLucroDesejado(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
                  />
                  <p className="mt-2 text-xs text-faint">
                    Preço para esse lucro:{" "}
                    <span className="font-semibold text-client-accent">
                      {precoParaLucro !== null ? formatCurrencyPrecise(precoParaLucro) : "inviável com essas taxas"}
                    </span>{" "}
                    — digite no Preço de Venda acima se quiser usar.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSalvarProduto}
            disabled={!nomeProduto.trim() || preco <= 0}
            className="h-fit self-center rounded-lg bg-client-accent px-4 py-2.5 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvar produto
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-brand-900">Simulador de Cenários</h2>
        <p className="mt-0.5 text-xs text-faint">O mesmo produto comparado nas duas plataformas — descubra onde ele rende mais</p>
        {preco <= 0 ? (
          <p className="mt-4 text-xs text-faint">Informe o Preço de Venda e os custos acima para comparar as plataformas.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {simulador.map((s) => (
              <div
                key={s.plataforma}
                className={`rounded-lg border p-4 ${
                  s.plataforma === plataforma ? "border-client-accent bg-client-accent/[0.05]" : "border-border-subtle"
                }`}
              >
                <p className="text-xs font-semibold text-brand-900">{PLATAFORMA_LABEL[s.plataforma]}</p>
                <p className="mt-1 text-[11px] text-faint">
                  Comissão {s.comissaoPct.toFixed(1)}% {s.taxaFixa > 0 ? `+ ${formatCurrencyPrecise(s.taxaFixa)} fixo` : ""}
                </p>
                <p className={`mt-2 text-xl font-semibold ${s.margemPct >= 0 ? "text-accent-500" : "text-danger-500"}`}>
                  {s.margemPct.toFixed(1)}%
                </p>
                <p className={`text-xs ${s.lucro >= 0 ? "text-accent-500" : "text-danger-500"}`}>{formatCurrencyPrecise(s.lucro)} de lucro</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`card p-5 ${viavel ? "" : "border-danger-200 bg-danger-100/40"}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-brand-900">Análise de Viabilidade</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              viavel ? "bg-accent-500/10 text-accent-500" : "bg-danger-500/10 text-danger-500"
            }`}
          >
            {viavel ? "Viável" : "Produto não cobre os custos. Inviável!"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
            <span className="text-muted">Custo do Produto</span>
            <span className="font-medium text-brand-900">{formatCurrencyPrecise(custoProduto)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
            <span className="text-muted">Custo Variável (embalagem etc.)</span>
            <span className="font-medium text-brand-900">{formatCurrencyPrecise(custoVariavel)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
            <span className="text-muted">Comissão Plataforma ({comissaoPct.toFixed(1)}%)</span>
            <span className="font-medium text-danger-500">− {formatCurrencyPrecise((preco * comissaoPct) / 100)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
            <span className="text-muted">Taxa Fixa por Venda</span>
            <span className="font-medium text-danger-500">− {formatCurrencyPrecise(taxaFixa)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
            <span className="text-muted">Impostos ({impostoPct.toFixed(1)}%)</span>
            <span className="font-medium text-danger-500">− {formatCurrencyPrecise((preco * impostoPct) / 100)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2 text-xs">
            <span className="text-muted">Afiliados ({afiliadosPct.toFixed(1)}%)</span>
            <span className="font-medium text-danger-500">− {formatCurrencyPrecise((preco * afiliadosPct) / 100)}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-client-accent/[0.08] px-3.5 py-3">
          <span className="text-xs font-semibold text-brand-900">Margem de Contribuição</span>
          <span className={`text-sm font-semibold ${lucro >= 0 ? "text-accent-500" : "text-danger-500"}`}>
            {formatCurrencyPrecise(lucro)} ({margemPct.toFixed(1)}%)
          </span>
        </div>
      </div>

      {produtos.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-5 pb-0">
            <h2 className="text-sm font-semibold text-brand-900">Produtos Salvos</h2>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left text-xs text-faint">
                  <th className="pb-2 font-medium">Produto</th>
                  <th className="pb-2 font-medium">Plataforma</th>
                  <th className="pb-2 font-medium">Preço</th>
                  <th className="pb-2 font-medium">Margem</th>
                  <th className="pb-2 font-medium">Lucro</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-muted/60">
                    <td className="py-2.5 text-brand-900">{p.nome}</td>
                    <td className="py-2.5 text-muted">{PLATAFORMA_LABEL[p.plataforma]}</td>
                    <td className="py-2.5 text-muted">{formatCurrencyPrecise(p.preco)}</td>
                    <td className={`py-2.5 font-medium ${p.margemPct >= 0 ? "text-accent-500" : "text-danger-500"}`}>{p.margemPct.toFixed(1)}%</td>
                    <td className={`py-2.5 font-medium ${p.lucro >= 0 ? "text-accent-500" : "text-danger-500"}`}>{formatCurrencyPrecise(p.lucro)}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => removerProduto(p.id)} className="text-faint hover:text-danger-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
