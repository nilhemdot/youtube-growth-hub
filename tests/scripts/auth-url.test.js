describe('scripts/auth-url.js', () => {
  let getAuthUrlMock;
  let getOAuthConfigMock;
  let logSpy;

  beforeEach(() => {
    jest.resetModules();

    getAuthUrlMock = jest.fn().mockReturnValue('https://accounts.google.com/mock-auth-url');
    getOAuthConfigMock = jest.fn().mockReturnValue({
      redirectUri: 'http://127.0.0.1:5050/oauth2callback',
    });

    // '../dist/youtubeAuth' is the compiled output and does not exist in the
    // repo (it's produced by `npm run build`), so it must be mocked as a
    // virtual module.
    jest.doMock(
      '../../dist/youtubeAuth',
      () => ({
        getAuthUrl: getAuthUrlMock,
        getOAuthConfig: getOAuthConfigMock,
      }),
      { virtual: true }
    );

    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    jest.dontMock('../../dist/youtubeAuth');
  });

  it('prints the auth URL and redirect URI sourced from youtubeAuth', () => {
    require('../../scripts/auth-url.js');

    expect(getOAuthConfigMock).toHaveBeenCalled();
    expect(getAuthUrlMock).toHaveBeenCalled();

    const output = logSpy.mock.calls.map((args) => args.join(' ')).join('\n');
    expect(output).toContain('Google sign-in URL');
    expect(output).toContain('https://accounts.google.com/mock-auth-url');
    expect(output).toContain('Redirect URI:');
    expect(output).toContain('http://127.0.0.1:5050/oauth2callback');
    expect(output).toContain('npm run auth');
  });

  it('reflects whatever redirect URI getOAuthConfig() returns', () => {
    getOAuthConfigMock.mockReturnValue({
      redirectUri: 'http://127.0.0.1:9999/oauth2callback',
    });

    require('../../scripts/auth-url.js');

    const output = logSpy.mock.calls.map((args) => args.join(' ')).join('\n');
    expect(output).toContain('http://127.0.0.1:9999/oauth2callback');
  });

  it('does not throw when getAuthUrl() itself throws (surfaces the error to the caller)', () => {
    getAuthUrlMock.mockImplementation(() => {
      throw new Error('boom');
    });

    expect(() => require('../../scripts/auth-url.js')).toThrow('boom');
  });
});