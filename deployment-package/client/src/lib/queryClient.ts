import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getAuthHeader, getToken, handleTokenRefresh, isTokenExpired, removeToken } from "./jwtUtils";

// Function to get CSRF token from response headers
let csrfToken: string | null = null;

// Initially fetch CSRF token with a GET request to a dedicated endpoint
fetch('/api/csrf-token', { credentials: 'include' })
  .then(response => {
    const token = response.headers.get('CSRF-Token');
    if (token) {
      csrfToken = token;
      console.log('Initial CSRF token fetched successfully');
    } else {
      console.warn('No CSRF token in response headers');
    }
  })
  .catch(error => {
    console.error('Error fetching initial CSRF token:', error);
  });

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
  // Update the CSRF token if present in headers
  const updateCSRFToken = (res: Response) => {
    const token = res.headers.get('CSRF-Token');
    if (token) {
      csrfToken = token;
    }
  };

  // Combine content type and auth headers with CSRF token if available
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...getAuthHeader(),
    // Always include CSRF token, even if null - the server will handle this properly
    "CSRF-Token": csrfToken || ""
  };
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include", // Keep cookies for session fallback
  });
  
  // Update CSRF token if present in response headers
  const token = res.headers.get('CSRF-Token');
  if (token) {
    csrfToken = token;
  }
  
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
    // Add JWT token and CSRF token to headers
    const headers: Record<string, string> = {
      ...getAuthHeader(),
      // Always include CSRF token, even if null - the server will handle this properly
      "CSRF-Token": csrfToken || ""
    };
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include", // Keep cookies for session fallback
    });
    
    // Update CSRF token if present in response headers
    const token = res.headers.get('CSRF-Token');
    if (token) {
      csrfToken = token;
    }
    
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
