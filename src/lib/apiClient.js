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

  // Check if body is FormData to handle headers correctly
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
    // Handle token expiration/logout here
    useAuthStore.getState().logout();
    // Redirect to login page
    window.location.href = '/login';
  }

  return response;
}
