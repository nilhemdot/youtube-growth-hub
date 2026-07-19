import fs from 'fs';

jest.mock('../../src/youtubeAuth', () => ({
  getAuthUrl: jest.fn(),
  getTokens: jest.fn(),
  getOAuthConfig: jest.fn(),
}));

jest.mock('../../src/youtubeUpload', () => ({
  uploadVideo: jest.fn(),
}));

import { getAuthUrl, getTokens, getOAuthConfig } from '../../src/youtubeAuth';
import { uploadVideo } from '../../src/youtubeUpload';
import app from '../../src/server';

const mockedGetAuthUrl = getAuthUrl as jest.Mock;
const mockedGetTokens = getTokens as jest.Mock;
const mockedGetOAuthConfig = getOAuthConfig as jest.Mock;
const mockedUploadVideo = uploadVideo as jest.Mock;

const DEFAULT_CFG = {
  clientId: 'client-123',
  clientType: 'installed/desktop',
  redirectUri: 'http://127.0.0.1:5050/oauth2callback',
  secretsFile: '/tmp/client_secrets.json',
  secretsFound: true,
  tokenFound: false,
};

/**
 * Route handlers are invoked directly (bypassing an actual HTTP/socket
 * round-trip) by pulling them off the Express router stack. This keeps the
 * tests true unit tests of the handler logic in src/server.ts, independent
 * of Express's own routing/dispatch machinery and of any real network I/O.
 */
function getRouteHandlers(method: 'get' | 'post', routePath: string): Function[] {
  const router = (app as any)._router;
  const layer = router.stack.find(
    (l: any) => l.route && l.route.path === routePath && l.route.methods[method]
  );
  if (!layer) {
    throw new Error(`No route registered for ${method.toUpperCase()} ${routePath}`);
  }
  return layer.route.stack.map((s: any) => s.handle);
}

function getHandler(method: 'get' | 'post', routePath: string): Function {
  const handlers = getRouteHandlers(method, routePath);
  return handlers[handlers.length - 1];
}

function createMockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
}

describe('server routes', () => {
  beforeEach(() => {
    mockedGetOAuthConfig.mockReturnValue(DEFAULT_CFG);
    mockedGetAuthUrl.mockReturnValue('https://accounts.google.com/o/oauth2/v2/auth?mock=1');
  });

  describe('GET /', () => {
    it('renders the upload form with expected fields', () => {
      const handler = getHandler('get', '/');
      const res = createMockRes();

      handler({} as any, res);

      expect(res.send).toHaveBeenCalledTimes(1);
      const body = res.send.mock.calls[0][0] as string;
      expect(body).toContain('YouTube Growth Hub');
      expect(body).toContain('action="/upload"');
      expect(body).toContain('name="video"');
      expect(body).toContain('name="title"');
      expect(body).toContain('name="description"');
      expect(body).toContain('name="tags"');
    });
  });

  describe('GET /oauth-setup', () => {
    it('renders OAuth debug info using getOAuthConfig()', () => {
      const handler = getHandler('get', '/oauth-setup');
      const res = createMockRes();

      handler({} as any, res);

      expect(mockedGetOAuthConfig).toHaveBeenCalled();
      const body = res.send.mock.calls[0][0] as string;
      expect(body).toContain(DEFAULT_CFG.clientId);
      expect(body).toContain(DEFAULT_CFG.redirectUri);
      expect(body).toContain('yes'); // secretsFound
    });

    it('flags a missing secrets file', () => {
      mockedGetOAuthConfig.mockReturnValue({ ...DEFAULT_CFG, secretsFound: false });
      const handler = getHandler('get', '/oauth-setup');
      const res = createMockRes();

      handler({} as any, res);

      const body = res.send.mock.calls[0][0] as string;
      expect(body).toContain('NO — fix this first');
    });
  });

  describe('GET /auth', () => {
    it('redirects to the URL returned by getAuthUrl()', () => {
      const handler = getHandler('get', '/auth');
      const res = createMockRes();

      handler({} as any, res);

      expect(mockedGetAuthUrl).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        'https://accounts.google.com/o/oauth2/v2/auth?mock=1'
      );
    });
  });

  describe('GET /auth-manual', () => {
    it('renders a page containing the auth URL', () => {
      const handler = getHandler('get', '/auth-manual');
      const res = createMockRes();

      handler({} as any, res);

      const body = res.send.mock.calls[0][0] as string;
      expect(body).toContain('https://accounts.google.com/o/oauth2/v2/auth?mock=1');
    });
  });

  describe('GET /oauth2callback', () => {
    it('returns 400 when no code query parameter is present', async () => {
      const handler = getHandler('get', '/oauth2callback');
      const res = createMockRes();

      await handler({ query: {} } as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('No code found in the query parameters');
      expect(mockedGetTokens).not.toHaveBeenCalled();
    });

    it('exchanges the code and returns a success message', async () => {
      mockedGetTokens.mockResolvedValue({ access_token: 'abc' });
      const handler = getHandler('get', '/oauth2callback');
      const res = createMockRes();

      await handler({ query: { code: 'auth-code-123' } } as any, res);

      expect(mockedGetTokens).toHaveBeenCalledWith('auth-code-123');
      expect(res.status).not.toHaveBeenCalled();
      const body = res.send.mock.calls[0][0] as string;
      expect(body).toContain('Successfully authenticated!');
    });

    it('returns 500 with error details when token exchange fails', async () => {
      mockedGetTokens.mockRejectedValue(new Error('invalid_grant'));
      const handler = getHandler('get', '/oauth2callback');
      const res = createMockRes();

      await handler({ query: { code: 'bad-code' } } as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      const body = res.send.mock.calls[0][0] as string;
      expect(body).toContain('Authentication failed: invalid_grant');
      expect(body).toContain(DEFAULT_CFG.redirectUri);
    });

    it('stringifies non-Error rejection reasons', async () => {
      mockedGetTokens.mockRejectedValue('plain string failure');
      const handler = getHandler('get', '/oauth2callback');
      const res = createMockRes();

      await handler({ query: { code: 'bad-code' } } as any, res);

      const body = res.send.mock.calls[0][0] as string;
      expect(body).toContain('Authentication failed: plain string failure');
    });
  });

  describe('POST /upload', () => {
    it('returns 400 when no file was uploaded', async () => {
      const handler = getHandler('post', '/upload');
      const res = createMockRes();

      await handler({ file: undefined, body: {} } as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('No video file uploaded');
      expect(mockedUploadVideo).not.toHaveBeenCalled();
    });

    it('uploads a video, removes the temp file, and reports the new video id', async () => {
      mockedUploadVideo.mockResolvedValue({ id: 'yt-video-1' });
      const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);
      const handler = getHandler('post', '/upload');
      const res = createMockRes();
      const req = {
        file: { path: '/tmp/uploads/clip.mp4' },
        body: { title: 'My Video', description: 'desc', tags: 'a,b,c' },
      };

      await handler(req as any, res);

      expect(mockedUploadVideo).toHaveBeenCalledWith(
        '/tmp/uploads/clip.mp4',
        'My Video',
        'desc',
        ['a', 'b', 'c']
      );
      expect(unlinkSpy).toHaveBeenCalledWith('/tmp/uploads/clip.mp4');
      expect(res.send).toHaveBeenCalledWith('Upload successful! Video ID: yt-video-1');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('defaults to an empty tags array when the tags field is omitted', async () => {
      mockedUploadVideo.mockResolvedValue({ id: 'yt-video-2' });
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);
      const handler = getHandler('post', '/upload');
      const res = createMockRes();
      const req = {
        file: { path: '/tmp/uploads/clip.mp4' },
        body: { title: 'No Tags', description: 'desc' },
      };

      await handler(req as any, res);

      expect(mockedUploadVideo).toHaveBeenCalledWith(
        '/tmp/uploads/clip.mp4',
        'No Tags',
        'desc',
        []
      );
    });

    it('returns 500 and still cleans up the temp file when the upload fails', async () => {
      mockedUploadVideo.mockRejectedValue(new Error('quota exceeded'));
      const unlinkSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);
      const handler = getHandler('post', '/upload');
      const res = createMockRes();
      const req = {
        file: { path: '/tmp/uploads/bad.mp4' },
        body: { title: 'Bad Upload', description: 'desc' },
      };

      await handler(req as any, res);

      expect(unlinkSpy).toHaveBeenCalledWith('/tmp/uploads/bad.mp4');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Video upload failed.');
    });

    it('does not crash when the cleanup unlink itself throws after a failed upload', async () => {
      mockedUploadVideo.mockRejectedValue(new Error('network error'));
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
        throw new Error('ENOENT: file already removed');
      });
      const handler = getHandler('post', '/upload');
      const res = createMockRes();
      const req = {
        file: { path: '/tmp/uploads/gone.mp4' },
        body: { title: 'Double Failure', description: 'desc' },
      };

      await expect(handler(req as any, res)).resolves.not.toThrow();

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Video upload failed.');
    });
  });
});