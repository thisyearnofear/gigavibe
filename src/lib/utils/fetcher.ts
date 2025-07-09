/**
 * Utility for making fetch requests with better error handling
 * and automatic JSON parsing
 */
export async function fetcher(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    // Parse JSON response
    const data = await response.json();
    
    // Check if the response is okay
    if (!response.ok) {
      // If server returned an error message, use it
      const errorMessage = data?.error || `API error: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    throw error;
  }
}