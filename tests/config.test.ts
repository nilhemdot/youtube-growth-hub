import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');

describe('.gitignore', () => {
  const content = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);

  it.each([
    'node_modules/',
    'dist/',
    'uploads/',
    '.env',
    'client_secrets.json',
    'tokens.json',
    '*.log',
  ])('ignores %s', (pattern) => {
    expect(lines).toContain(pattern);
  });

  it('excludes secrets, tokens, and generated build output from version control', () => {
    expect(lines).toEqual(
      expect.arrayContaining(['client_secrets.json', 'tokens.json', '.env', 'dist/'])
    );
  });
});

describe('package.json', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

  it('has the expected identity fields', () => {
    expect(pkg.name).toBe('youtube-growth-hub');
    expect(pkg.main).toBe('dist/server.js');
  });

  it('exposes the expected npm scripts', () => {
    expect(pkg.scripts).toMatchObject({
      build: 'tsc',
      start: 'node dist/server.js',
      auth: 'node scripts/auth-cli.js',
      'auth:url': 'node scripts/auth-url.js',
      'auth:exchange': 'node scripts/exchange-url.js',
    });
  });

  it('declares exactly the runtime dependencies used by src/', () => {
    expect(Object.keys(pkg.dependencies).sort()).toEqual(
      ['dotenv', 'express', 'googleapis', 'multer'].sort()
    );
  });

  it('declares TypeScript typings as dev dependencies', () => {
    expect(pkg.devDependencies).toHaveProperty('typescript');
    expect(pkg.devDependencies).toHaveProperty('@types/express');
    expect(pkg.devDependencies).toHaveProperty('@types/multer');
    expect(pkg.devDependencies).toHaveProperty('@types/node');
  });
});

describe('tsconfig.json', () => {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf8'));

  it('targets a modern Node-compatible module system', () => {
    expect(tsconfig.compilerOptions.target).toBe('ES2022');
    expect(tsconfig.compilerOptions.module).toBe('CommonJS');
    expect(tsconfig.compilerOptions.lib).toEqual(['ES2022', 'DOM']);
  });

  it('compiles src/ into dist/', () => {
    expect(tsconfig.compilerOptions.rootDir).toBe('./src');
    expect(tsconfig.compilerOptions.outDir).toBe('./dist');
    expect(tsconfig.include).toEqual(['src/**/*']);
  });

  it('enables strict type-checking and interop settings', () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
    expect(tsconfig.compilerOptions.resolveJsonModule).toBe(true);
    expect(tsconfig.compilerOptions.forceConsistentCasingInFileNames).toBe(true);
  });
});

describe('package-lock.json', () => {
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

  it('stays in sync with package.json identity fields', () => {
    expect(lock.name).toBe(pkg.name);
    expect(lock.version).toBe(pkg.version);
  });

  it('uses the npm v7+ lockfile format', () => {
    expect(lock.lockfileVersion).toBe(3);
  });

  it('pins the root package runtime dependencies to match package.json', () => {
    const rootPackage = lock.packages[''];
    expect(rootPackage.dependencies).toEqual(pkg.dependencies);
  });
});