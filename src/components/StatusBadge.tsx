import { Status } from "@/lib/types";

const STYLES: Record<Status, { label: string; bg: string; fg: string; dot: string }> = {
  pago: { label: "Pago", bg: "bg-accent-100", fg: "text-accent-500", dot: "bg-accent-500" },
  recebido: { label: "Recebido", bg: "bg-accent-100", fg: "text-accent-500", dot: "bg-accent-500" },
  pendente: { label: "Pendente", bg: "bg-warn-100", fg: "text-warn-500", dot: "bg-warn-500" },
  atrasado: { label: "Atrasado", bg: "bg-danger-100", fg: "text-danger-500", dot: "bg-danger-500" },
  agendado: { label: "Agendado", bg: "bg-info-100", fg: "text-info-500", dot: "bg-info-500" },
  conciliado: { label: "Conciliado", bg: "bg-accent-100", fg: "text-accent-500", dot: "bg-accent-500" },
  nao_conciliado: { label: "Não conciliado", bg: "bg-warn-100", fg: "text-warn-500", dot: "bg-warn-500" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.fg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
