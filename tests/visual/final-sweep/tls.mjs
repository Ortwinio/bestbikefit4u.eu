import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { get } from "node:https";

/** Throwaway loopback certificate; never added to an OS trust store or saved in the repository. */
export async function createPreviewCertificate() {
  const directory = await mkdtemp(join(tmpdir(), "bbf-sweep-tls-"));
  const keyPath = join(directory, "key.pem");
  const certPath = join(directory, "cert.pem");
  const configPath = join(directory, "openssl.cnf");
  const close = () => rm(directory, { recursive: true, force: true });
  try {
    await writeFile(configPath, `[req]
prompt = no
distinguished_name = dn
x509_extensions = extensions
[dn]
CN = localhost
[extensions]
subjectAltName = DNS:localhost,IP:127.0.0.1,IP:::1
basicConstraints = critical,CA:TRUE
keyUsage = critical,digitalSignature,keyEncipherment,keyCertSign
extendedKeyUsage = serverAuth
`);
    await promisify(execFile)("openssl", ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
      "-keyout", keyPath, "-out", certPath, "-config", configPath]);
    return { keyPath, certPath, cert: await readFile(certPath), close };
  } catch (error) {
    await close();
    throw error;
  }
}

/** GET adapter: trust only this certificate at this exact preview origin, with normal hostname validation. */
export function createPreviewFetch(origin, cert) {
  return async function previewFetch(input, { signal = AbortSignal.timeout(15000) } = {}, redirects = 0) {
    const url = new URL(input);
    if (url.origin !== origin) return fetch(url, { signal });
    const response = await new Promise((done, reject) => {
      const request = get(url, { ca: cert, signal }, (incoming) => {
        const chunks = [];
        incoming.on("data", (chunk) => chunks.push(chunk));
        incoming.on("error", reject);
        incoming.on("end", () => {
          const status = incoming.statusCode;
          const headers = new Headers();
          for (const [name, value] of Object.entries(incoming.headers)) {
            if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
          }
          const body = [204, 205, 304].includes(status) ? null : Buffer.concat(chunks);
          done(new Response(body, { status, headers }));
        });
      });
      request.on("error", reject);
    });
    if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.has("location")) {
      if (redirects >= 10) throw new Error("Preview redirect limit exceeded");
      return previewFetch(new URL(response.headers.get("location"), url), { signal }, redirects + 1);
    }
    return response;
  };
}
