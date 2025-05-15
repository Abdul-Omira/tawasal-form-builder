import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeader, getToken, handleTokenRefresh, isTokenExpired, removeToken } from "./jwtUtils";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Check for token expiry response
    if (res.status === 401) {
      // If token expired, clear it to force re-authentication
      removeToken();
    }
    
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * API request function that handles JWT tokens
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Combine content type header with auth header if token exists
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...getAuthHeader()
  };
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Keep cookies for session fallback
  });
  
  // Check for token refresh in response headers
  handleTokenRefresh(res);
  
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add JWT token to headers if it exists
    const headers = getAuthHeader();
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include", // Keep cookies for session fallback
    });
    
    // Check for token refresh in response headers
    handleTokenRefresh(res);
    
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      // If unauthorized and token exists, it might be expired - clear it
      if (getToken()) {
        removeToken();
      }
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
