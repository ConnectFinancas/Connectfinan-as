export function ClientMonogram({
  monogram,
  accent,
  accentDark,
  size = 48,
  muted = false,
}: {
  monogram: string;
  accent: string;
  accentDark: string;
  size?: number;
  muted?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: muted ? "#c7cbd6" : `linear-gradient(135deg, ${accent}, ${accentDark})`,
      }}
    >
      {monogram}
    </div>
  );
}
