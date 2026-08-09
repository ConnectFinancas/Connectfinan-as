import { FileText } from "lucide-react";

export default function ConciliacaoBancariaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card card-dashed flex flex-col items-center gap-4 p-16 text-center">
        <div className="flex items-center gap-2 text-brand-900">
          <FileText size={18} />
          <span className="text-sm font-medium">Selecione o arquivo .OFX do seu banco</span>
        </div>
        <button className="rounded-lg bg-m4-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-m4-accent-dark transition-colors">
          Escolher arquivo OFX
        </button>
        <p className="text-xs text-faint">Nenhum arquivo selecionado</p>
      </div>
    </div>
  );
}
