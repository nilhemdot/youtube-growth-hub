#!/usr/bin/env node
/** Exchange a callback URL immediately: node scripts/exchange-url.js 'http://127.0.0.1:5050/oauth2callback?code=...' */
const { getTokens, getOAuthConfig } = require('../dist/youtubeAuth');

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/exchange-url.js "<full callback URL>"');
  process.exit(1);
}
const trimmed = input.trim();
let exchangeRedirectUri;
const code = trimmed.includes('code=')
  ? (() => {
      const callbackUrl = new URL(trimmed);
      exchangeRedirectUri = `${callbackUrl.origin}${callbackUrl.pathname}`;
      return callbackUrl.searchParams.get('code');
    })()
  : trimmed;

if (!code) {
  console.error('No code= found in URL');
  process.exit(1);
}

console.log('Using redirect:', exchangeRedirectUri || getOAuthConfig().redirectUri);
console.log('Exchanging code (must be fresh — within ~1 min of sign-in)...\n');
getTokens(code, exchangeRedirectUri)
  .then((t) => {
    console.log('SUCCESS: tokens.json saved');
    console.log('refresh_token:', Boolean(t.refresh_token));
  })
  .catch((e) => {
    const details = e?.response?.data?.error_description || e?.response?.data?.error;
    console.error('FAILED:', details || e.message || e);
    console.error('\nCodes expire in ~1 minute. Run: npm run auth');
    console.error('Sign in again and paste the callback URL immediately.\n');
    process.exit(1);
  });