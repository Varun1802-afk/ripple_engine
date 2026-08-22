import { swytchcodeRuntime } from '../services/swytchcodeRuntime.js';

/**
 * Concludes a decision session by routing input parameters through Swytchcode execution layer.
 * Endpoint Action: 'openai.chat.completions.create'
 */
export async function concludeDecisionSession({ sessionId, decision, assumptions, domains, nodes, alternateState }) {
  console.log("🎯 [Conclusion API] Initiating Decision Conclusion via Swytchcode for session:", sessionId);

  if (!decision || typeof decision !== 'string' || decision.length === 0) {
    return {
      success: false,
      error: "Invalid decision input. Please provide a valid decision statement before concluding."
    };
  }

  // Construct structured input payload
  const inputData = {
    sessionId,
    decision,
    assumptions: assumptions || [],
    domains: domains || ["Technology", "Economy", "Transportation", "Energy", "Government"],
    graphConsequences: (nodes || []).map((n) => ({
      id: n.id || n._id,
      label: n.label || n.title || "Consequence Node",
      domain: n.domain || n.category || "General",
      graphLevel: n.graphLevel || n.level || 1,
      description: n.description || ""
    })),
    worldState: {
      isExploringAlternate: alternateState?.isExploring || false,
      alternateCardsCount: alternateState?.alternateCards?.length || 0,
      selectedAlternateId: alternateState?.alternateGraphId || null
    }
  };

  try {
    const result = await swytchcodeRuntime.executeAction('openai.chat.completions.create', {
      inputData
    });

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        executionMode: result.executionMode
      };
    }

    return {
      success: false,
      error: "Swytchcode runtime returned empty conclusion response."
    };
  } catch (err) {
    console.error("❌ [Conclusion API] Swytchcode execution error:", err);
    return {
      success: false,
      error: err.message || "Failed to execute Swytchcode conclusion action."
    };
  }
}
