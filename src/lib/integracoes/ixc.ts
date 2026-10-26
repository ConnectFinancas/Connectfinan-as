// Integração com a API do IXC (sistema onde ficam o cadastro de clientes e o Contas a Receber da
// Connect/Connect Ecommerce). Confirmado com o suporte do IXC: autenticação é Basic Auth
// (usuário/senha do próprio sistema) — o OAuth Server e o token do módulo "query-builder"
// (Looker) NÃO se aplicam a essa API. Doc oficial: https://wikiapiprovedor.ixcsoft.com.br/.
//
// Uso típico (exemplo do próprio suporte):
//   GET /webservice/v1/fn_areceber, header "ixcsoft: listar", corpo com qtype/query/oper/page/
//   rp/sortname e, opcionalmente, grid_param (array de filtros extras em JSON-dentro-de-string).

function baseUrl(): string {
  const url = process.env.IXC_BASE_URL;
  if (!url) throw new Error("IXC_BASE_URL não configurada nas variáveis de ambiente do servidor.");
  return url.replace(/\/$/, "");
}

function authHeader(): string {
  const usuario = process.env.IXC_USUARIO;
  const senha = process.env.IXC_SENHA;
  if (!usuario || !senha) {
    throw new Error("IXC_USUARIO/IXC_SENHA não configurados nas variáveis de ambiente do servidor.");
  }
  return "Basic " + Buffer.from(`${usuario}:${senha}`).toString("base64");
}

export type IxcGridFiltro = { TB: string; OP: string; P: string | number };

export type IxcListarParams = {
  qtype?: string;
  query?: string;
  oper?: string;
  page?: string | number;
  rp?: string | number;
  sortname?: string;
  sortorder?: "asc" | "desc";
  gridParam?: IxcGridFiltro[];
};

// Faz uma chamada "listar" num recurso do webservice (ex.: "fn_areceber", "cliente") — monta o
// corpo no formato que o IXC espera (grid_param é o array de filtros, mas vai como STRING com o
// JSON dentro, não como array de verdade — confirmado no exemplo do suporte).
export async function ixcListar<T = Record<string, unknown>>(
  recurso: string,
  params: IxcListarParams = {}
): Promise<{ total: string; registros: T[] }> {
  const body: Record<string, string> = {
    qtype: params.qtype ?? `${recurso}.id`,
    query: params.query ?? "",
    oper: params.oper ?? (params.query ? "=" : ">"),
    page: String(params.page ?? "1"),
    rp: String(params.rp ?? "100"),
    sortname: params.sortname ?? `${recurso}.id`,
    sortorder: params.sortorder ?? "asc",
  };
  if (params.gridParam && params.gridParam.length > 0) {
    body.grid_param = JSON.stringify(params.gridParam);
  }

  const resp = await fetch(`${baseUrl()}/webservice/v1/${recurso}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ixcsoft: "listar",
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const texto = await resp.text();
    throw new Error(`IXC respondeu ${resp.status} em /webservice/v1/${recurso}: ${texto.slice(0, 500)}`);
  }

  const json = await resp.json();
  // O webservice do IXC retorna { type: "success", total: "N", registros: [...] } quando dá
  // certo, ou { type: "error", message: "..." } quando dá errado — mesmo em HTTP 200.
  if (json?.type === "error") {
    throw new Error(`IXC recusou a consulta em ${recurso}: ${json.message ?? JSON.stringify(json)}`);
  }
  return { total: json.total ?? "0", registros: json.registros ?? [] };
}

// Status dos títulos em fn_areceber, conforme o suporte: A=aberto, R=recebido, C=cancelado,
// P=parcialmente recebido.
export type IxcStatusAReceber = "A" | "R" | "C" | "P";

export type IxcTituloAReceber = Record<string, unknown> & {
  id: string;
  id_cliente?: string;
  data_vencimento?: string;
  data_pagamento?: string;
  valor?: string;
  status?: IxcStatusAReceber;
};

// Busca genérica paginada num recurso "listar" do IXC, aplicando os filtros de grid_param e
// trazendo todas as páginas até o total informado pela API.
async function ixcListarTudo<T>(recurso: string, sortname: string, gridParam: IxcGridFiltro[]): Promise<T[]> {
  const registros: T[] = [];
  let page = 1;
  const rp = 500;
  for (;;) {
    const { total, registros: pagina } = await ixcListar<T>(recurso, {
      sortname,
      sortorder: "asc",
      page,
      rp,
      gridParam,
    });
    registros.push(...pagina);
    if (registros.length >= Number(total) || pagina.length === 0) break;
    page += 1;
  }
  return registros;
}

// Lista os IDs (e nome) dos clientes de uma filial — "id_filial": 1 = Connect, 2 = Connect
// Ecommerce (confirmado no cadastro de cliente do IXC, campo "Filial").
export async function ixcListarClientesPorFilial(idFilial: number): Promise<{ id: string; razao: string }[]> {
  const registros = await ixcListarTudo<Record<string, unknown>>("cliente", "cliente.id", [
    { TB: "cliente.id_filial", OP: "=", P: idFilial },
  ]);
  return registros.map((r) => ({ id: String(r.id), razao: String(r.razao ?? r.nome_fantasia ?? r.id) }));
}

// Lista títulos de Contas a Receber de uma lista de clientes, com filtro opcional por status e
// período de vencimento (passado/presente/futuro) — pagina automaticamente até trazer tudo.
export async function ixcListarContasAReceber(opts: {
  idsCliente: string[];
  status?: IxcStatusAReceber[];
  vencimentoDe?: string; // "AAAA-MM-DD"
  vencimentoAte?: string; // "AAAA-MM-DD"
}): Promise<IxcTituloAReceber[]> {
  if (opts.idsCliente.length === 0) return [];
  const gridParam: IxcGridFiltro[] = [{ TB: "fn_areceber.id_cliente", OP: "IN", P: opts.idsCliente.join(",") }];
  if (opts.status && opts.status.length > 0) {
    gridParam.push({ TB: "fn_areceber.status", OP: "IN", P: opts.status.join(",") });
  }
  if (opts.vencimentoDe) gridParam.push({ TB: "fn_areceber.data_vencimento", OP: ">=", P: opts.vencimentoDe });
  if (opts.vencimentoAte) gridParam.push({ TB: "fn_areceber.data_vencimento", OP: "<=", P: opts.vencimentoAte });

  return ixcListarTudo<IxcTituloAReceber>("fn_areceber", "fn_areceber.data_vencimento", gridParam);
}
