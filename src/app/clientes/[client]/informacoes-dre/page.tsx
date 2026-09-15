"use client";

import { useRef, useState } from "react";
import { Info, Paperclip, Trash2, Upload } from "lucide-react";
import { dreMonths } from "@/lib/constants";
import { ComprovanteMarketplace, useFinance } from "@/lib/store/FinanceContext";
import { MARKETPLACE_LABELS } from "@/lib/derive";
import { formatCurrencyPrecise } from "@/lib/format";
import { MarketplaceCanal, MarketplaceMensal } from "@/lib/types";

const CANAIS: MarketplaceCanal[] = ["mercadoLivre", "shopee", "shein", "tiktok"];

// Canais que têm frete descontado direto no repasse da plataforma, por enquanto.
const CANAIS_COM_FRETE_DESCONTADO = new Set<MarketplaceCanal>(["mercadoLivre", "shopee", "tiktok"]);

function metricasDoCanal(canal: MarketplaceCanal): { campo: keyof MarketplaceMensal; label: string }[] {
  const base: { campo: keyof MarketplaceMensal; label: string }[] = [
    { campo: "receita", label: "Receita de Vendas" },
    { campo: "cmv", label: "CMV (custo dos produtos vendidos)" },
    { campo: "comissao", label: "Comissão da Plataforma" },
  ];
  if (CANAIS_COM_FRETE_DESCONTADO.has(canal)) {
    base.push({ campo: "freteDescontado", label: "Frete Descontado pela Plataforma" });
  }
  return base;
}

function somaAno(valores: number[]) {
  return valores.reduce((a, v) => a + (v || 0), 0);
}

function pct(parte: number, todo: number) {
  return todo > 0 ? (parte / todo) * 100 : 0;
}

function ComprovantesDoCanal({
  comprovantes,
  onAnexar,
  onRemover,
}: {
  comprovantes: ComprovanteMarketplace[];
  onAnexar: (nome: string, dataUrl: string) => void;
  onRemover: (index: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  function handleFiles(fileList: FileList | null) {
    const arquivo = fileList?.[0];
    if (!arquivo) return;
    setEnviando(true);
    const reader = new FileReader();
    reader.onload = () => {
      onAnexar(arquivo.name, reader.result as string);
      setEnviando(false);
    };
    reader.onerror = () => setEnviando(false);
    reader.readAsDataURL(arquivo);
  }

  return (
    <div className="border-t border-border-subtle p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <Paperclip size={13} />
          Prints/comprovantes anexados (só como referência — não entram em nenhum cálculo)
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-1.5 text-[11px] font-medium text-brand-700 hover:bg-surface-muted transition-colors disabled:opacity-60"
        >
          <Upload size={12} />
          {enviando ? "Enviando..." : "Anexar imagem"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {comprovantes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {comprovantes.map((c, i) => (
            <div key={`${c.nome}-${i}`} className="group relative">
              <a href={c.dataUrl} target="_blank" rel="noopener noreferrer" title={c.nome}>
                {c.dataUrl.startsWith("data:image") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.dataUrl} alt={c.nome} className="h-16 w-16 rounded-lg border border-border-subtle object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border-subtle bg-surface-muted text-[10px] text-muted">
                    PDF
                  </div>
                )}
              </a>
              <button
                onClick={() => onRemover(i)}
                title="Remover"
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-danger-500 text-white group-hover:flex"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CanalCard({
  canal,
  dados,
  comprovantes,
  onChange,
  onAnexarComprovante,
  onRemoverComprovante,
}: {
  canal: MarketplaceCanal;
  dados: MarketplaceMensal;
  comprovantes: ComprovanteMarketplace[];
  onChange: (campo: keyof MarketplaceMensal, mesIndex: number, valor: number) => void;
  onAnexarComprovante: (nome: string, dataUrl: string) => void;
  onRemoverComprovante: (index: number) => void;
}) {
  const metricas = metricasDoCanal(canal);
  const totalReceita = somaAno(dados.receita);
  const totalCmv = somaAno(dados.cmv);
  const totalComissao = somaAno(dados.comissao);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-3">
        <h3 className="text-sm font-semibold text-brand-900">{MARKETPLACE_LABELS[canal]}</h3>
        {totalReceita > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-surface-muted px-2 py-1 text-[11px] font-medium text-muted">
              CMV: {pct(totalCmv, totalReceita).toFixed(1)}% da receita
            </span>
            <span className="rounded-full bg-surface-muted px-2 py-1 text-[11px] font-medium text-muted">
              Comissão: {pct(totalComissao, totalReceita).toFixed(1)}% da receita
            </span>
          </div>
        )}
      </div>
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-[11px] text-faint">
              <th className="py-2 pl-4 pr-3 font-medium sticky left-0 bg-surface whitespace-nowrap">Informação</th>
              {dreMonths.map((m) => (
                <th key={m} className="py-2 px-2 text-right font-medium whitespace-nowrap">
                  {m.toUpperCase()}
                </th>
              ))}
              <th className="py-2 pl-2 pr-4 text-right font-medium whitespace-nowrap">Total</th>
            </tr>
          </thead>
          <tbody>
            {metricas.map(({ campo, label }) => {
              const valores = dados[campo];
              const total = somaAno(valores);
              return (
                <tr key={campo} className="border-b border-border-subtle last:border-0">
                  <td className="py-1.5 pl-4 pr-3 whitespace-nowrap sticky left-0 bg-surface text-xs text-muted">{label}</td>
                  {valores.map((v, i) => (
                    <td key={i} className="py-1.5 px-1">
                      <input
                        type="number"
                        step="0.01"
                        value={v || ""}
                        onChange={(e) => onChange(campo, i, e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="0"
                        className="w-20 rounded-md border border-border-subtle bg-surface-muted px-1.5 py-1 text-right text-xs text-brand-900 outline-none focus:border-client-accent"
                      />
                    </td>
                  ))}
                  <td className="py-1.5 pl-2 pr-4 text-right text-xs font-semibold tabular-nums text-brand-900 whitespace-nowrap">
                    {formatCurrencyPrecise(total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ComprovantesDoCanal comprovantes={comprovantes} onAnexar={onAnexarComprovante} onRemover={onRemoverComprovante} />
    </div>
  );
}

export default function InformacoesDrePage() {
  const { marketplaceManual, setMarketplaceValor, comprovantesMarketplace, adicionarComprovanteMarketplace, removerComprovanteMarketplace } =
    useFinance();

  const totalPorMetrica = (campo: keyof MarketplaceMensal) =>
    CANAIS.reduce((soma, canal) => soma + somaAno(marketplaceManual[canal][campo]), 0);

  const totalReceita = totalPorMetrica("receita");
  const totalCmv = totalPorMetrica("cmv");
  const totalComissao = totalPorMetrica("comissao");

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex items-start gap-2.5 p-4 text-xs text-faint">
        <Info size={14} className="mt-0.5 shrink-0" />
        <p>
          Essas informações vêm de fora do sistema (das próprias plataformas de venda) e são digitadas aqui mês a mês.
          Elas entram automaticamente no DRE: a receita soma na <span className="text-brand-700 font-medium">Receita</span>,
          o CMV soma na linha <span className="text-brand-700 font-medium">(-) CMV</span>, a comissão vira a linha{" "}
          <span className="text-brand-700 font-medium">(-) Comissões de Marketplace</span>, e o frete descontado vira as
          linhas próprias de frete descontado.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Receita total (ano)</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{formatCurrencyPrecise(totalReceita)}</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">CMV total (ano)</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{formatCurrencyPrecise(totalCmv)}</p>
          <p className="mt-1 text-xs text-faint">{pct(totalCmv, totalReceita).toFixed(1)}% da receita total</p>
        </div>
        <div className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Comissões total (ano)</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">{formatCurrencyPrecise(totalComissao)}</p>
          <p className="mt-1 text-xs text-faint">{pct(totalComissao, totalReceita).toFixed(1)}% da receita total</p>
        </div>
      </div>

      {CANAIS.map((canal) => (
        <CanalCard
          key={canal}
          canal={canal}
          dados={marketplaceManual[canal]}
          comprovantes={comprovantesMarketplace[canal]}
          onChange={(campo, mesIndex, valor) => setMarketplaceValor(canal, campo, mesIndex, valor)}
          onAnexarComprovante={(nome, dataUrl) => adicionarComprovanteMarketplace(canal, nome, dataUrl)}
          onRemoverComprovante={(index) => removerComprovanteMarketplace(canal, index)}
        />
      ))}
    </div>
  );
}
