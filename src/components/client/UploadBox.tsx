"use client";

import { useRef, useState } from "react";
import { LucideIcon, Upload, X } from "lucide-react";

export function UploadBox({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [arrastando, setArrastando] = useState(false);

  function handleFiles(files: FileList | null) {
    if (files && files[0]) setFile(files[0]);
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
        <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2">
          <span className="truncate text-xs text-brand-900">{file.name}</span>
          <button
            title="Remover arquivo"
            onClick={() => {
              setFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 text-faint hover:text-danger-500 transition-colors"
          >
            <X size={14} />
          </button>
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
