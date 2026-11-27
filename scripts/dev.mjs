#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const DEFAULT_EVE_ORIGIN = 'http://127.0.0.1:2000';

if (existsSync('.env.local') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env.local');
}

function parseEveEndpoint() {
  const raw = process.env.EVE_BASE_URL?.trim() || DEFAULT_EVE_ORIGIN;
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname || '127.0.0.1';
    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '2000');
    return {
      host,
      port,
      origin: `${parsed.protocol}//${host}:${port}`,
    };
  } catch {
    return { host: '127.0.0.1', port: '2000', origin: DEFAULT_EVE_ORIGIN };
  }
}

function pipePrefixed(stream, prefix, target) {
  if (!stream) return;
  let buffer = '';
  stream.setEncoding('utf8');
  stream.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      target.write(`${prefix} ${line}\n`);
    }
  });
  stream.on('end', () => {
    if (buffer.length > 0) {
      target.write(`${prefix} ${buffer}\n`);
    }
  });
}

const eveEndpoint = parseEveEndpoint();
const children = [];
let shuttingDown = false;
let pendingExitCode = 0;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  pendingExitCode = exitCode;
  for (const child of children) {
    if (!child.killed && child.exitCode === null) {
      child.kill('SIGTERM');
    }
  }
  const timer = setTimeout(() => {
    for (const child of children) {
      if (!child.killed && child.exitCode === null) {
        child.kill('SIGKILL');
      }
    }
    process.exit(pendingExitCode);
  }, 4000);
  timer.unref();
}

function startService(name, colorCode, command, args, env) {
  const prefix = `\u001b[${colorCode}m[${name}]\u001b[0m`;
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.push(child);
  pipePrefixed(child.stdout, prefix, process.stdout);
  pipePrefixed(child.stderr, prefix, process.stderr);

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      if (children.every((c) => c.exitCode !== null || c.signalCode !== null)) {
        process.exit(pendingExitCode);
      }
      return;
    }
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    process.stderr.write(
      `${prefix} exited unexpectedly (${reason}); stopping remaining dev processes...\n`,
    );
    shutdown(typeof code === 'number' && code !== 0 ? code : 1);
  });

  return child;
}

console.log(
  `Starting TariffOS local dev (Eve on ${eveEndpoint.origin} + Next.js on http://localhost:3003)...`,
);

startService(
  'eve',
  '36',
  'pnpm',
  ['exec', 'eve', 'dev', '--no-ui', '--host', eveEndpoint.host, '--port', eveEndpoint.port],
  { ...process.env },
);

startService('web', '32', 'pnpm', ['--filter', 'web', 'dev'], {
  ...process.env,
  EVE_BASE_URL: eveEndpoint.origin,
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
