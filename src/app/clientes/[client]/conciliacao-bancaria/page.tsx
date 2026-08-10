"use client";

import { FileImage, FileSpreadsheet, Landmark } from "lucide-react";
import { UploadBox } from "@/components/client/UploadBox";

export default function ConciliacaoBancariaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-brand-900">Documentos do período</h2>
        <p className="mt-0.5 text-xs text-faint">
          Envie os 4 documentos para começar a conciliação. O relatório de faturamento é a base — as demais entradas são
          conferidas contra ele.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UploadBox icon={Landmark} title="Extrato Bradesco" hint="Extrato bancário da conta Bradesco" />
          <UploadBox icon={Landmark} title="Extrato PagBank" hint="Extrato da conta/maquininha PagBank" />
          <UploadBox icon={FileImage} title="Movimento do caixa físico" hint="Foto ou print do controle de caixa (espécie)" />
          <UploadBox icon={FileSpreadsheet} title="Relatório de faturamento" hint="Vendas do período (base da conciliação)" />
        </div>
      </div>
    </div>
  );
}
