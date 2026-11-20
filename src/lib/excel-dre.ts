import type { Workbook, Worksheet } from "exceljs";

// Exportação de DRE/Fluxo de Caixa em Excel no mesmo "visual" da tela: cabeçalho destacado,
// seções/subtotais/total em negrito com preenchimento, despesas em tom âmbar (igual ao
// text-warn-500 da tela) e o resultado final em verde/vermelho conforme o sinal — célula a
// célula, igual ao comportamento dinâmico da tabela no navegador.

export type DreSheetRowKind = "section" | "header" | "subtotal" | "total" | "normal" | "detail";

export interface DreSheetRow {
  label: string;
  kind: DreSheetRowKind;
  indent?: number;
  negative?: boolean;
  values: (number | null)[];
  pct: number | null;
}

const COR_CABECALHO = "FF1F2A44";
const COR_SECAO = "FFE5E7EB";
const COR_DESTAQUE = "FFF3F4F6";
const COR_TOTAL = "FFE8F5EE";
const COR_TEXTO_SECAO = "FF4B5563";
const COR_TEXTO_DETALHE = "FF6B7280";
const COR_TEXTO_DESPESA = "FF92400E";
const COR_POSITIVO = "FF15803D";
const COR_NEGATIVO = "FFB91C1C";
const FORMATO_MOEDA = '"R$" #,##0.00;-"R$" #,##0.00';
const FORMATO_PCT = "0.0%";

export function buildStyledSheet(
  workbook: Workbook,
  sheetName: string,
  headerLabels: string[],
  rows: DreSheetRow[],
  numValueCols: number
): Worksheet {
  const ws = workbook.addWorksheet(sheetName.slice(0, 31), { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });

  ws.columns = [
    { width: 40 },
    ...Array(numValueCols)
      .fill(null)
      .map(() => ({ width: 15 })),
    { width: 9 },
  ];

  const headerRow = ws.addRow(headerLabels);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_CABECALHO } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  headerRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 20;

  for (const row of rows) {
    if (row.kind === "section") {
      const r = ws.addRow([row.label]);
      ws.mergeCells(r.number, 1, r.number, 1 + numValueCols + 1);
      r.eachCell((cell) => {
        cell.font = { bold: true, size: 10, color: { argb: COR_TEXTO_SECAO } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR_SECAO } };
      });
      continue;
    }

    const indent = row.indent ?? 0;
    const pctValue = row.pct === null ? null : row.pct / 100;
    const values: (number | string)[] = row.values.map((v) => (v === null ? "" : v));
    const r = ws.addRow([row.label, ...values, pctValue === null ? "" : pctValue]);

    const labelCell = r.getCell(1);
    labelCell.alignment = { indent };

    const isBold = row.kind === "header" || row.kind === "subtotal" || row.kind === "total";
    const fill = row.kind === "total" ? COR_TOTAL : row.kind === "subtotal" || row.kind === "header" ? COR_DESTAQUE : undefined;

    r.eachCell((cell, colNumber) => {
      if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      if (row.kind === "subtotal" || row.kind === "total") {
        cell.border = { top: { style: "thin", color: { argb: "FFCBD5E1" } } };
      }
      if (colNumber === 1) {
        cell.font = { bold: isBold, italic: row.kind === "detail", size: row.kind === "detail" ? 10 : 11 };
        if (row.kind === "detail") cell.font = { ...cell.font, color: { argb: COR_TEXTO_DETALHE } };
      } else if (colNumber === headerLabels.length) {
        cell.numFmt = FORMATO_PCT;
        cell.alignment = { horizontal: "right" };
        cell.font = { size: 10, color: { argb: COR_TEXTO_DETALHE } };
      } else {
        cell.numFmt = FORMATO_MOEDA;
        cell.alignment = { horizontal: "right" };
        cell.font = { bold: isBold, size: row.kind === "detail" ? 10 : 11 };
        if (row.kind === "total") {
          const v = row.values[colNumber - 2];
          cell.font = { ...cell.font, color: { argb: (v ?? 0) >= 0 ? COR_POSITIVO : COR_NEGATIVO } };
        } else if (row.negative && row.kind === "normal") {
          cell.font = { ...cell.font, color: { argb: COR_TEXTO_DESPESA } };
        } else if (row.kind === "detail") {
          cell.font = { ...cell.font, color: { argb: COR_TEXTO_DETALHE } };
        }
      }
    });
  }

  return ws;
}

export async function downloadWorkbook(workbook: Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
