"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Eye, EyeOff, Lock, Mail, ShieldCheck, TrendingUp } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error || !data.user) {
      setErro("E-mail ou senha incorretos.");
      setEnviando(false);
      return;
    }

    // Histórico de acesso — falha silenciosa aqui não deve travar o login.
    await supabase.from("audit_log").insert({
      profile_id: data.user.id,
      email: data.user.email,
      acao: "login",
    });

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel de marca — escondido em telas pequenas */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-brand-900 px-12 py-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--brand-400) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent-500) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 20.5V9.5L15 15L21 9.5V20.5"
                stroke="white"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight leading-none">
            Ricavi <span className="font-light text-white/70">Finanças</span>
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Cada cliente,
            <br />
            um painel dedicado.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Contas a pagar e a receber, DRE, fluxo de caixa e conciliação bancária — tudo organizado por cliente, num
            único lugar, pra você e sua equipe trabalharem com clareza.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <BarChart3 size={15} />
              </div>
              <span className="text-xs text-white/70">Visão financeira em tempo real, por cliente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <TrendingUp size={15} />
              </div>
              <span className="text-xs text-white/70">Fluxo de caixa e DRE sempre atualizados</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <ShieldCheck size={15} />
              </div>
              <span className="text-xs text-white/70">Acesso restrito por colaborador e por cliente</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/40">© {new Date().getFullYear()} Ricavi Finanças</p>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex justify-center lg:hidden">
            <Logo />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-brand-900">Entrar</h2>
          <p className="mt-1.5 text-sm text-slate-500">Acesse o painel com seu e-mail e senha.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            {erro && (
              <div className="rounded-lg border border-danger-200 bg-danger-100 px-3 py-2 text-xs font-medium text-danger-500">
                {erro}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">E-mail</label>
              <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2.5 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/15 transition-colors">
                <Mail size={15} className="shrink-0 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com.br"
                  className="w-full bg-transparent text-sm text-brand-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">Senha</label>
                <button type="button" className="text-xs font-medium text-brand-500 hover:text-brand-600">
                  Esqueci minha senha
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2.5 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/15 transition-colors">
                <Lock size={15} className="shrink-0 text-slate-400" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-brand-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="shrink-0 text-slate-400 hover:text-slate-600"
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
            >
              Entrar
              <ArrowRight size={15} />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Precisa de acesso? Fale com quem administra sua conta no Ricavi Finanças.
          </p>
        </div>
      </div>
    </div>
  );
}
