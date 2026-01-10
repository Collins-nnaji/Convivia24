/**
 * Helper function to get auth headers for API requests
 * Works in dev mode without authentication
 */
export function getAuthHeaders(token) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Helper to fetch data with optional auth
 */
export async function fetchWithAuth(url, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    ...options.headers,
    ...getAuthHeaders(token),
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}
