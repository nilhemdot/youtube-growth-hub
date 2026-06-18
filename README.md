# YouTube Growth Hub
Node.js/TypeScript app for YouTube upload automation and related workflow tooling.

## OAuth setup and `invalid_grant` fix
If OAuth token exchange fails with `invalid_grant`, the most common cause is a redirect URI mismatch between:
- the URI used to generate the Google auth URL,
- the URI included in the callback URL after consent,
- and the URI used during token exchange.

This project now fixes that by deriving the token exchange redirect URI from the callback URL you paste into:
- `npm run auth` (`scripts/auth-cli.js`)
- `npm run auth:exchange` (`scripts/exchange-url.js`)

The exchange layer (`src/youtubeAuth.ts`) accepts an explicit redirect URI for code exchange and falls back to configured `REDIRECT_URI` when one is not provided.

## Auth workflow
1. Run `npm run auth`
2. Open the printed Google OAuth URL
3. Complete consent
4. Paste the full callback URL immediately
5. `tokens.json` is saved on success

If auth still fails, the scripts now print provider-level error details (`error_description`/`error`) to speed up debugging.
