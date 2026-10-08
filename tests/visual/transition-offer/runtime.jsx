export const useConvexAuth = () => ({ isAuthenticated: false, isLoading: false });
export const useQuery = () => undefined;
export const useMutation = () => () => { throw new Error("Unexpected mutation"); };
