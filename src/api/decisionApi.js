import { WORKFLOW_1_URL, WORKFLOW_4_1_URL, API_BASE_URL } from '../config/api.js';
import { executeApiRequest } from './apiClient.js';
import { MOCK_ORIGINAL_GRAPH } from '../data/mockData.js';

export const DIRECT_WEBHOOK_URL = "https://ai-arena-first.app.n8n.cloud/webhook/theFirstLevel";
export const PROXY_WEBHOOK_URL = "/n8n-webhook/webhook/theFirstLevel";

/**
 * Sends a POST request to n8n webhook when user initiates a decision workflow.
 * Waits for n8n completion response before notifying frontend.
 * Endpoint: POST https://ai-arena-first.app.n8n.cloud/webhook/theFirstLevel
 * Payload: { decision }
 * Returns: { success: true, sessionId, data } or { success: false, error: "Cannot load graph..." }
 */
export async function initiateFirstLevelWorkflow({ decision }) {
  console.log("🚀 Initiating POST Request to First Level Webhook with decision:", { decision });

  const payload = JSON.stringify({ decision });
  const headers = { "Content-Type": "application/json" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2-min timeout for long workflow completion

  let response = null;

  try {
    console.log(" Attempting direct fetch:", DIRECT_WEBHOOK_URL);
    response = await fetch(DIRECT_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: payload,
      signal: controller.signal
    });
  } catch (directErr) {
    if (directErr.name === 'AbortError') {
      clearTimeout(timeoutId);
      console.error("⏱️ Webhook request timed out after 2 minutes");
      return { 
        success: false, 
        error: "Cannot load graph. Workflow execution timed out on server.", 
        sessionId: null 
      };
    }

    console.warn("⚠️ Direct fetch failed (likely CORS), attempting Vite proxy fallback...", directErr);
    try {
      response = await fetch(PROXY_WEBHOOK_URL, {
        method: "POST",
        headers,
        body: payload,
        signal: controller.signal
      });
    } catch (proxyErr) {
      clearTimeout(timeoutId);
      console.error("❌ Both direct and proxy fetch attempts failed:", proxyErr);
      return { 
        success: false, 
        error: "Cannot load graph. Network or CORS connection error.", 
        sessionId: null 
      };
    }
  }

  clearTimeout(timeoutId);

  if (!response.ok) {
    console.error(`❌ Webhook returned error HTTP status: ${response.status}`);
    return { 
      success: false, 
      error: `Cannot load graph. Server returned status ${response.status}`, 
      sessionId: null 
    };
  }

  let data = null;
  try {
    data = await response.json();
    console.log("✅ Received Webhook Completion Response:", data);
  } catch (parseErr) {
    console.warn("⚠️ Webhook response was not JSON:", parseErr);
    return { success: false, error: "Cannot load graph. Invalid response format from server.", sessionId: null };
  }

  if (data && (data.success === false || data.status === 'failed')) {
    console.error("❌ Webhook returned failure status:", data);
    return { 
      success: false, 
      error: data.error || "Cannot load graph. Workflow execution failed on server.", 
      sessionId: null 
    };
  }

  // Extract sessionId from response payload
  let extractedSessionId = null;
  if (data && typeof data === 'object') {
    if (Array.isArray(data) && data.length > 0) {
      extractedSessionId = data[0].sessionId || data[0].session_id || data[0].id;
    } else {
      extractedSessionId = data.sessionId || data.session_id || data.id;
    }
  } else if (typeof data === 'string') {
    extractedSessionId = data;
  }

  return {
    success: true,
    data,
    sessionId: extractedSessionId
  };
}

/**
 * Triggers World-State webhook when user locks the original graph.
 * Endpoint: POST https://ai-arena-first.app.n8n.cloud/webhook/World-State
 * Payload: { sessionId }
 */
export async function triggerWorldStateWebhook({ sessionId }) {
  console.log("🔒 Sending POST to World-State Webhook:", sessionId);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch("https://ai-arena-first.app.n8n.cloud/webhook/World-State", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, session_id: sessionId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { success: false, error: `Cannot load alternate cards. Webhook status ${res.status}` };
    }

    const data = await res.json().catch(() => ({}));
    if (data.success === false || data.status === 'failed') {
      return { success: false, error: data.error || "Cannot load alternate cards. World-State workflow failed." };
    }

    return { success: true, data };
  } catch (err) {
    console.warn("⚠️ World-State direct POST warning, attempting proxy fallback:", err);
    try {
      const res = await fetch("/n8n-webhook/webhook/World-State", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, session_id: sessionId }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { success: false, error: `Cannot load alternate cards. Webhook status ${res.status}` };
      }

      const data = await res.json().catch(() => ({}));
      if (data.success === false || data.status === 'failed') {
        return { success: false, error: data.error || "Cannot load alternate cards. World-State workflow failed." };
      }

      return { success: true, data };
    } catch (proxyErr) {
      clearTimeout(timeoutId);
      console.error("❌ World-State Webhook Error:", proxyErr);
      return { success: false, error: "Cannot load alternate cards. Webhook server error." };
    }
  }
}

/**
 * Triggers Alternate Branch webhook when user selects an alternate card & explores alternate path.
 * Endpoint: POST https://decision-planner.app.n8n.cloud/webhook/ce2ef43b-5d9f-4465-a52d-df3ee1ea1fd3
 * Payload: { sessionId, alternateId }
 */
export async function triggerAlternateBranchWebhook({ sessionId, alternateId }) {
  console.log("🧭 Sending POST to Alternate Branch Webhook:", { sessionId, alternateId });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch("https://decision-planner.app.n8n.cloud/webhook/ce2ef43b-5d9f-4465-a52d-df3ee1ea1fd3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, alternateId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { success: false, error: `Cannot load alternate graph. Webhook status ${res.status}` };
    }

    const data = await res.json().catch(() => ({}));
    if (data.success === false || data.status === 'failed') {
      return { success: false, error: data.error || "Cannot load alternate graph. Workflow failed on server." };
    }

    return { success: true, data };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("❌ Alternate Branch Webhook Error:", err);
    return { success: false, error: "Cannot load alternate graph. Webhook server error." };
  }
}

/**
 * Triggers Convergence webhook when user clicks Convergence Graph.
 * Endpoint: POST https://ai-arena-first.app.n8n.cloud/webhook/expand-more
 * Payload: { sessionId }
 */
export async function triggerConvergenceWebhook({ sessionId }) {
  console.log("🕸️ Sending POST to Convergence Webhook (expand-more):", sessionId);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch("https://ai-arena-first.app.n8n.cloud/webhook/expand-more", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, session_id: sessionId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { success: false, error: `Cannot load convergence graph. Webhook status ${res.status}` };
    }

    const data = await res.json().catch(() => ({}));
    if (data.success === false || data.status === 'failed') {
      return { success: false, error: data.error || "Cannot load convergence graph. Workflow failed on server." };
    }

    return { success: true, data };
  } catch (err) {
    console.warn("⚠️ Convergence direct POST warning, attempting proxy fallback:", err);
    try {
      const res = await fetch("/n8n-webhook/webhook/expand-more", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, session_id: sessionId }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return { success: false, error: `Cannot load convergence graph. Webhook status ${res.status}` };
      }

      const data = await res.json().catch(() => ({}));
      if (data.success === false || data.status === 'failed') {
        return { success: false, error: data.error || "Cannot load convergence graph. Workflow failed on server." };
      }

      return { success: true, data };
    } catch (proxyErr) {
      clearTimeout(timeoutId);
      console.error("❌ Convergence Webhook Error:", proxyErr);
      return { success: false, error: "Cannot load convergence graph. Webhook server error." };
    }
  }
}

/**
 * Creates or fetches a decision analysis session (HTTP Method 1: GET /api/sessions/:sessionId).
 */
export async function createDecision({ decision, sessionId }) {
  const isLive = typeof WORKFLOW_1_URL === 'string' && WORKFLOW_1_URL.length > 0;
  const targetUrl = isLive ? `${API_BASE_URL}/api/sessions/${sessionId}` : WORKFLOW_1_URL;

  return executeApiRequest({
    endpointName: 'GET_SESSION (GET /api/sessions/:sessionId)',
    url: targetUrl,
    method: isLive ? 'GET' : 'POST',
    body: {
      decision,
      sessionId,
      timestamp: new Date().toISOString()
    },
    sessionId,
    expectedResponseSchema: {
      sessionId: 'string',
      status: 'string',
      generatedNodes: 'number'
    },
    mockFallbackFn: () => ({
      ...MOCK_ORIGINAL_GRAPH,
      decision,
      graphId: `graph-${Date.now()}`
    })
  });
}

export const fetchDecisionSession = createDecision;

/**
 * Initiates an alternate decision exploration path.
 */
export async function createAlternateDecision({ originalDecisionId, alternateChoice, sessionId }) {
  const isLive = typeof WORKFLOW_4_1_URL === 'string' && WORKFLOW_4_1_URL.length > 0;
  const targetUrl = isLive ? `${API_BASE_URL}/api/alternate-decisions/${sessionId}` : WORKFLOW_4_1_URL;

  return executeApiRequest({
    endpointName: 'WORKFLOW_4_1_URL (Fetch Alternate Decision Cards)',
    url: targetUrl,
    method: isLive ? 'GET' : 'POST',
    body: {
      originalDecisionId,
      alternateChoice,
      timestamp: new Date().toISOString()
    },
    sessionId,
    expectedResponseSchema: {
      alternateDecisionId: 'string',
      cards: 'array of alternate decision objects'
    },
    mockFallbackFn: (body) => ({
      alternateDecisionId: `alt-dec-${Date.now()}`,
      originalDecisionId,
      alternateChoice: body.alternateChoice,
      status: 'initialized'
    })
  });
}
