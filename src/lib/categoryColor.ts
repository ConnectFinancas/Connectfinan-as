const PALETTE = [
  { fg: "#22d3a0", border: "rgba(34,211,160,0.35)", bg: "rgba(34,211,160,0.12)" },
  { fg: "#5b93fd", border: "rgba(91,147,253,0.35)", bg: "rgba(91,147,253,0.12)" },
  { fg: "#f2665c", border: "rgba(242,102,92,0.35)", bg: "rgba(242,102,92,0.12)" },
  { fg: "#a78bfa", border: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.12)" },
  { fg: "#f2a93c", border: "rgba(242,169,60,0.35)", bg: "rgba(242,169,60,0.12)" },
  { fg: "#f472b6", border: "rgba(244,114,182,0.35)", bg: "rgba(244,114,182,0.12)" },
];

export function categoryColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
