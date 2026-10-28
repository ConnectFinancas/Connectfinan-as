---
name: conciliacao-mj-prime
description: Use sempre que o Ewerton enviar os 4 insumos do fechamento mensal da MJ Prime (prints do extrato Bradesco, relatório de faturamento, print do caixa físico e relatório da maquineta PagBank) pedindo para conciliar/lançar o mês. Automatiza o choque de informações (faturamento x PagBank), a extração dos recebimentos (cartão/espécie/Pix) e das saídas (fornecedores), e o lançamento em src/lib/data/mj-prime.ts.
---

# Conciliação e fechamento mensal — MJ Prime

Processo combinado com o Ewerton em 28/10/2026, pra ele só precisar enviar 4
arquivos todo mês (sem reexplicar o método) e eu já devolver o Contas a Receber
e o Contas a Pagar do mês lançados em `src/lib/data/mj-prime.ts`.

**Importante — isso é a v1 do processo.** O Ewerton ainda vai mandar um exemplo
de cada relatório com a "forma de leitura" explicada. Na primeira vez que um
relatório real chegar, confira se o formato bate com o que este arquivo
descreve abaixo; se divergir, PARE e pergunte antes de lançar — não adivinhe
layout de coluna/relatório novo. Depois de confirmado, atualize este SKILL.md
com o formato real (vira a v2), pra não precisar perguntar de novo nos meses
seguintes.

## Os 4 insumos de cada mês

1. **Print(s) do extrato Bradesco** — conta bancária da empresa. Pode vir em
   várias capturas de tela (rolagem do celular). **Cuidado**: como são prints
   soltos, o rolo da tela não corta exatamente onde o print anterior parou —
   duas capturas adjacentes podem repetir a(s) mesma(s) linha(s) na borda.
   Antes de lançar, DEDUPLICAR por (data + descrição/favorecido + valor) —
   nunca lançar a mesma linha duas vezes só porque apareceu em 2 prints.
2. **Relatório de faturamento** — já vem com o faturamento do mês separado por
   forma de recebimento (Cartão, Espécie/Dinheiro, Pix), no mesmo padrão usado
   pros outros clientes (ver `src/lib/data/mj-shoes.ts`, aba "Fluxo de Caixa").
3. **Print(s) do caixa físico** — saídas pagas em espécie direto do caixa da
   loja (frete, uso e consumo, retiradas, etc.) — mesmo tipo de lançamento que
   "Despesas Caixa Físico" da MJ Shoes.
4. **Relatório da maquineta (PagBank)** — TODAS as vendas em cartão de
   crédito/débito do mês. Os valores aqui já vêm COM o desconto da taxa da
   maquineta aplicado (valor líquido, não o valor bruto da venda).

## Passo 1 — Choque faturamento × PagBank (receita de cartão)

- Somar o total de cartão (crédito + débito) do **relatório de faturamento**.
- Somar o total líquido do **relatório da maquineta (PagBank)**.
- A diferença entre os dois é esperada e normal — são as taxas de maquineta
  (desconto já embutido no PagBank). Calcular essa diferença e registrar como
  a taxa de maquineta do mês (mesma lógica das linhas "Taxa Maquineta" que já
  existem em outros clientes, ex. `src/lib/data/mj-shoes.ts`).
- Se a diferença for muito maior do que uma taxa de maquineta plausível (ex.
  mais de uns 5-6% do valor bruto, ajustar esse limiar quando tivermos dados
  reais), ou se o PagBank tiver uma venda que não aparece no faturamento (ou
  vice-versa), NÃO seguir sozinho — listar a(s) divergência(s) específica(s)
  pro Ewerton confirmar antes de lançar.
- O valor de receita de cartão a lançar em `seedReceivables` é o do relatório
  de faturamento (valor bruto da venda); a taxa de maquineta vai pra
  `seedPayables` como despesa financeira (categoria "Taxa Maquineta" ou
  equivalente já usada no plano de contas do cliente).

## Passo 2 — Receita em Espécie e Pix (direto do faturamento)

- Esses dois valores **não precisam de conciliação** — o relatório de
  faturamento já vem com eles identificados e corretos. Migrar direto pro
  `seedReceivables` (mesmo padrão dos outros clientes: `cliente: "Clientes da
  Loja"`, `categoria/classificacao` de faturamento, `formaRecebimento:
  "Dinheiro"` / `"Pix"`, `status: "recebido"`, `recebimento` = mesma data do
  `vencimento`).

## Passo 3 — Levantar todas as saídas (fornecedores e despesas)

- As saídas do mês aparecem espalhadas em **3** fontes: extrato Bradesco,
  print do caixa físico e relatório da maquineta PagBank (ela também mostra
  descontos/saídas da própria conta PagBank, não só entradas).
- Juntar as 3 fontes numa lista única de saídas, aplicando a deduplicação do
  extrato Bradesco (ver nota do item 1) e removendo qualquer saída que já foi
  contabilizada no Passo 1 (taxa de maquineta) pra não contar duas vezes.
- Para cada saída, identificar o favorecido (nome de quem recebeu o
  pagamento).

## Passo 4 — Classificar automaticamente pelos padrões já conhecidos

- `src/lib/data/mj-prime.ts` já tem um plano de contas e uma lista de
  fornecedores recorrentes (projeção Set-Dez/2026, baseada na média de
  mar/mai/jun/jul — ver `seedPayables` atual e `seedCategoriasPagar`). Usar
  essa lista como dicionário favorecido → categoria/classificação:
  - Ex.: NEOENERGIA PERNAMBUCO → Energia Elétrica / DESPESAS ADMINISTRATIVAS
  - BRADESCO (tarifa) → Tarifas Bancárias / DESPESAS FINANCEIRAS
  - PAGSEGURO → Seguro Conta ou Seguro Cartão Protegido / DESPESAS FINANCEIRAS
  - COMPESA → Água e Esgoto / DESPESAS ADMINISTRATIVAS
  - BORA TELECOM / CENTRALNET / SOUSA LOPES-MULTNET → Internet / DESPESAS
    ADMINISTRATIVAS
  - Nomes de pessoa física recorrentes → Salário / DESPESAS C/ PESSOAS
  - (a lista completa de fornecedores já lançados está em `seedPayables` —
    conferir lá antes de perguntar)
- Pra um favorecido que já existe no plano de contas: classificar
  automaticamente sem perguntar.
- Pra um favorecido NOVO (nunca visto antes nesse cliente): classificar pelo
  melhor palpite (nome/contexto do pagamento) mas **marcar a descrição** do
  lançamento avisando que é novo e sem confirmação — mesmo padrão usado nos
  comentários de `mj-shoes.ts` ("confirme", "vale conferir") — e resumir esses
  itens novos pro Ewerton no final, sem bloquear o resto do lançamento por
  eles.
- As 3 empresas do grupo (MJ PRIME, BORBA, C E J SERVIÇOS) continuam sendo
  identificadas no início da `descricao` de cada lançamento, igual já é feito
  hoje (ex. `"[C E J SERVIÇOS] ..."`).

## Passo 5 — Lançar no arquivo

- Seguir exatamente o mesmo processo usado pros outros clientes (Store Pluss,
  MJ Shoes, Connect Ecommerce): montar os objetos `seedReceivables`/
  `seedPayables` com os próximos ids livres (continuar a numeração existente,
  não reaproveitar ids), inserir em `src/lib/data/mj-prime.ts`.
- Se o mês importado for o PRIMEIRO mês real (ainda é o caso hoje — MJ Prime
  só tem projeção Set-Dez/2026, nenhum mês real lançado ainda): depois de
  importar os dados reais desse mês, avaliar se as linhas de projeção do
  mesmo mês (que vieram da média mar-jul) ficaram duplicadas e, se sim, acho
  que devem ser removidas — mas CONFIRME com o Ewerton antes de remover
  qualquer projeção (mesmo tratamento que foi dado em `mj-shoes.ts` quando
  setembro real chegou).
- Bumpar `dataVersion` com um comentário explicando o que mudou (padrão do
  projeto — ver qualquer um dos outros arquivos em `src/lib/data/` pra
  exemplo de formato do comentário).
- Depois de editar: rodar `npx tsc --noEmit`, `npx eslint
  src/lib/data/mj-prime.ts` e `npm run build`. Só commitar/dar push se o
  Ewerton pedir explicitamente (ele costuma pedir — mas não assumir).

## No final, sempre resumir pro Ewerton

- Receita do mês por forma de recebimento (cartão/espécie/Pix) e o total.
- Taxa de maquineta do mês (diferença faturamento × PagBank) e se bateu dentro
  do esperado.
- Total de saídas lançadas, e lista dos favorecidos NOVOS/sem confirmação que
  precisam de uma olhada dele.
- Qualquer coisa que não bateu ou pareceu duplicada entre os prints.
