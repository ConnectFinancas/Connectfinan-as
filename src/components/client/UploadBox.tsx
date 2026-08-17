"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronUp, Copy, Loader2, LucideIcon, Plus, Upload, X } from "lucide-react";
import { extractText } from "@/lib/reconciliation/extractText";

type ArquivoLido = {
  file: File;
  status: "lendo" | "ok" | "erro";
  texto: string;
  viaOcr: boolean;
};

export function UploadBox({
  icon: Icon,
  title,
  hint,
  onExtracted,
  multiple,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  onExtracted?: (result: { text: string; viaOcr: boolean; file: File } | null) => void;
  /** Quando true, permite anexar vários arquivos (ex.: várias fotos do mesmo extrato) — os
   * textos lidos de cada um são concatenados antes de seguir pra conciliação. */
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivos, setArquivos] = useState<ArquivoLido[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  function emitir(lista: ArquivoLido[]) {
    const prontos = lista.filter((a) => a.status === "ok");
    if (prontos.length === 0) {
      onExtracted?.(null);
      return;
    }
    onExtracted?.({
      text: prontos.map((a) => a.texto).join("\n\n"),
      viaOcr: prontos.some((a) => a.viaOcr),
      file: prontos[0].file,
    });
  }

  async function handleFiles(fileList: FileList | null) {
    const novos = fileList ? Array.from(fileList) : [];
    if (novos.length === 0) return;
    const selecionados = multiple ? novos : [novos[0]];

    setArquivos((atual) => {
      const base = multiple ? atual : [];
      const proximo = [...base, ...selecionados.map((f) => ({ file: f, status: "lendo" as const, texto: "", viaOcr: false }))];
      return proximo;
    });

    for (const f of selecionados) {
      try {
        const { text, viaOcr } = await extractText(f);
        setArquivos((atual) => {
          const proximo = atual.map((a) => (a.file === f ? { ...a, status: "ok" as const, texto: text, viaOcr } : a));
          emitir(proximo);
          return proximo;
        });
      } catch {
        setArquivos((atual) => {
          const proximo = atual.map((a) => (a.file === f ? { ...a, status: "erro" as const } : a));
          emitir(proximo);
          return proximo;
        });
      }
    }
  }

  function removerArquivo(file: File) {
    setArquivos((atual) => {
      const proximo = atual.filter((a) => a.file !== file);
      emitir(proximo);
      return proximo;
    });
  }

  function limparTudo() {
    setArquivos([]);
    setMostrarTexto(false);
    if (inputRef.current) inputRef.current.value = "";
    onExtracted?.(null);
  }

  async function copiarTexto() {
    try {
      const textoCompleto = arquivos
        .filter((a) => a.status === "ok")
        .map((a) => a.texto)
        .join("\n\n");
      await navigator.clipboard.writeText(textoCompleto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // navegador sem permissão de clipboard — ignora, usuário pode selecionar manualmente
    }
  }

  const algumLendo = arquivos.some((a) => a.status === "lendo");
  const algumOk = arquivos.some((a) => a.status === "ok");
  const textoCompleto = arquivos
    .filter((a) => a.status === "ok")
    .map((a) => a.texto)
    .join("\n\n");

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setArrastando(true);
      }}
      onDragLeave={() => setArrastando(false)}
      onDrop={(e) => {
        e.preventDefault();
        setArrastando(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`card card-dashed flex flex-col items-center gap-3 p-6 text-center transition-colors ${
        arrastando ? "border-client-accent bg-client-accent/5" : ""
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-client-accent">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-medium text-brand-900">{title}</p>
        <p className="mt-0.5 text-xs text-faint">{hint}</p>
      </div>

      {arquivos.length > 0 ? (
        <div className="flex w-full flex-col gap-1.5">
          {arquivos.map((a, i) => (
            <div key={`${a.file.name}-${i}`} className="flex w-full items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2">
              <span className="truncate text-xs text-brand-900">{a.file.name}</span>
              <div className="flex shrink-0 items-center gap-2">
                {a.status === "lendo" && <Loader2 size={12} className="animate-spin text-faint" />}
                {a.status === "ok" && <Check size={12} className="text-accent-500" />}
                {a.status === "erro" && <AlertTriangle size={12} className="text-danger-500" />}
                <button title="Remover arquivo" onClick={() => removerArquivo(a.file)} className="text-faint hover:text-danger-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

          {algumLendo && (
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-faint">
              <Loader2 size={11} className="animate-spin" />
              Lendo...
            </p>
          )}
          {!algumLendo && algumOk && (
            <>
              <p className="text-[11px] text-accent-500">
                {arquivos.filter((a) => a.status === "ok").length > 1 ? "Todos lidos com sucesso" : "Lido com sucesso"}
                {arquivos.some((a) => a.status === "ok" && a.viaOcr) ? " (OCR — confira os valores)" : ""}
              </p>
              <button
                onClick={() => setMostrarTexto((v) => !v)}
                className="flex items-center justify-center gap-1 text-[11px] font-medium text-client-accent hover:underline"
              >
                {mostrarTexto ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                {mostrarTexto ? "Ocultar texto lido" : "Ver texto lido"}
              </button>
              {mostrarTexto && (
                <div className="flex flex-col gap-1.5 text-left">
                  <textarea
                    readOnly
                    value={textoCompleto || "(nenhum texto foi extraído)"}
                    className="h-40 w-full resize-y rounded-lg border border-border-subtle bg-white p-2 font-mono text-[10px] text-brand-900"
                  />
                  <button
                    onClick={copiarTexto}
                    className="flex items-center justify-center gap-1 self-start rounded-lg border border-border-subtle px-2 py-1 text-[11px] font-medium text-brand-700 hover:bg-surface-muted transition-colors"
                  >
                    {copiado ? <Check size={11} className="text-accent-500" /> : <Copy size={11} />}
                    {copiado ? "Copiado!" : "Copiar texto"}
                  </button>
                </div>
              )}
            </>
          )}
          {arquivos.some((a) => a.status === "erro") && (
            <p className="flex items-center justify-center gap-1 text-[11px] text-danger-500">
              <AlertTriangle size={11} />
              Não consegui ler {arquivos.filter((a) => a.status === "erro").length > 1 ? "alguns arquivos" : "um dos arquivos"}
            </p>
          )}

          <div className="flex items-center justify-center gap-3">
            {multiple && (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1 text-[11px] font-medium text-client-accent hover:underline"
              >
                <Plus size={11} />
                Anexar mais imagens
              </button>
            )}
            <button onClick={limparTudo} className="text-[11px] font-medium text-faint hover:text-danger-500 transition-colors">
              Remover tudo
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg bg-client-accent px-4 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
        >
          <Upload size={13} />
          {multiple ? "Selecionar arquivo(s)" : "Selecionar arquivo"}
        </button>
      )}
      <p className="text-[11px] text-faint">
        PDF ou imagem{multiple ? " · pode selecionar mais de uma imagem de uma vez" : ""} · ou arraste o arquivo aqui
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
