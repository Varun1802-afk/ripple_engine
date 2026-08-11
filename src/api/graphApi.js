import { API_BASE_URL } from '../config/api.js';
import { executeApiRequest } from './apiClient.js';
import { TEST_SESSION_DECISION } from '../data/mockData.js';

/**
 * Retrieves Level 1 nodes directly using ?graphLevel=1 query parameter.
 * Endpoint: GET /api/nodes?sessionId=:sessionId&graphLevel=1
 */
export async function getLevel1Nodes({ sessionId }) {
  const targetUrl = `${API_BASE_URL}/api/nodes?sessionId=${sessionId}&graphLevel=1`;

  return executeApiRequest({
    endpointName: 'GET_LEVEL_1_NODES (GET /api/nodes?sessionId=:sessionId&graphLevel=1)',
    url: targetUrl,
    method: 'GET',
    sessionId,
    expectedResponseSchema: {
      success: 'boolean',
      data: 'array of level 1 node objects'
    },
    mockFallbackFn: () => TEST_SESSION_DECISION.nodes.filter((n) => n.graphLevel === 1)
  });
}

/**
 * Retrieves original decision graph nodes from Railway backend database.
 * Endpoint: GET /api/nodes/session/:sessionId
 */
export async function getGraph({ sessionId }) {
  const targetUrl = `${API_BASE_URL}/api/nodes/session/${sessionId}`;

  return executeApiRequest({
    endpointName: 'GET_NODES (GET /api/nodes/session/:sessionId)',
    url: targetUrl,
    method: 'GET',
    sessionId,
    expectedResponseSchema: {
      success: 'boolean',
      data: 'array of node objects'
    },
    mockFallbackFn: () => TEST_SESSION_DECISION.nodes
  });
}

/**
 * Sends PATCH request to update a node's expanded state on the backend database.
 * Endpoint: PATCH /api/nodes/:nodeId
 */
export async function updateNodeExpandedState({ nodeId, isExpanded, sessionId }) {
  const targetUrl = `${API_BASE_URL}/api/nodes/${nodeId}`;

  return executeApiRequest({
    endpointName: 'PATCH_NODE_EXPANDED (PATCH /api/nodes/:nodeId)',
    url: targetUrl,
    method: 'PATCH',
    body: {
      expanded: isExpanded
    },
    sessionId,
    expectedResponseSchema: {
      success: 'boolean',
      data: {
        id: 'string',
        expanded: 'boolean'
      }
    },
    mockFallbackFn: () => ({
      id: nodeId,
      expanded: isExpanded,
      acknowledged: true
    })
  });
}

/**
 * Service alias for node expansion.
 */
export async function expandNode({ nodeId, level, parentId, sessionId }) {
  return updateNodeExpandedState({ nodeId, isExpanded: true, sessionId });
}
