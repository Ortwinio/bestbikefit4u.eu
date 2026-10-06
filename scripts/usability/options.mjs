export function localOrigin(value) {
  const url = new URL(value);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    || !["http:", "https:"].includes(url.protocol) || url.username || url.password
    || url.pathname !== "/" || url.search || url.hash) throw new Error("Only a loopback origin is allowed");
  return url.origin;
}

export function parseOptions(args) {
  const options = { local: false, scope: "all", filter: "", port: 3240, automatedOnly: false };
  for (const argument of args) {
    if (argument === "--local") { options.local = true; continue; }
    if (argument === "--automated-only") { options.automatedOnly = true; continue; }
    const split = argument.indexOf("=");
    if (split < 0) throw new Error(`Use --option=value: ${argument}`);
    const name = argument.slice(0, split), value = argument.slice(split + 1);
    const names = { "--scope": "scope", "--filter": "filter", "--port": "port", "--origin": "origin",
      "--manual-file": "manualFile", "--output": "output" };
    if (!names[name] || !value) throw new Error(`Unknown or empty option: ${argument}`);
    options[names[name]] = name === "--port" ? Number(value) : value;
  }
  if (!options.local && !options.origin) throw new Error("Use --local or --origin=http(s)://127.0.0.1:PORT");
  if (options.local && options.origin) throw new Error("Use --local or --origin, not both");
  if (!["all", "U1", "U2", "U3"].includes(options.scope)) throw new Error("Scope must be all, U1, U2 or U3");
  if (!Number.isInteger(options.port) || options.port < 1024 || options.port > 65535) throw new Error("Invalid port");
  if (options.origin) options.origin = localOrigin(options.origin);
  return options;
}
