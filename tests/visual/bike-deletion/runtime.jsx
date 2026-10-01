import { getFunctionName } from "convex/server";

export function usePathname() { return window.location.pathname; }
export function useQuery() { return null; }
export function useRouter() {
  return { replace: (path) => { window.__deletionRedirect = path; } };
}
export function usePaginatedQuery(reference, args) {
  if (getFunctionName(reference) !== "bikes/deletion:preview") throw new Error("Unexpected preview query");
  return { results: args === "skip" ? [] : ["session-one", "session-two", "session-three"], status: "Exhausted", loadMore() {} };
}
export function useMutation(reference) {
  return async (args) => {
    if (getFunctionName(reference) !== "bikes/mutations:remove") throw new Error("Unexpected mutation");
    window.__deletionArguments = args;
    if (window.__deletionFail) throw new Error("Fixture deletion failure");
  };
}
