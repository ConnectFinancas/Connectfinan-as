"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { FormaPagamento, MovimentoBradesco, MovimentoPagBank, VendaExtraida } from "@/lib/reconciliation/types";
import { formatCurrencyPrecise } from "@/lib/format";
import { formatDateBR } from "@/lib/today";

const FORMAS: { valor: FormaPagamento; rotulo: string }[] = [
  { valor: "CARTAO DE CREDITO", rotulo: "Cartão de Crédito" },
  { valor: "CARTAO DE DEBITO", rotulo: "Cartão de Débito" },
  { valor: "DINHEIRO", rotulo: "Dinheiro" },
  { valor: "PIX", rotulo: "Pix" },
];

function rotuloForma(forma: FormaPagamento) {
  return FORMAS.find((f) => f.valor === forma)?.rotulo ?? forma;
}

// ---------- Faturamento: venda + forma de recebimento ----------

function FormularioVenda({
  inicial,
  onSalvar,
  onCancelar,
  textoBotao,
}: {
  inicial?: VendaExtraida;
  onSalvar: (v: VendaExtraida) => void;
  onCancelar?: () => void;
  textoBotao: string;
}) {
  const [data, setData] = useState(inicial?.data ?? "");
  const [hora, setHora] = useState(inicial?.hora ?? "");
  const [valor, setValor] = useState(inicial ? String(inicial.valor).replace(".", ",") : "");
  const [forma, setForma] = useState<FormaPagamento>(inicial?.forma ?? "CARTAO DE CREDITO");

  function salvar() {
    const valorNum = Number(valor.replace(",", "."));
    if (!data || !valorNum) return;
    onSalvar({ data, hora: hora.trim(), vendedor: inicial?.vendedor ?? "—", valor: valorNum, forma });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        />
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        />
        <select
          value={forma}
          onChange={(e) => setForma(e.target.value as FormaPagamento)}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        >
          {FORMAS.map((f) => (
            <option key={f.valor} value={f.valor}>
              {f.rotulo}
            </option>
          ))}
        </select>
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0,00"
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={salvar}
          className="flex items-center justify-center gap-1.5 self-start rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
        >
          {textoBotao === "Adicionar venda" ? <Plus size={12} /> : <Check size={12} />}
          {textoBotao}
        </button>
        {onCancelar && (
          <button onClick={onCancelar} className="text-xs font-medium text-faint hover:text-danger-500 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export function FaturamentoManualTable({ vendas, onChange }: { vendas: VendaExtraida[]; onChange: (v: VendaExtraida[]) => void }) {
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <p className="text-xs text-faint">
        Informe o valor da venda e a forma de recebimento (cartão de crédito, cartão de débito, dinheiro ou pix).
      </p>

      {editandoIdx === null && (
        <FormularioVenda textoBotao="Adicionar venda" onSalvar={(v) => onChange([...vendas, v])} />
      )}

      {vendas.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-border-subtle p-2">
          {vendas.map((v, i) =>
            editandoIdx === i ? (
              <div key={i} className="rounded-lg bg-surface-muted p-2">
                <FormularioVenda
                  inicial={v}
                  textoBotao="Salvar correção"
                  onSalvar={(nova) => {
                    onChange(vendas.map((x, idx) => (idx === i ? nova : x)));
                    setEditandoIdx(null);
                  }}
                  onCancelar={() => setEditandoIdx(null)}
                />
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-faint">{formatDateBR(v.data)}</span>
                <span className="flex-1 truncate text-muted">
                  {rotuloForma(v.forma)}
                  {v.hora && <span className="text-faint"> · {v.hora}</span>}
                </span>
                <span className="tabular-nums text-brand-900">{formatCurrencyPrecise(v.valor)}</span>
                <button onClick={() => setEditandoIdx(i)} title="Corrigir" className="text-faint hover:text-client-accent transition-colors">
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onChange(vendas.filter((_, idx) => idx !== i))}
                  title="Remover"
                  className="text-faint hover:text-danger-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ---------- PagBank: recebimentos e saídas ----------

function FormularioPagBank({
  inicial,
  onSalvar,
  onCancelar,
  textoBotao,
}: {
  inicial?: MovimentoPagBank;
  onSalvar: (m: MovimentoPagBank) => void;
  onCancelar?: () => void;
  textoBotao: string;
}) {
  const [data, setData] = useState(inicial?.data ?? "");
  const [tipo, setTipo] = useState<"recebimento" | "saida">(inicial && inicial.valor < 0 ? "saida" : "recebimento");
  const [valor, setValor] = useState(inicial ? String(Math.abs(inicial.valor)).replace(".", ",") : "");
  const [descricao, setDescricao] = useState(inicial ? inicial.descricao.replace(/^Valor dispon[íi]vel\s*-?\s*/i, "") : "");

  function salvar() {
    const valorNum = Number(valor.replace(",", "."));
    if (!data || !valorNum) return;
    if (tipo === "saida") {
      onSalvar({ data, descricao: descricao.trim() || "—", valor: -valorNum });
    } else {
      // "disponivel" (sem acento, igual ao texto usado no matching de cartão x PagBank em
      // conciliarDia) precisa aparecer na descrição pra bater com os créditos de cartão.
      onSalvar({ data, descricao: descricao.trim() ? `Valor disponivel - ${descricao.trim()}` : "Valor disponivel", valor: valorNum });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "recebimento" | "saida")}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        >
          <option value="recebimento">Recebimento</option>
          <option value="saida">Saída</option>
        </select>
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder={tipo === "saida" ? "Fornecedor / descrição" : "Observação (opcional)"}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0,00"
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={salvar}
          className="flex items-center justify-center gap-1.5 self-start rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
        >
          {textoBotao === "Adicionar lançamento" ? <Plus size={12} /> : <Check size={12} />}
          {textoBotao}
        </button>
        {onCancelar && (
          <button onClick={onCancelar} className="text-xs font-medium text-faint hover:text-danger-500 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export function PagBankManualTable({ movimentos, onChange }: { movimentos: MovimentoPagBank[]; onChange: (m: MovimentoPagBank[]) => void }) {
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <p className="text-xs text-faint">Informe os valores de recebimento e as saídas do extrato PagBank.</p>

      {editandoIdx === null && (
        <FormularioPagBank textoBotao="Adicionar lançamento" onSalvar={(m) => onChange([...movimentos, m])} />
      )}

      {movimentos.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-border-subtle p-2">
          {movimentos.map((m, i) =>
            editandoIdx === i ? (
              <div key={i} className="rounded-lg bg-surface-muted p-2">
                <FormularioPagBank
                  inicial={m}
                  textoBotao="Salvar correção"
                  onSalvar={(novo) => {
                    onChange(movimentos.map((x, idx) => (idx === i ? novo : x)));
                    setEditandoIdx(null);
                  }}
                  onCancelar={() => setEditandoIdx(null)}
                />
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-faint">{formatDateBR(m.data)}</span>
                <span className="flex-1 truncate text-muted">{m.descricao}</span>
                <span className={`tabular-nums ${m.valor >= 0 ? "text-accent-500" : "text-danger-500"}`}>
                  {formatCurrencyPrecise(m.valor)}
                </span>
                <button onClick={() => setEditandoIdx(i)} title="Corrigir" className="text-faint hover:text-client-accent transition-colors">
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onChange(movimentos.filter((_, idx) => idx !== i))}
                  title="Remover"
                  className="text-faint hover:text-danger-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Bradesco: pix recebido e saídas ----------

function FormularioBradesco({
  inicial,
  onSalvar,
  onCancelar,
  textoBotao,
}: {
  inicial?: MovimentoBradesco;
  onSalvar: (m: MovimentoBradesco) => void;
  onCancelar?: () => void;
  textoBotao: string;
}) {
  const [data, setData] = useState(inicial?.data ?? "");
  const [tipo, setTipo] = useState<"pix" | "saida">(inicial && inicial.valor < 0 ? "saida" : "pix");
  const [valor, setValor] = useState(inicial ? String(Math.abs(inicial.valor)).replace(".", ",") : "");
  const [fornecedor, setFornecedor] = useState(inicial ? inicial.historico.replace(/^PIX RECEBIDO\s*-?\s*/i, "") : "");

  function salvar() {
    const valorNum = Number(valor.replace(",", "."));
    if (!data || !valorNum || !fornecedor.trim()) return;
    if (tipo === "saida") {
      onSalvar({ data, historico: fornecedor.trim(), valor: -valorNum });
    } else {
      // "PIX RECEBIDO" precisa aparecer no histórico pra bater com o padrão usado no matching
      // de pix (ver conciliarDia) — igual ao texto real de um extrato do Bradesco.
      onSalvar({ data, historico: `PIX RECEBIDO - ${fornecedor.trim()}`, valor: valorNum });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "pix" | "saida")}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        >
          <option value="pix">Pix recebido</option>
          <option value="saida">Saída</option>
        </select>
        <input
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          placeholder="Nome do fornecedor / pagador"
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0,00"
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={salvar}
          className="flex items-center justify-center gap-1.5 self-start rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
        >
          {textoBotao === "Adicionar lançamento" ? <Plus size={12} /> : <Check size={12} />}
          {textoBotao}
        </button>
        {onCancelar && (
          <button onClick={onCancelar} className="text-xs font-medium text-faint hover:text-danger-500 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Stone (MJ Shoes): recebimento de cartão (com taxa já discriminada) e saídas ----------

function FormularioStone({
  inicial,
  onSalvar,
  onCancelar,
  textoBotao,
}: {
  inicial?: MovimentoPagBank;
  onSalvar: (m: MovimentoPagBank) => void;
  onCancelar?: () => void;
  textoBotao: string;
}) {
  const [data, setData] = useState(inicial?.data ?? "");
  const [tipo, setTipo] = useState<"recebimento" | "saida">(inicial && inicial.valor < 0 ? "saida" : "recebimento");
  const [valor, setValor] = useState(inicial ? String(Math.abs(inicial.valor)).replace(".", ",") : "");
  const [taxa, setTaxa] = useState(inicial?.taxa !== undefined ? String(inicial.taxa).replace(".", ",") : "");
  const [descricao, setDescricao] = useState(inicial?.descricao ?? "");

  function salvar() {
    const valorNum = Number(valor.replace(",", "."));
    if (!data || !valorNum) return;
    if (tipo === "saida") {
      onSalvar({ data, descricao: descricao.trim() || "—", valor: -valorNum });
    } else {
      const taxaNum = Number(taxa.replace(",", "."));
      onSalvar({ data, descricao: descricao.trim() || "Recebimento cartão", valor: valorNum, taxa: taxaNum > 0 ? taxaNum : 0 });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "recebimento" | "saida")}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900"
        >
          <option value="recebimento">Recebimento cartão</option>
          <option value="saida">Saída</option>
        </select>
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder={tipo === "saida" ? "Fornecedor / descrição" : "Observação (opcional)"}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={tipo === "saida" ? "Valor (0,00)" : "Valor bruto (0,00)"}
          className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
        />
        {tipo === "recebimento" && (
          <input
            inputMode="decimal"
            value={taxa}
            onChange={(e) => setTaxa(e.target.value)}
            placeholder="Taxa (0,00)"
            title="Taxa da maquineta já discriminada no relatório da Stone pra esse lançamento"
            className="rounded-lg border border-border-subtle bg-surface-muted px-2.5 py-2 text-xs text-brand-900 placeholder:text-faint"
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={salvar}
          className="flex items-center justify-center gap-1.5 self-start rounded-lg border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
        >
          {textoBotao === "Adicionar lançamento" ? <Plus size={12} /> : <Check size={12} />}
          {textoBotao}
        </button>
        {onCancelar && (
          <button onClick={onCancelar} className="text-xs font-medium text-faint hover:text-danger-500 transition-colors">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export function StoneManualTable({ movimentos, onChange }: { movimentos: MovimentoPagBank[]; onChange: (m: MovimentoPagBank[]) => void }) {
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <p className="text-xs text-faint">
        Informe os recebimentos de cartão com o valor bruto e a taxa já discriminada no relatório da Stone, e as saídas.
      </p>

      {editandoIdx === null && (
        <FormularioStone textoBotao="Adicionar lançamento" onSalvar={(m) => onChange([...movimentos, m])} />
      )}

      {movimentos.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-border-subtle p-2">
          {movimentos.map((m, i) =>
            editandoIdx === i ? (
              <div key={i} className="rounded-lg bg-surface-muted p-2">
                <FormularioStone
                  inicial={m}
                  textoBotao="Salvar correção"
                  onSalvar={(novo) => {
                    onChange(movimentos.map((x, idx) => (idx === i ? novo : x)));
                    setEditandoIdx(null);
                  }}
                  onCancelar={() => setEditandoIdx(null)}
                />
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-faint">{formatDateBR(m.data)}</span>
                <span className="flex-1 truncate text-muted">
                  {m.descricao}
                  {m.valor > 0 && m.taxa ? <span className="text-faint"> · taxa {formatCurrencyPrecise(m.taxa)}</span> : null}
                </span>
                <span className={`tabular-nums ${m.valor >= 0 ? "text-accent-500" : "text-danger-500"}`}>
                  {formatCurrencyPrecise(m.valor)}
                </span>
                <button onClick={() => setEditandoIdx(i)} title="Corrigir" className="text-faint hover:text-client-accent transition-colors">
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onChange(movimentos.filter((_, idx) => idx !== i))}
                  title="Remover"
                  className="text-faint hover:text-danger-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function BradescoManualTable({ movimentos, onChange }: { movimentos: MovimentoBradesco[]; onChange: (m: MovimentoBradesco[]) => void }) {
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <p className="text-xs text-faint">Informe os recebimentos via pix e as saídas, com o nome do fornecedor.</p>

      {editandoIdx === null && (
        <FormularioBradesco textoBotao="Adicionar lançamento" onSalvar={(m) => onChange([...movimentos, m])} />
      )}

      {movimentos.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-border-subtle p-2">
          {movimentos.map((m, i) =>
            editandoIdx === i ? (
              <div key={i} className="rounded-lg bg-surface-muted p-2">
                <FormularioBradesco
                  inicial={m}
                  textoBotao="Salvar correção"
                  onSalvar={(novo) => {
                    onChange(movimentos.map((x, idx) => (idx === i ? novo : x)));
                    setEditandoIdx(null);
                  }}
                  onCancelar={() => setEditandoIdx(null)}
                />
              </div>
            ) : (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-faint">{formatDateBR(m.data)}</span>
                <span className="flex-1 truncate text-muted">{m.historico}</span>
                <span className={`tabular-nums ${m.valor >= 0 ? "text-accent-500" : "text-danger-500"}`}>
                  {formatCurrencyPrecise(m.valor)}
                </span>
                <button onClick={() => setEditandoIdx(i)} title="Corrigir" className="text-faint hover:text-client-accent transition-colors">
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => onChange(movimentos.filter((_, idx) => idx !== i))}
                  title="Remover"
                  className="text-faint hover:text-danger-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
