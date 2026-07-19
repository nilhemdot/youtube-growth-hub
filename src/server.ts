import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getAuthUrl, getTokens, getOAuthConfig } from './youtubeAuth';
import { uploadVideo } from './youtubeUpload';

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

const upload = multer({ dest: 'uploads/' });

app.get('/oauth-setup', (req, res) => {
  const cfg = getOAuthConfig();
  res.send(`
    <h1>OAuth Setup Debug</h1>
    <p><strong>Copy these values into Google Cloud Console exactly.</strong></p>
    <ul>
      <li><b>Client ID:</b> <code>${cfg.clientId}</code></li>
      <li><b>Redirect URI (must match exactly):</b> <code>${cfg.redirectUri}</code></li>
      <li><b>JSON type:</b> ${cfg.clientType}</li>
      <li><b>Secrets file loaded:</b> ${cfg.secretsFound ? 'yes' : 'NO — fix this first'}</li>
      <li><b>Already authenticated:</b> ${cfg.tokenFound ? 'yes' : 'no'}</li>
    </ul>
    <h2>If you see "redirect_uri_mismatch"</h2>
    <ol>
      <li>Create OAuth client as <b>Desktop app</b> (recommended) — no redirect URI field needed.</li>
      <li>OR if Web app: Credentials → your client → <b>Authorized redirect URIs</b> (NOT JavaScript origins) → paste the redirect URI above.</li>
      <li>Download new JSON and replace <code>client_secrets.json</code> — old deleted clients will never work.</li>
      <li>Add your Gmail under OAuth consent screen → <b>Test users</b>.</li>
    </ol>
    <p><a href="/auth">Try authenticate</a> | <a href="/">Home</a></p>
  `);
});

app.get('/', (req, res) => {
  res.send(`
    <h1>YouTube Growth Hub</h1>
    <a href="/oauth-setup">OAuth setup debug</a> · <a href="/auth">Authenticate with YouTube</a><br/><br/>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="video" accept="video/*" required /><br/><br/>
      <input type="text" name="title" placeholder="Video Title" required /><br/><br/>
      <textarea name="description" placeholder="Video Description" required></textarea><br/><br/>
      <input type="text" name="tags" placeholder="Tags (comma separated)" /><br/><br/>
      <button type="submit">Upload Video</button>
    </form>
  `);
});

app.get('/auth', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Use when /auth redirect fails — copy link manually
app.get('/auth-manual', (req, res) => {
  const url = getAuthUrl();
  res.send(`
    <h1>Manual OAuth</h1>
    <p>If this page loads but <code>/auth</code> does not, click below or copy the link.</p>
    <p><a href="${url}" target="_blank" rel="noopener">Open Google sign-in</a></p>
    <p><small>Or run in WSL terminal: <code>npm run auth</code></small></p>
    <textarea style="width:100%;height:120px" readonly>${url}</textarea>
    <p>After sign-in, if callback page fails, copy the URL from the address bar and run <code>npm run auth</code> in WSL.</p>
    <p><a href="/oauth-setup">OAuth debug</a></p>
  `);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send('No code found in the query parameters');
  }
  try {
    await getTokens(code);
    res.send('Successfully authenticated! You can now <a href="/">upload a video</a>.');
  } catch (error: unknown) {
    console.error('Error authenticating:', error);
    const cfg = getOAuthConfig();
    const msg = error instanceof Error ? error.message : String(error);
    res.status(500).send(
      `Authentication failed: ${msg}<br/><br/>` +
      `Registered redirect URI: <code>${cfg.redirectUri}</code><br/>` +
      `<a href="/oauth-setup">OAuth setup debug</a>`
    );
  }
});

app.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No video file uploaded');
  }
  const { title, description, tags } = req.body;
  
  try {
    const result = await uploadVideo(req.file.path, title, description, tags ? tags.split(',') : []);
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    res.send(`Upload successful! Video ID: ${result.id}`);
  } catch (error) {
    console.error('Error uploading video:', error);
    // Clean up uploaded file on failure too
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    res.status(500).send('Video upload failed.');
  }
});

if (require.main === module) {
  app.listen(port, () => {
    const cfg = getOAuthConfig();
    console.log(`Server is running on http://127.0.0.1:${port}`);
    console.log(`OAuth debug: http://127.0.0.1:${port}/oauth-setup`);
    console.log(`Client ID: ${cfg.clientId}`);
    console.log(`Redirect URI: ${cfg.redirectUri}`);
  });
}

export default app;
