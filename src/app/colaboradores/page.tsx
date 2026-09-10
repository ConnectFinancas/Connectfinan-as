"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { clients } from "@/lib/data/clients";

type Role = "admin" | "colaborador" | "cliente";

type ProfileRow = {
  id: string;
  email: string;
  nome: string;
  role: Role;
  client_slug: string | null;
  created_at: string;
};

type AuditRow = {
  id: number;
  profile_id: string | null;
  email: string;
  nome: string | null;
  acao: string;
  client_slug: string | null;
  detalhes: string | null;
  created_at: string;
};

const ROTULO_PAPEL: Record<Role, string> = { admin: "Administrador", colaborador: "Colaborador", cliente: "Cliente" };
const COR_PAPEL: Record<Role, string> = {
  admin: "bg-brand-800/10 text-brand-700",
  colaborador: "bg-info-100 text-info-500",
  cliente: "bg-accent-100 text-accent-600",
};

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function EditarColaboradorModal({
  profile,
  clientesAtuais,
  onClose,
  onSaved,
}: {
  profile: ProfileRow;
  clientesAtuais: string[];
  onClose: () => void;
  onSaved: (mensagem: string) => void;
}) {
  const [role, setRole] = useState<Role>(profile.role);
  const [clientSlug, setClientSlug] = useState(profile.client_slug ?? "");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set(clientesAtuais));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const clientesAtivos = clients.filter((c) => c.status === "ativo");
  const clientesParaColaborador = clientesAtivos;
  const clientesParaCliente = clientesAtivos.filter((c) => c.tipo !== "tarefas");

  function alternar(slug: string) {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(slug)) novo.delete(slug);
      else novo.add(slug);
      return novo;
    });
  }

  async function handleSalvar() {
    if (role === "cliente" && !clientSlug) {
      setErro("Selecione qual cliente esse login representa.");
      return;
    }
    setSalvando(true);
    setErro("");

    const supabase = createClient();
    const {
      data: { user: eu },
    } = await supabase.auth.getUser();

    const { error: erroUpdate } = await supabase
      .from("profiles")
      .update({ role, client_slug: role === "cliente" ? clientSlug : null })
      .eq("id", profile.id);

    if (erroUpdate) {
      setErro("Não consegui salvar. Tenta de novo.");
      setSalvando(false);
      return;
    }

    if (role === "colaborador") {
      const atuaisSet = new Set(clientesAtuais);
      const adicionar = [...selecionados].filter((s) => !atuaisSet.has(s));
      const remover = clientesAtuais.filter((s) => !selecionados.has(s));

      if (adicionar.length) {
        await supabase.from("colaborador_clientes").insert(adicionar.map((client_slug) => ({ colaborador_id: profile.id, client_slug })));
      }
      if (remover.length) {
        await supabase.from("colaborador_clientes").delete().eq("colaborador_id", profile.id).in("client_slug", remover);
      }
    } else if (clientesAtuais.length) {
      // Deixou de ser colaborador — as permissões antigas não fazem mais sentido.
      await supabase.from("colaborador_clientes").delete().eq("colaborador_id", profile.id);
    }

    if (eu) {
      await supabase.from("audit_log").insert({
        profile_id: eu.id,
        email: eu.email,
        acao: "editou_colaborador",
        detalhes: `Atualizou acesso de ${profile.nome} (${profile.email})`,
      });
    }

    setSalvando(false);
    onSaved(`Acesso de ${profile.nome} atualizado.`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10 sm:pt-16" onClick={onClose}>
      <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-900">Editar acesso — {profile.nome}</h2>
          <button onClick={onClose} className="text-faint hover:text-brand-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Papel</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
            >
              <option value="admin">Administrador (acesso total)</option>
              <option value="colaborador">Colaborador (só os clientes selecionados)</option>
              <option value="cliente">Cliente (só o próprio painel)</option>
            </select>
          </div>

          {role === "cliente" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Qual cliente esse login representa</label>
              <select
                value={clientSlug}
                onChange={(e) => setClientSlug(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-sm text-brand-900"
              >
                <option value="">Selecione…</option>
                {clientesParaCliente.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === "colaborador" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">Clientes que esse colaborador pode ver</label>
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-border-subtle p-2">
                {clientesParaColaborador.map((c) => (
                  <label key={c.slug} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-brand-900 hover:bg-surface-muted">
                    <input type="checkbox" checked={selecionados.has(c.slug)} onChange={() => alternar(c.slug)} />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {erro && <p className="text-xs font-medium text-danger-500">{erro}</p>}

          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="mt-1 rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ColaboradoresPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [permissoes, setPermissoes] = useState<Record<string, string[]>>({});
  const [auditLog, setAuditLog] = useState<AuditRow[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState<ProfileRow | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    const supabase = createClient();
    const [{ data: profs }, { data: perms }, { data: audit }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: true }),
      supabase.from("colaborador_clientes").select("*"),
      supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(60),
    ]);

    setProfiles((profs as ProfileRow[]) ?? []);
    const mapa: Record<string, string[]> = {};
    ((perms as { colaborador_id: string; client_slug: string }[]) ?? []).forEach((p) => {
      (mapa[p.colaborador_id] ??= []).push(p.client_slug);
    });
    setPermissoes(mapa);
    setAuditLog((audit as AuditRow[]) ?? []);
    setCarregando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, []);

  async function handleRemoverAcesso(profile: ProfileRow) {
    if (!confirm(`Remover todo o acesso de ${profile.nome}? O login continua existindo, só perde a visão dos clientes.`)) return;

    const supabase = createClient();
    if (profile.role === "colaborador") {
      await supabase.from("colaborador_clientes").delete().eq("colaborador_id", profile.id);
    } else if (profile.role === "cliente") {
      await supabase.from("profiles").update({ client_slug: null }).eq("id", profile.id);
    }

    const {
      data: { user: eu },
    } = await supabase.auth.getUser();
    if (eu) {
      await supabase
        .from("audit_log")
        .insert({ profile_id: eu.id, email: eu.email, acao: "removeu_acesso", detalhes: `Removeu acesso de ${profile.nome} (${profile.email})` });
    }

    setMensagem(`Acesso de ${profile.nome} removido.`);
    carregar();
  }

  function ultimoAcesso(profileId: string) {
    const login = auditLog.find((a) => a.profile_id === profileId && a.acao === "login");
    return login ? formatarDataHora(login.created_at) : "Nunca acessou";
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-900 transition-colors">
            <ArrowLeft size={15} />
            Portfólio de Clientes
          </Link>
          <button
            onClick={carregar}
            className="flex items-center gap-1.5 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-surface-muted transition-colors"
          >
            <RefreshCw size={13} />
            Atualizar lista
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">Colaboradores e Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">Quem tem acesso ao sistema, o que cada um pode ver, e o histórico de acessos.</p>
        </div>

        {mensagem && (
          <div className="mb-4 rounded-lg border border-accent-200 bg-accent-100 px-3 py-2 text-xs font-medium text-accent-600">{mensagem}</div>
        )}

        <div className="card mb-8 p-5">
          <h2 className="text-sm font-semibold text-brand-900">Como cadastrar um novo colaborador ou cliente</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            Ainda não dá pra criar o login direto por aqui — falta uma chave de servidor que precisa ser configurada com cuidado
            (fica só nas variáveis de ambiente da Vercel, nunca no código). Por enquanto, cadastre assim:
          </p>
          <ol className="mt-2.5 flex list-decimal flex-col gap-1 pl-4 text-xs leading-relaxed text-slate-500">
            <li>No painel do Supabase, vá em <strong>Authentication → Users → Add user</strong>.</li>
            <li>Preencha e-mail e uma senha temporária (a pessoa pode trocar depois).</li>
            <li>
              Em <strong>User Metadata</strong>, cole um JSON assim (troque o nome):
              <br />
              Colaborador: <code className="rounded bg-surface-muted px-1 py-0.5">{`{"nome": "Fulano", "role": "colaborador"}`}</code>
              <br />
              Cliente: <code className="rounded bg-surface-muted px-1 py-0.5">{`{"nome": "MJ Prime", "role": "cliente", "client_slug": "mj-prime"}`}</code>
            </li>
            <li>Volte aqui, clique em &ldquo;Atualizar lista&rdquo; e depois em &ldquo;Editar&rdquo; pra escolher quais clientes esse colaborador vê.</li>
          </ol>
        </div>

        <div className="card mb-8 overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-xs text-slate-400">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Papel</th>
                <th className="px-4 py-3 font-medium">Acesso</th>
                <th className="px-4 py-3 font-medium">Último acesso</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 font-medium text-brand-900">{p.nome}</td>
                  <td className="px-4 py-3 text-slate-500">{p.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${COR_PAPEL[p.role]}`}>{ROTULO_PAPEL[p.role]}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {p.role === "admin" && "Todos os clientes"}
                    {p.role === "cliente" && (p.client_slug ? clients.find((c) => c.slug === p.client_slug)?.name ?? p.client_slug : "—")}
                    {p.role === "colaborador" && `${(permissoes[p.id] ?? []).length} cliente(s)`}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{ultimoAcesso(p.id)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditando(p)} title="Editar acesso" className="text-slate-400 hover:text-brand-700 transition-colors">
                        <Pencil size={14} />
                      </button>
                      {p.role !== "admin" && (
                        <button onClick={() => handleRemoverAcesso(p)} title="Remover acesso" className="text-slate-400 hover:text-danger-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!carregando && profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    Nenhum colaborador cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-brand-900">Histórico de movimentações</h2>
          <div className="mt-3 flex flex-col divide-y divide-border-subtle">
            {auditLog.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 text-xs">
                <span className="text-slate-600">
                  <strong className="text-brand-900">{a.nome || a.email}</strong> — {a.detalhes || a.acao}
                </span>
                <span className="shrink-0 text-slate-400">{formatarDataHora(a.created_at)}</span>
              </div>
            ))}
            {auditLog.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Ainda sem movimentações registradas.</p>}
          </div>
        </div>
      </main>

      {editando && (
        <EditarColaboradorModal
          profile={editando}
          clientesAtuais={permissoes[editando.id] ?? []}
          onClose={() => setEditando(null)}
          onSaved={(msg) => {
            setEditando(null);
            setMensagem(msg);
            carregar();
          }}
        />
      )}
    </div>
  );
}
