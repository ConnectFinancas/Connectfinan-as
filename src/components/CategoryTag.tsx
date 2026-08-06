import { categoryColor } from "@/lib/categoryColor";

export function CategoryTag({ name }: { name: string }) {
  const c = categoryColor(name);
  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{ color: c.fg, borderColor: c.border, background: c.bg }}
    >
      {name}
    </span>
  );
}
