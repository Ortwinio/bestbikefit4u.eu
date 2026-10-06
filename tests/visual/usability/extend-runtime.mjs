import { isAbsolute, resolve } from "node:path";

/** Pure source transformer for the existing real-component account adapters. */
export function extendUsabilityAccountRuntime(source, { root, batch }) {
  if (!isAbsolute(root)) throw new Error("Usability fixture requires an explicit absolute worktree root");
  if (!["profile", "fit", "tools", "bikes"].includes(batch)) throw new Error("Unknown account fixture batch");
  const marker = "const riderResult = readRiderFixture(name, args, { profile, bike, fixture });";
  if (!source.includes(marker)) throw new Error("Apply usability extension after extendRiderRuntime");
  const stateModule = JSON.stringify(resolve(root, "tests/visual/usability/account-states.ts"));
  const flags = JSON.stringify(resolve(root, "shared/pricing/flags.ts"));
  return `import { readUsabilityAccountState } from ${stateModule};
import { isPaidAccessEnforced as fixturePaidEnforced } from ${flags};
` + source.replace(marker, `const requestedMode = params.get("access") || "flag-off";
  if (!["flag-off", "free-enforced", "paid"].includes(requestedMode)) throw new Error("Unknown usability access fixture");
  const mode = requestedMode === "flag-off" ? "open" : requestedMode === "paid" ? "paid" : "free";
  if (fixturePaidEnforced() !== (mode !== "open")) throw new Error("Usability access fixture disagrees with compiled paid-access flag");
  document.documentElement.dataset.usabilityAccess = requestedMode;
  const usabilityResult = readUsabilityAccountState(name, { profile, bike, values, mode, fixture, args });
  if (usabilityResult.handled) return usabilityResult.value;
  ${marker}`);
}
