import { getFunctionName } from "convex/server";

export const signupState = { profile: null, observations: [], calls: [], destination: null };
const router = { replace: path => { signupState.destination = path; }, push: path => { signupState.destination = path; } };
export function useRouter() { return router; }
export function usePathname() { return window.location.pathname; }
export function useSearchParams() { return new URLSearchParams(window.location.search); }
export function useConvexAuth() { return { isLoading: false, isAuthenticated: true }; }
export function useTheme() { return { resolvedTheme: "light", theme: "light" }; }
export function useQuery(reference, args) {
  if (args === "skip") return undefined;
  const name = getFunctionName(reference);
  if (name === "profiles/queries:getHandoffContext") return { profile: signupState.profile, observations: signupState.observations };
  if (name === "calculatorData/queries:get") return { userId: "fixture-new-owner", entries: [] };
  throw new Error(`Unexpected signup fixture query: ${name}`);
}
export function useMutation(reference) {
  const name = getFunctionName(reference);
  return async args => {
    signupState.calls.push({ name, args });
    if (name !== "profiles/mutations:importHandoff") throw new Error(`Unexpected signup fixture mutation: ${name}`);
    signupState.profile = { userId: "fixture-new-owner", ...Object.fromEntries(args.records.map(entry => [entry.field, entry.value])) };
    signupState.observations = args.records.map(entry => ({ field: entry.field, value: entry.value,
      kind: entry.method, method: entry.method, recordedAt: entry.touchedAt, source: "public_handoff", status: "current" }));
    return { status: "imported", importedFields: args.records.map(entry => entry.field), conflicts: [], profileId: "fixture-profile", bikeId: null };
  };
}
export function captureException(error) { throw error; }
