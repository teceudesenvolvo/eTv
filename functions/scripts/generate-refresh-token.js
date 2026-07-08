const { google } = require('googleapis');
const readline = require('readline');

const DEFAULT_REDIRECT_URI = 'http://localhost';
const REDIRECT_URI = process.env.REDIRECT_URI || DEFAULT_REDIRECT_URI;
const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube';

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function main() {
  const clientId = process.env.CLIENT_ID || await ask('CLIENT_ID: ');
  const clientSecret = process.env.CLIENT_SECRET || await ask('CLIENT_SECRET: ');

  if (!clientId || !clientSecret) {
    console.error('CLIENT_ID and CLIENT_SECRET are required.');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [YOUTUBE_SCOPE],
  });

  console.log('\nUsando redirect URI:', REDIRECT_URI);
  console.log('\nSe você receber redirect_uri_mismatch, adicione este URI à lista de URIs autorizados no OAuth client do Google Cloud Console.');
  console.log('\n1) Abra esta URL no navegador:');
  console.log(authUrl);
  console.log('\n2) Após autorizar, cole o código retornado abaixo.');

  let code = await ask('Authorization code or full redirect URL: ');

  if (!code) {
    console.error('Authorization code is required.');
    process.exit(1);
  }

  const codeMatch = code.match(/[?&]code=([^&]+)/);
  if (codeMatch) {
    code = decodeURIComponent(codeMatch[1]);
    console.log('Código extraído da URL de redirecionamento.');
  }

  let tokens;
  try {
    ({ tokens } = await oauth2Client.getToken(code));
  } catch (err) {
    console.error('\nFalha ao trocar o authorization code por tokens.');
    if (err.response && err.response.data) {
      console.error('Google error:', JSON.stringify(err.response.data));
    } else {
      console.error('Erro:', err.message || err);
    }
    console.error('\nIsso normalmente acontece se o código de autorização expirou, foi usado antes, ou se o redirect URI está incorreto. Gere um novo código e tente novamente.');
    process.exit(1);
  }

  console.log('\nTokens recebidos:');
  console.log('access_token:', tokens.access_token || '(nenhum)');
  console.log('refresh_token:', tokens.refresh_token || '(nenhum)');
  console.log('expiry_date:', tokens.expiry_date || '(nenhum)');

  if (!tokens.refresh_token) {
    console.warn('\nATENÇÃO: o Google pode não retornar refresh_token se o app já tiver sido autorizado anteriormente sem prompt=consent.');
    console.warn('Revogue o acesso do app nas configurações da sua conta Google e execute novamente com prompt=consent.');
  }

  console.log('\nUse o refresh_token acima como YOUTUBE_REFRESH_TOKEN no Firebase.');
}

main().catch((err) => {
  console.error('\nErro:', err.message || err);
  process.exit(1);
});
