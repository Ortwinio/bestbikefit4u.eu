import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:https";
import { readFile, stat } from "node:fs/promises";
import { createPreviewCertificate, createPreviewFetch } from "./tls.mjs";

test("preview TLS validates its certificate, follows redirects and does not trust other origins", async () => {
  const certificate = await createPreviewCertificate();
  const server = createServer({ key: await readFile(certificate.keyPath), cert: certificate.cert }, (req, res) => {
    if (req.url === "/redirect") {
      res.writeHead(307, { location: "/login" });
      res.end();
    } else {
      res.writeHead(200, { "content-type": "text/plain", "content-security-policy": "upgrade-insecure-requests" });
      res.end("login ready");
    }
  });
  try {
    await new Promise((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
    const origin = `https://127.0.0.1:${server.address().port}`;
    await assert.rejects(fetch(origin));
    const previewFetch = createPreviewFetch(origin, certificate.cert);
    const response = await previewFetch(`${origin}/redirect`);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "login ready");
    assert.equal(response.headers.get("content-security-policy"), "upgrade-insecure-requests");
    const otherOriginFetch = createPreviewFetch("https://127.0.0.1:1", certificate.cert);
    await assert.rejects(otherOriginFetch(origin));
  } finally {
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
    await certificate.close();
  }
  await assert.rejects(stat(certificate.keyPath), { code: "ENOENT" });
});
