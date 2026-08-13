"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronUp, Copy, Loader2, LucideIcon, Upload, X } from "lucide-react";
import { extractText, isPdf } from "@/lib/reconciliation/extractText";

export function UploadBox({
  icon: Icon,
  title,
  hint,
  onExtracted,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  onExtracted?: (result: { text: string; viaOcr: boolean; file: File } | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [status, setStatus] = useState<"idle" | "lendo" | "ok" | "erro">("idle");
  const [textoLido, setTextoLido] = useState("");
  const [mostrarTexto, setMostrarTexto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setFile(f);
    setStatus("lendo");
    setTextoLido("");
    try {
      const { text, viaOcr } = await extractText(f);
      setStatus("ok");
      setTextoLido(text);
      onExtracted?.({ text, viaOcr, file: f });
    } catch {
      setStatus("erro");
      onExtracted?.(null);
    }
  }

  function limpar() {
    setFile(null);
    setStatus("idle");
    setTextoLido("");
    setMostrarTexto(false);
    if (inputRef.current) inputRef.current.value = "";
    onExtracted?.(null);
  }

  async function copiarTexto() {
    try {
      await navigator.clipboard.writeText(textoLido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // navegador sem permissão de clipboard — ignora, usuário pode selecionar manualmente
    }
  }

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

      {file ? (
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2">
            <span className="truncate text-xs text-brand-900">{file.name}</span>
            <button title="Remover arquivo" onClick={limpar} className="shrink-0 text-faint hover:text-danger-500 transition-colors">
              <X size={14} />
            </button>
          </div>
          {status === "lendo" && (
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-faint">
              <Loader2 size={11} className="animate-spin" />
              {isPdf(file) ? "Lendo PDF..." : "Lendo imagem (OCR)..."}
            </p>
          )}
          {status === "ok" && (
            <>
              <p className="text-[11px] text-accent-500">Lido com sucesso{!isPdf(file) ? " (OCR — confira os valores)" : ""}</p>
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
                    value={textoLido || "(nenhum texto foi extraído)"}
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
          {status === "erro" && (
            <p className="flex items-center justify-center gap-1 text-[11px] text-danger-500">
              <AlertTriangle size={11} />
              Não consegui ler esse arquivo
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg bg-client-accent px-4 py-2 text-xs font-semibold text-white hover:bg-client-accent-dark transition-colors"
        >
          <Upload size={13} />
          Selecionar arquivo
        </button>
      )}
      <p className="text-[11px] text-faint">PDF ou imagem · ou arraste o arquivo aqui</p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
