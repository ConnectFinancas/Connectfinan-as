export function ClientFooter({ clientName }: { clientName: string }) {
  return (
    <footer className="flex items-center justify-between px-5 py-4 lg:px-8 text-xs text-faint">
      <span>© {new Date().getFullYear()} {clientName} · Painel Interno</span>
      <span className="text-accent-500">Connect Finanças · BPO</span>
    </footer>
  );
}
