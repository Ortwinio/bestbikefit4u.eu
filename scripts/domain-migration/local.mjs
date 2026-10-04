import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { open } from 'node:fs/promises';
import { createServer } from 'node:net';
import { get } from 'node:https';
import { createPreviewCertificate } from '../../tests/visual/final-sweep/tls.mjs';

export async function startLocal(build, audit, label) {
  const env = { ...process.env, NEXT_PUBLIC_SITE_URL: 'https://bikefitboost.com',
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || 'http://127.0.0.1:9',
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL || 'http://127.0.0.1:9' };
  if (build) {
    const child = spawn('npm', ['run', 'build'], { env, stdio: 'inherit' });
    if ((await once(child, 'exit'))[0] !== 0) throw new Error('Production build failed');
  }
  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise((done) => probe.close(done));
  const certificate = await createPreviewCertificate();
  const log = await open(`${audit}/domain-migration-${label}-server.log`, 'w');
  const child = spawn(process.execPath, ['scripts/seo-crawl/server.mjs', String(port),
    certificate.keyPath, certificate.certPath], { env, stdio: ['ignore', log.fd, log.fd] });
  const localFetch = (url, options = {}) => new Promise((done, reject) => {
    const logical = new URL(url);
    const request = get(`https://127.0.0.1:${port}${logical.pathname}${logical.search}`, {
      ca: certificate.cert, servername: 'localhost', signal: options.signal,
      headers: { ...options.headers, host: logical.host, 'x-forwarded-proto': 'https' },
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => done(new Response(
        [204, 205, 304].includes(response.statusCode) ? null : Buffer.concat(chunks), {
        status: response.statusCode, headers: new Headers(Object.entries(response.headers)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : value])),
      })));
    });
    request.on('error', reject);
  });
  const stop = async () => {
    if (child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit'); }
    await log.close();
    await certificate.close();
  };
  try {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (child.exitCode !== null) throw new Error('Local production server exited');
      try {
        const response = await localFetch('https://bikefitboost.com/robots.txt', { signal: AbortSignal.timeout(1000) });
        await response.body?.cancel();
        if (response.ok) return { fetch: localFetch, stop };
      } catch { /* Await local readiness only. */ }
      await new Promise((done) => setTimeout(done, 250));
    }
    throw new Error('Local production server did not become ready');
  } catch (error) { await stop(); throw error; }
}
