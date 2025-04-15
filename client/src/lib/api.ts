/**
 * Utility function for making API requests to our backend
 */
export const apiRequest = async (
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any
): Promise<Response> => {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    credentials: "same-origin", // Include cookies for session
  };

  // Add body for non-GET requests with data
  if (method !== "GET" && data) {
    options.body = JSON.stringify(data);
  }

  // Ensure URL starts with /api if it doesn't already
  const apiUrl = url.startsWith("/api") ? url : `/api${url}`;
  
  try {
    const response = await fetch(apiUrl, options);
    
    if (!response.ok) {
      // Try to parse error message from response
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      } catch (parseError) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }
    
    return response;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};