import { useAuthStore } from "@/store/authStore";

/**
 * Standardized fetch wrapper for the Zalmi API.
 * Automatically attaches the Authorization header if a token exists.
 */
export async function apiFetch(endpoint, options = {}) {
  const { token } = useAuthStore.getState();
  
  // Ensure endpoint starts with a slash
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Prepend /api if not already there
  const fullUrl = url.startsWith('/api') ? url : `/api${url}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 
      'Authorization': `Bearer ${token}`,
      'X-Auth-Token': token 
    } : {}),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(fullUrl, config);

  if (response.status === 401) {
    // Optional: Handle token expiration/logout here
    // useAuthStore.getState().logout();
  }

  return response;
}
