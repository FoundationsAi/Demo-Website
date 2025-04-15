import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = res.statusText;
    
    try {
      // Try to parse the error as JSON
      const errorJson = JSON.parse(text);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch (e) {
      // If it's not valid JSON, use the text as is
      errorMessage = text || errorMessage;
    }
    
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Function to handle API requests
export async function apiRequest(
  url: string,
  options: RequestInit = {},
): Promise<any> {
  const token = getAuthToken();
  
  // Setup default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  
  // Make the request
  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Check for auth errors
  if (res.status === 401) {
    // Optionally clear token if it's invalid
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('user');
  }

  await throwIfResNotOk(res);
  
  // Parse JSON response
  if (res.status !== 204) { // No content
    try {
      return await res.json();
    } catch (e) {
      return null; // Return null if no JSON content
    }
  }
  
  return null;
}

type UnauthorizedBehavior = "returnNull" | "throw" | "redirect";

// Create query function for React Query
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const url = queryKey[0] as string;
    
    // Set up auth headers if token exists
    const headers: HeadersInit = token
      ? { 'Authorization': `Bearer ${token}` }
      : {};
      
    const res = await fetch(url, {
      headers,
    });

    // Handle 401 Unauthorized based on specified behavior
    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      } else if (unauthorizedBehavior === "redirect") {
        // Redirect to login page
        window.location.href = '/login';
        return null;
      }
      // Otherwise, continue to throwIfResNotOk which will throw an error
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "redirect" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
