import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PROJECT_ROOT = path.join(__dirname, '..');
const CLIENT_SECRET_FILE = path.join(
  PROJECT_ROOT,
  process.env.CLIENT_SECRETS_PATH || 'client_secrets.json'
);
const TOKEN_FILE = path.join(PROJECT_ROOT, process.env.TOKEN_PATH || 'tokens.json');
let credentials: any;
try {
  const content = fs.readFileSync(CLIENT_SECRET_FILE, 'utf8');
  const parsed = JSON.parse(content);
  credentials = parsed.installed || parsed.web;
  credentials._type = parsed.installed ? 'installed/desktop' : 'web';
} catch (error) {
  console.warn('Could not read client_secrets.json. Please make sure it exists in the root directory.');
}

const clientId = credentials?.client_id || process.env.CLIENT_ID;
const clientSecret = credentials?.client_secret || process.env.CLIENT_SECRET;
// Google loopback: 127.0.0.1 works more reliably than localhost for OAuth
const redirectUri =
  process.env.REDIRECT_URI ||
  credentials?.redirect_uris?.[0] ||
  'http://127.0.0.1:5050/oauth2callback';

export const getOAuthConfig = () => ({
  clientId: clientId || '(missing — replace client_secrets.json)',
  clientType: credentials?._type || 'unknown',
  redirectUri,
  secretsFile: CLIENT_SECRET_FILE,
  secretsFound: Boolean(credentials),
  tokenFound: fs.existsSync(TOKEN_FILE),
});

export const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
};

export const getTokens = async (code: string, exchangeRedirectUri?: string) => {
  const redirectForExchange = exchangeRedirectUri || redirectUri;
  const { tokens } = await oauth2Client.getToken({
    code,
    redirect_uri: redirectForExchange,
  });
  oauth2Client.setCredentials(tokens);
  
  // Optionally save tokens to a file or database
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens));
  return tokens;
};

// Try loading existing tokens
try {
  const tokensContent = fs.readFileSync(TOKEN_FILE, 'utf8');
  const tokens = JSON.parse(tokensContent);
  oauth2Client.setCredentials(tokens);
} catch (error) {
  // Ignore if tokens file doesn't exist
}
