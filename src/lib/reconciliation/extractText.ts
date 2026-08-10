"use client";

// Extração de texto 100% no navegador — nenhum arquivo sai do computador do usuário.

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  const pages: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const flat = content.items
      .filter((item): item is typeof item & { str: string } => "str" in item && !!item.str.trim())
      .map((item) => item.str)
      .join(" ");
    pages.push(flat);
  }
  return pages.join("\n\n");
}

export async function extractImageText(file: File): Promise<string> {
  const Tesseract = await import("tesseract.js");
  const {
    data: { text },
  } = await Tesseract.recognize(file, "por");
  return text;
}

export function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function extractText(file: File): Promise<{ text: string; viaOcr: boolean }> {
  if (isPdf(file)) return { text: await extractPdfText(file), viaOcr: false };
  return { text: await extractImageText(file), viaOcr: true };
}
