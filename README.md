# Connect Finanças

Painel de gestão financeira para BPO financeiro, no estilo Conta Azul: um portfólio de clientes onde cada logo abre o painel financeiro dedicado daquele cliente (DRE, fluxo de caixa, contas a pagar/receber, conciliação bancária e obrigações fiscais).

Protótipo com dados de exemplo — o primeiro cliente ativo é a **M4 Logística** (prep center / logística para e-commerce).

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Estrutura

- `src/app/page.tsx` — portfólio de clientes (hub)
- `src/app/clientes/m4-logistica/` — painel financeiro da M4 Logística (visão geral, DRE, fluxo de caixa, contas a pagar/receber, conciliação, obrigações fiscais, relatórios)
- `src/lib/data/` — dados de exemplo por cliente
- `src/components/` — componentes de UI e gráficos (recharts)

Para adicionar um novo cliente: cadastre-o em `src/lib/data/clients.ts`, crie um arquivo de dados em `src/lib/data/<cliente>.ts` e replique a estrutura de pastas de `src/app/clientes/m4-logistica/` para `src/app/clientes/<slug>/`.
