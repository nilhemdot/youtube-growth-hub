#!/usr/bin/env node
/**
 * Manual OAuth when http://127.0.0.1:5050 won't load in Windows browser.
 * 1. Run: npm run auth
 * 2. Open the printed URL in your browser (any machine)
 * 3. After Google sign-in, copy the FULL URL from the address bar
 *    (page may error — the ?code=... is what we need)
 * 4. Paste it here
 */
const readline = require('readline');
const { getAuthUrl, getTokens } = require('../dist/youtubeAuth');

const url = getAuthUrl();

console.log('\n=== 0x1codex YouTube OAuth (manual) ===\n');
console.log('Step 1: Open this URL in your browser:\n');
console.log(url);
console.log('\nStep 2: Sign in with your TEST USER Gmail and allow access.');
console.log('Step 3: After redirect, copy the ENTIRE address bar URL.');
console.log('        (If the page says "can\'t connect", that is OK — copy the URL anyway.)\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste the full redirect URL here: ', async (input) => {
  rl.close();
  try {
    const trimmed = input.trim();
    let exchangeRedirectUri;
    let code;
    if (trimmed.includes('code=')) {
      const callbackUrl = new URL(trimmed);
      exchangeRedirectUri = `${callbackUrl.origin}${callbackUrl.pathname}`;
      code = callbackUrl.searchParams.get('code');
    } else {
      code = trimmed;
    }
    if (!code) {
      console.error('No authorization code found. Paste the full URL with ?code=...');
      process.exit(1);
    }
    await getTokens(code, exchangeRedirectUri);
    console.log('\nSuccess! tokens.json saved. You can upload videos now.');
    console.log('Run: npm start  →  http://127.0.0.1:5050/\n');
  } catch (err) {
    const details = err?.response?.data?.error_description || err?.response?.data?.error;
    console.error('Auth failed:', details || err.message || err);
    process.exit(1);
  }
});