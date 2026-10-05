const router = { push: () => {}, replace: () => {}, prefetch: async () => {}, refresh: () => {} };
const mutation = async () => { throw new Error("Unexpected backend mutation in profile-context fixture"); };
export function useMutation() { return mutation; }
export function useQuery() { throw new Error("Unexpected backend query in profile-context fixture"); }
export function useConvexAuth() { return { isLoading: false, isAuthenticated: true }; }
export function usePathname() { return window.location.pathname; }
export function useSearchParams() { return new URLSearchParams(window.location.search); }
export function useRouter() { return router; }
export function useParams() { return {}; }
export function captureException(error) { throw error; }
