# OAuth Setup — Fix redirect_uri_mismatch

## Root cause (your situation)

1. **`client_secrets.json` still points at a deleted OAuth client** — the file must be replaced after every new client.
2. **Redirect URI must match character-for-character** — including `127.0.0.1` vs `localhost`, port, path, no trailing slash.
3. **Web vs Desktop client** — wrong type = redirect URI fields in the wrong place.

---

## Recommended fix: Desktop app (easiest for localhost)

### 1. Google Cloud Console

Project: `youtube-growth-hub-499807` (or your new project)

**Enable API:** [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)

**Consent screen:** [Audience](https://console.cloud.google.com/apis/credentials/consent)
- User type: **External**
- Status: **Testing**
- **Test users:** add your @0x1codex Gmail

**Create credential:** [Credentials](https://console.cloud.google.com/apis/credentials) → **Create credentials** → **OAuth client ID**

| Field | Value |
|-------|--------|
| Application type | **Desktop app** |
| Name | `0x1codex Uploader` |

→ **Create** → **Download JSON**

Desktop apps do **not** ask for redirect URIs in the console — Google allows loopback automatically.

### 2. Install JSON in WSL

```bash
cp "/mnt/c/Users/nilhem/Downloads/client_secret_XXXXX.json" \
   ~/youtube-growth-hub/client_secrets.json
chmod 600 ~/youtube-growth-hub/client_secrets.json
```

### 3. Restart server

```bash
pkill -f "youtube-growth-hub/dist/server.js"
cd ~/youtube-growth-hub && npm run build && npm start
```

### 4. Verify before auth

Open in browser:

**http://127.0.0.1:5050/oauth-setup**

Confirm:
- Secrets file loaded: **yes**
- Redirect URI: **`http://127.0.0.1:5050/oauth2callback`**
- Client ID matches the **new** client in Google Console (not the old deleted one)

### 5. Authenticate

**http://127.0.0.1:5050/auth**

Use the **test user** Gmail. Click Advanced → Go to app (unsafe) if prompted.

---

## Alternative: Web application

Only if you prefer Web client:

1. Create **Web application** OAuth client
2. Under **Authorized redirect URIs** (NOT "JavaScript origins"), add exactly:
   ```
   http://127.0.0.1:5050/oauth2callback
   ```
3. Optionally also add:
   ```
   http://localhost:5050/oauth2callback
   ```
4. Download JSON → replace `client_secrets.json`

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| URI in **JavaScript origins** | Move to **Authorized redirect URIs** |
| Trailing slash `/oauth2callback/` | Remove trailing slash |
| `https://` instead of `http://` | Use `http://` for local dev |
| Old JSON after deleting client | Download fresh JSON |
| Wrong Google account at login | Use email listed under Test users |
| Using `192.168.x.x` in redirect URI | Don't — use `127.0.0.1` only |

---

## After success

`tokens.json` appears in project root. Upload at http://127.0.0.1:5050/