# Fix "127.0.0.1 refused to connect" (WSL + Windows)

**Cause:** YouTube Growth Hub runs inside **WSL**. Windows `127.0.0.1:5050` does not reach it unless port forwarding is set up.

**Also:** Windows port **5000** = PowerShell Universal. This app uses **5050**.

---

## Option A — Auth without loading any local page (fastest)

You do **not** need `127.0.0.1` to work for OAuth.

### In WSL:

```bash
cd ~/youtube-growth-hub
npm run auth
```

1. Copy the `https://accounts.google.com/...` URL from the terminal
2. Paste into **Windows Chrome address bar** → Enter
3. Sign in (test user) → Allow
4. Browser goes to `http://127.0.0.1:5050/oauth2callback?code=4/0A...`
5. Page shows **"refused to connect"** — **that is OK**
6. Click the **address bar** → Ctrl+A → Ctrl+C (copy the **entire** URL)
7. Paste into the WSL terminal when asked

`tokens.json` is saved. Done.

Print URL only:

```bash
npm run auth:url
```

---

## Option B — Try WSL IP in browser (upload UI)

From **Windows** browser:

```
http://192.168.183.31:5050/oauth-setup
```

(IP may change after reboot — in WSL run `hostname -I`)

If this loads, the server is fine; only localhost forwarding is broken.

---

## Option C — Fix Windows localhost (permanent)

**PowerShell as Administrator** on Windows:

```powershell
cd \\wsl.localhost\nilhem\home\nilhem\youtube-growth-hub\scripts
.\setup-windows-port.ps1
```

Or manually:

```powershell
$ip = (wsl -e hostname -I).Trim().Split(" ")[0]
netsh interface portproxy add v4tov4 listenport=5050 listenaddress=127.0.0.1 connectport=5050 connectaddress=$ip
```

Then test: **http://127.0.0.1:5050/oauth-setup**

Re-run after WSL restart (IP changes).

---

## Option D — WSL mirrored networking (reboot required)

Create `C:\Users\nilhem\.wslconfig`:

```ini
[wsl2]
networkingMode=mirrored
localhostForwarding=true
```

PowerShell Admin: `wsl --shutdown` → reopen WSL → `npm start`

---

## Google Cloud redirect URI

Must include:

```
http://127.0.0.1:5050/oauth2callback
```

(Options B/D use portproxy or mirrored mode so 127.0.0.1 callbacks reach WSL.)