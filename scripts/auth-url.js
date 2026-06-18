#!/usr/bin/env node
/** Print OAuth URL only — no server needed. */
const { getAuthUrl, getOAuthConfig } = require('../dist/youtubeAuth');
const cfg = getOAuthConfig();
console.log('\n=== Google sign-in URL (paste into Windows Chrome address bar) ===\n');
console.log(getAuthUrl());
console.log('\nRedirect URI:', cfg.redirectUri);
console.log('\nAfter sign-in, copy the FULL address bar URL (even if page says refused).');
console.log('Then run: npm run auth\n');