// Integração OAuth com o IXC (sistema onde ficam o cadastro de clientes e o Contas a Receber da
// Connect/Connect Ecommerce). As URLs exatas de autorização/token ainda não foram confirmadas com
// o suporte do IXC — os valores abaixo seguem o padrão OAuth 2.0 (RFC 6749) e são sobrescrevíveis
// por variável de ambiente assim que a documentação da instância confirmar os caminhos certos.

export const IXC_REDIRECT_URI = "https://connectfinan-as.vercel.app/api/integracoes/ixc/callback";

function baseUrl(): string {
  const url = process.env.IXC_BASE_URL;
  if (!url) throw new Error("IXC_BASE_URL não configurada nas variáveis de ambiente do servidor.");
  return url.replace(/\/$/, "");
}

export function ixcAuthorizeUrl(state: string): string {
  const path = process.env.IXC_AUTHORIZE_PATH || "/oauth/authorize";
  const clientId = process.env.IXC_CLIENT_ID;
  if (!clientId) throw new Error("IXC_CLIENT_ID não configurado nas variáveis de ambiente do servidor.");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: IXC_REDIRECT_URI,
    response_type: "code",
    state,
  });
  return `${baseUrl()}${path}?${params.toString()}`;
}

export async function ixcTrocarCodigoPorToken(code: string) {
  const path = process.env.IXC_TOKEN_PATH || "/oauth/token";
  const clientId = process.env.IXC_CLIENT_ID;
  const clientSecret = process.env.IXC_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("IXC_CLIENT_ID/IXC_CLIENT_SECRET não configurados nas variáveis de ambiente do servidor.");
  }
  const resp = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: IXC_REDIRECT_URI,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!resp.ok) {
    const texto = await resp.text();
    throw new Error(`IXC recusou a troca do código por token (${resp.status}): ${texto}`);
  }
  return (await resp.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
}
