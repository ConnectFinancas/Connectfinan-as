import { Landmark } from "lucide-react";

export default function ContasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="card card-dashed flex flex-col items-center gap-3 p-16 text-center">
        <Landmark size={22} className="text-faint" />
        <p className="text-sm font-medium text-brand-900">Em construção</p>
        <p className="text-xs text-faint">Essa aba ainda vai ser desenhada.</p>
      </div>
    </div>
  );
}
