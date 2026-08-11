import { API_CONFIG, API_BASE_URL } from '../config/api.js';

let debugListener = null;

export const setDebugListener = (listenerFn) => {
  debugListener = listenerFn;
};

/**
 * Centralized API Client Dispatcher for Railway Backend Service
 */
export async function executeApiRequest({
  endpointName,
  url,
  method = 'GET',
  body = null,
  sessionId,
  expectedResponseSchema = {},
  mockFallbackFn = null
}) {
  let targetUrl = url;

  // Resolve target URL relative to API_BASE_URL if needed
  if (typeof targetUrl === 'string' && !targetUrl.startsWith('http')) {
    const cleanPath = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    const apiPath = cleanPath.startsWith('/api/') ? cleanPath : `/api${cleanPath}`;
    targetUrl = `${API_BASE_URL}${apiPath}`;
  }

  const isUrlConfigured = typeof targetUrl === 'string' && targetUrl.trim().length > 0;

  const requestPayload = {
    endpointName,
    url: isUrlConfigured ? targetUrl : `[PLACEHOLDER] ${endpointName}`,
    isUrlConfigured,
    method,
    sessionId: sessionId || 'UNINITIALIZED_SESSION',
    timestamp: new Date().toISOString(),
    requestBody: body ? { ...body, sessionId } : { sessionId },
    expectedResponseSchema
  };

  // Log to debug drawer listener
  if (debugListener) {
    debugListener(requestPayload);
  }

  if (isUrlConfigured) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId || ''
        }
      };

      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(targetUrl, options);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      return {
        success: true,
        source: 'RAILWAY_BACKEND_API',
        data: responseData.data !== undefined ? responseData.data : responseData,
        requestPayload
      };
    } catch (error) {
      console.warn(`[API Call Warning - ${endpointName}]: Falling back to prototype data.`, error.message);
      if (API_CONFIG.MOCK_FALLBACK_IF_UNCONFIGURED && mockFallbackFn) {
        const mockData = mockFallbackFn(requestPayload.requestBody);
        return {
          success: true,
          source: 'MOCK_FALLBACK',
          data: mockData,
          requestPayload,
          warning: error.message
        };
      }
      throw error;
    }
  }

  if (API_CONFIG.MOCK_FALLBACK_IF_UNCONFIGURED && mockFallbackFn) {
    const mockData = mockFallbackFn(requestPayload.requestBody);
    return {
      success: true,
      source: 'MOCK_PROTOTYPE_FALLBACK',
      data: mockData,
      requestPayload
    };
  }

  return {
    success: false,
    source: 'UNCONFIGURED_PLACEHOLDER',
    error: `Endpoint URL for ${endpointName} is unconfigured.`,
    requestPayload
  };
}
