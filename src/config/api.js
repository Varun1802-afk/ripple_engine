/**
 * API Endpoint Configuration Constants
 * Live Railway Backend Service: https://web-production-13d1f.up.railway.app
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://web-production-13d1f.up.railway.app";

export const WORKFLOW_1_URL = `${API_BASE_URL}/api/world-state`;
export const WORKFLOW_2_URL = `${API_BASE_URL}/api/nodes`;
export const WORKFLOW_3_URL = `${API_BASE_URL}/api/nodes`;
export const WORKFLOW_4_1_URL = `${API_BASE_URL}/api/alternate-decisions`;
export const WORKFLOW_4_2_URL = `${API_BASE_URL}/api/alternate-decisions`;
export const WORKFLOW_5_URL = `${API_BASE_URL}/api/alternate-decisions`;

// Test Mode Disabled (Only real session IDs from webhook or user entry will be used)
export const TEST_MODE_ENABLED = false;
export const TEST_SESSION_ID = null;

// Global API Client Config
export const API_CONFIG = {
  MOCK_FALLBACK_IF_UNCONFIGURED: false,
  ENABLE_DEBUG_LOGGING: true,
  REQUEST_TIMEOUT_MS: 15000,
};
