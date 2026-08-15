import { API_BASE_URL } from '../config/api.js';
import { executeApiRequest } from './apiClient.js';
import { MOCK_ALTERNATE_GRAPH, MOCK_CONVERGENCE_GRAPH } from '../data/mockData.js';

/**
 * Retrieves alternate decision cards for a session from Railway backend database.
 * Endpoint: GET /api/alternate-decisions/:sessionId
 */
export async function getAlternateCards({ sessionId }) {
  const targetUrl = `${API_BASE_URL}/api/alternate-decisions/${sessionId}`;

  return executeApiRequest({
    endpointName: 'GET_ALTERNATE_CARDS (GET /api/alternate-decisions/:sessionId)',
    url: targetUrl,
    method: 'GET',
    sessionId,
    expectedResponseSchema: {
      success: 'boolean',
      data: 'array of alternate decision card objects'
    },
    mockFallbackFn: () => [] // DO NOT return hardcoded mock cards! Return empty array so real workflow generation is awaited.
  });
}

/**
 * Retrieves alternate decision graph from Railway backend.
 * Endpoint: GET /api/alternate-decisions/:sessionId/:alternateId/graph
 */
export async function getAlternateGraph({ alternateDecisionId, alternateOptionId, sessionId }) {
  const altId = alternateOptionId || alternateDecisionId || 'alt_001';
  const targetUrl = `${API_BASE_URL}/api/alternate-decisions/${sessionId}/${altId}/graph`;

  return executeApiRequest({
    endpointName: 'GET_ALTERNATE_GRAPH (GET /api/alternate-decisions/:sessionId/:alternateId/graph)',
    url: targetUrl,
    method: 'GET',
    sessionId,
    expectedResponseSchema: {
      success: 'boolean',
      data: 'array of alternate graph node objects with alternateImpact'
    },
    mockFallbackFn: () => MOCK_ALTERNATE_GRAPH
  });
}

/**
 * Service contract for convergence graph mapping.
 * Endpoint: GET /api/alternate-decisions/convergence-graph/:sessionId
 */
export async function getConvergenceGraph({ sessionId }) {
  const targetUrl = `${API_BASE_URL}/api/alternate-decisions/convergence-graph/${sessionId}`;

  return executeApiRequest({
    endpointName: 'GET_CONVERGENCE (GET /api/alternate-decisions/convergence-graph/:sessionId)',
    url: targetUrl,
    method: 'GET',
    sessionId,
    expectedResponseSchema: {
      success: 'boolean',
      data: 'array containing convergence graph mapping'
    },
    mockFallbackFn: () => MOCK_CONVERGENCE_GRAPH
  });
}
