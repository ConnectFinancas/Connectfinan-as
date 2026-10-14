// Exportação de CSV pro navegador — separador ";" (não ",") porque o Excel em pt-BR usa vírgula
// como separador decimal; com "," como separador de coluna, qualquer valor em R$ quebraria a
// planilha em colunas erradas. BOM UTF-8 no início garante que acentos abram certo no Excel.
function escapeCsvField(value: string): string {
  if (/[";\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const linhas = [headers, ...rows].map((linha) =>
    linha.map((campo) => escapeCsvField(String(campo))).join(";")
  );
  const conteudo = "﻿" + linhas.join("\r\n");
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
