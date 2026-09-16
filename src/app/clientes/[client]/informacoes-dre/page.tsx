"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, Paperclip, Trash2, Upload } from "lucide-react";
import { dreMonths } from "@/lib/constants";
import { ComprovanteMarketplace, useFinance } from "@/lib/store/FinanceContext";
import { MARKETPLACE_LABELS } from "@/lib/derive";
import { formatCurrencyPrecise } from "@/lib/format";
import { MarketplaceCanal, MarketplaceMensal } from "@/lib/types";

const CANAIS: MarketplaceCanal[] = ["mercadoLivre", "shopee", "shein", "tiktok"];

// Canais que têm frete descontado direto no repasse da plataforma, por enquanto.
const CANAIS_COM_FRETE_DESCONTADO = new Set<MarketplaceCanal>(["mercadoLivre", "shopee", "tiktok"]);

// Canais sem relatório automático de Ads/afiliados — o cliente digita esse valor mês a mês aqui
// (Shopee Ads, Afiliados Mercado Livre); a tela avisa quando o mês atual ainda está zerado.
const CANAIS_COM_ADS = new Set<MarketplaceCanal>(["mercadoLivre", "shopee"]);

function metricasDoCanal(canal: MarketplaceCanal): { campo: keyof MarketplaceMensal; label: string }[] {
  const base: { campo: keyof MarketplaceMensal; label: string }[] = [
    { campo: "receita", label: "Receita de Vendas" },
    { campo: "cmv", label: "CMV (custo dos produtos vendidos)" },
    { campo: "comissao", label: "Comissão da Plataforma" },
  ];
  if (CANAIS_COM_FRETE_DESCONTADO.has(canal)) {
    base.push({ campo: "freteDescontado", label: "Frete Descontado pela Plataforma" });
  }
  if (CANAIS_COM_ADS.has(canal)) {
    base.push({ campo: "ads", label: "Ads / Afiliados (digitar manualmente)" });
  }
  return base;
}

function somaAno(valores: number[]) {
  return valores.reduce((a, v) => a + (v || 0), 0);
}

function pct(parte: number, todo: number) {
  return todo > 0 ? (parte / todo) * 100 : 0;
}

function mesTemAlgumDado(manual: Record<MarketplaceCanal, MarketplaceMensal>, mesIndex: number) {
  return CANAIS.some((canal) => manual[canal].receita[mesIndex] > 0);
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

function CanalMonthCard({
  canal,
  mesIndex,
  dados,
  comprovantes,
  onChange,
  onAnexarComprovante,
  onRemoverComprovante,
}: {
  canal: MarketplaceCanal;
  mesIndex: number;
  dados: MarketplaceMensal;
  comprovantes: ComprovanteMarketplace[];
  onChange: (campo: keyof MarketplaceMensal, valor: number) => void;
  onAnexarComprovante: (nome: string, dataUrl: string) => void;
  onRemoverComprovante: (index: number) => void;
}) {
  const metricas = metricasDoCanal(canal);
  const receitaMes = dados.receita[mesIndex] || 0;
  const cmvMes = dados.cmv[mesIndex] || 0;
  const comissaoMes = dados.comissao[mesIndex] || 0;
  const adsMes = dados.ads[mesIndex] || 0;
  const faltaAds = CANAIS_COM_ADS.has(canal) && receitaMes > 0 && adsMes === 0;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-3">
        <h3 className="text-sm font-semibold text-brand-900">{MARKETPLACE_LABELS[canal]}</h3>
        {receitaMes > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-surface-muted px-2 py-1 text-[11px] font-medium text-muted">
              CMV: {pct(cmvMes, receitaMes).toFixed(1)}% da receita
            </span>
            <span className="rounded-full bg-surface-muted px-2 py-1 text-[11px] font-medium text-muted">
              Comissão: {pct(comissaoMes, receitaMes).toFixed(1)}% da receita
            </span>
          </div>
        )}
      </div>
      {faltaAds && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-lg bg-warn-500/10 p-2.5 text-[11px] text-warn-500">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <p>Falta preencher Ads/Afiliados de {MARKETPLACE_LABELS[canal]} desse mês — sem relatório automático, não esquece de digitar.</p>
        </div>
      )}
      <div className="flex flex-col gap-2.5 px-4 pb-4">
        {metricas.map(({ campo, label }) => (
          <label key={campo} className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted">{label}</span>
            <input
              type="number"
              step="0.01"
              value={dados[campo][mesIndex] || ""}
              onChange={(e) => onChange(campo, e.target.value === "" ? 0 : Number(e.target.value))}
              placeholder="0"
              className="w-32 rounded-md border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-right text-sm text-brand-900 outline-none focus:border-client-accent"
            />
          </label>
        ))}
      </div>
      <ComprovantesDoCanal comprovantes={comprovantes} onAnexar={onAnexarComprovante} onRemover={onRemoverComprovante} />
    </div>
  );
}

export default function InformacoesDrePage() {
  const { marketplaceManual, setMarketplaceValor, comprovantesMarketplace, adicionarComprovanteMarketplace, removerComprovanteMarketplace } =
    useFinance();

  const [mesIndex, setMesIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMesIndex(new Date().getMonth());
  }, []);

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
          Escolha o mês abaixo e preencha por marketplace. Elas entram automaticamente no DRE: a receita soma na{" "}
          <span className="text-brand-700 font-medium">Receita</span>, o CMV soma na linha{" "}
          <span className="text-brand-700 font-medium">(-) CMV</span>, a comissão vira a linha{" "}
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

      <div className="card flex flex-wrap gap-1.5 p-2">
        {dreMonths.map((m, i) => {
          const selecionado = i === mesIndex;
          const preenchido = mesTemAlgumDado(marketplaceManual, i);
          return (
            <button
              key={m}
              onClick={() => setMesIndex(i)}
              className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                selecionado ? "bg-client-accent text-white" : "text-muted hover:bg-surface-muted"
              }`}
            >
              {m}
              {preenchido && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${selecionado ? "bg-white" : "bg-accent-500"}`}
                  title="Já tem dados lançados nesse mês"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {CANAIS.map((canal) => (
          <CanalMonthCard
            key={canal}
            canal={canal}
            mesIndex={mesIndex}
            dados={marketplaceManual[canal]}
            comprovantes={comprovantesMarketplace[canal]}
            onChange={(campo, valor) => setMarketplaceValor(canal, campo, mesIndex, valor)}
            onAnexarComprovante={(nome, dataUrl) => adicionarComprovanteMarketplace(canal, nome, dataUrl)}
            onRemoverComprovante={(index) => removerComprovanteMarketplace(canal, index)}
          />
        ))}
      </div>
    </div>
  );
}
