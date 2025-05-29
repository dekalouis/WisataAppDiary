// Expect a cold start of 5 to 10 secs on this service
const API_BASE_URL = "https://project-tempest-hiring.up.railway.app";

/**
 * TASK: Implement API client for fetching data from the backend API endpoint
 */
export const apiClient = {
  async get(endpoint, params = {}) {
    const url = new URL(endpoint, API_BASE_URL);

    // Add query parameters
    Object.keys(params).forEach((key) => {
      if (Array.isArray(params[key])) {
        params[key].forEach((value) => url.searchParams.append(key, value));
      } else {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },
};
