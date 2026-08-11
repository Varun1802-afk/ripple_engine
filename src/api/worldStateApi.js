import { API_BASE_URL } from '../config/api.js';
import { executeApiRequest } from './apiClient.js';

/**
 * Retrieves the World State for a given session from the Railway backend.
 * Endpoint: GET /api/world-state/:sessionId
 */
export async function getWorldState({ sessionId }) {
  const targetUrl = `${API_BASE_URL}/api/world-state/${sessionId}`;

  return executeApiRequest({
    endpointName: 'WORLD_STATE (GET /api/world-state/:sessionId)',
    url: targetUrl,
    method: 'GET',
    sessionId,
    expectedResponseSchema: {
      sessionId: 'string',
      decision: 'string (Root Decision Prompt)',
      domains: 'array of strings',
      assumptions: 'array of strings',
      summary: 'string',
      statistics: 'object'
    },
    mockFallbackFn: () => ({
      sessionId,
      decision: "A government should transition all public-sector vehicles to electric vehicles by 2032, while providing subsidies for charging infrastructure and workforce reskilling."
    })
  });
}
