import { WORKFLOW_1_URL, WORKFLOW_4_1_URL, API_BASE_URL } from '../config/api.js';
import { executeApiRequest } from './apiClient.js';
import { MOCK_ORIGINAL_GRAPH } from '../data/mockData.js';

export const DIRECT_WEBHOOK_URL = "https://ai-arena-first.app.n8n.cloud/webhook/theFirstLevel";
export const PROXY_WEBHOOK_URL = "/n8n-webhook/webhook/theFirstLevel";

/**
 * Sends a POST request to n8n webhook when user initiates a decision workflow.
 * Includes a strict 60-second (1 minute) abort timeout.
 * Endpoint: POST https://ai-arena-first.app.n8n.cloud/webhook/theFirstLevel
 * Payload: { decision }
 * Returns: { success: true, sessionId, data }
 */
export async function initiateFirstLevelWorkflow({ decision }) {
  console.log("🚀 Initiating POST Request to First Level Webhook with decision:", { decision });

  const payload = JSON.stringify({ decision });
  const headers = { "Content-Type": "application/json" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s (1 min) timeout

  let response = null;

  try {
    // 1. Try direct fetch to n8n webhook URL with 60s timeout signal
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
      console.error("⏱️ Webhook request timed out after 60 seconds (1 minute)");
      return { 
        success: false, 
        error: "Resources could not be loaded. Request timed out after 1 minute.", 
        sessionId: null 
      };
    }

    console.warn("⚠️ Direct fetch failed (likely CORS), attempting Vite proxy fallback...", directErr);
    // 2. Fallback to Vite proxy endpoint (/n8n-webhook/webhook/theFirstLevel)
    try {
      response = await fetch(PROXY_WEBHOOK_URL, {
        method: "POST",
        headers,
        body: payload,
        signal: controller.signal
      });
    } catch (proxyErr) {
      clearTimeout(timeoutId);
      if (proxyErr.name === 'AbortError') {
        return { 
          success: false, 
          error: "Resources could not be loaded. Request timed out after 1 minute.", 
          sessionId: null 
        };
      }
      console.error("❌ Both direct and proxy fetches failed:", proxyErr);
      return { success: false, error: proxyErr.message || "Resources could not be loaded.", sessionId: null };
    }
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response || !response.ok) {
    return { success: false, error: `Resources could not be loaded. Webhook status ${response ? response.status : 'error'}`, sessionId: null };
  }

  const rawText = await response.text();
  console.log("✅ First Level Webhook Raw Response Text:", rawText);

  let data = null;
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    data = { rawText };
  }

  // Extract returned sessionId (supporting sessionId, session_id, id, or array payload)
  let extractedSessionId = null;
  if (typeof data === 'object' && data !== null) {
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
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch("https://ai-arena-first.app.n8n.cloud/webhook/World-State", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, session_id: sessionId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { success: res.ok };
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
      return { success: res.ok };
    } catch (proxyErr) {
      clearTimeout(timeoutId);
      console.error("❌ World-State Webhook Error:", proxyErr);
      return { success: false, error: "Resources could not be loaded." };
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
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch("https://decision-planner.app.n8n.cloud/webhook/ce2ef43b-5d9f-4465-a52d-df3ee1ea1fd3", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, alternateId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { success: res.ok };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("❌ Alternate Branch Webhook Error:", err);
    return { success: false, error: "Resources could not be loaded." };
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
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch("https://ai-arena-first.app.n8n.cloud/webhook/expand-more", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, session_id: sessionId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { success: res.ok };
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
      return { success: res.ok };
    } catch (proxyErr) {
      clearTimeout(timeoutId);
      console.error("❌ Convergence Webhook Error:", proxyErr);
      return { success: false, error: "Resources could not be loaded." };
    }
  }
}

/**
 * Creates or fetches a decision analysis session.
 */
export async function createDecision({ decision, sessionId }) {
  const isLive = typeof WORKFLOW_1_URL === 'string' && WORKFLOW_1_URL.length > 0;
  const targetUrl = isLive ? `${API_BASE_URL}/api/sessions/${sessionId}` : WORKFLOW_1_URL;

  return executeApiRequest({
    endpointName: 'WORKFLOW_1_URL (Get/Create Decision Session)',
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
