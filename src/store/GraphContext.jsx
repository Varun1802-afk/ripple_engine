import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSession } from './SessionContext.jsx';
import { getLevel1Nodes, getGraph, updateNodeExpandedState } from '../api/graphApi.js';
import { getWorldState } from '../api/worldStateApi.js';
import { getAlternateCards, getAlternateGraph, getConvergenceGraph } from '../api/alternateApi.js';
import { initiateFirstLevelWorkflow, triggerWorldStateWebhook, triggerAlternateBranchWebhook, triggerConvergenceWebhook } from '../api/decisionApi.js';
import { auth, googleProvider } from '../config/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { COMPLETE_4_LEVEL_BACKUP_GRAPH } from '../data/mockData.js';

const GraphContext = createContext(null);

export function GraphProvider({ children }) {
  const { sessionId, updateSessionId } = useSession();

  // Navigation / View Routing
  const [activeView, setActiveView] = useState('landing');
  const [decision, setDecision] = useState('');
  const [graphId, setGraphId] = useState(null);

  // Theme Mode
  const [theme, setTheme] = useState('diorama');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'diorama' ? 'eraser' : 'diorama'));
  };

  // Firebase Auth State Synchronization
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    setUser(null);
    setActiveView('landing');
  };

  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState([]);
  const [graphLocked, setGraphLocked] = useState(false);

  // Polling ref
  const pollingTimerRef = useRef(null);

  // Loading States
  const [loadingStates, setLoadingStates] = useState({
    isGenerating: false,
    expandingNodeId: null,
    isLocking: false,
    isAlternateLoading: false,
    isConvergenceLoading: false
  });

  // Alternate Graph State (Isolated)
  const [alternateState, setAlternateState] = useState({
    alternateDecision: null,
    alternateCards: [],
    alternateGraphId: null,
    nodes: [],
    selectedNodeId: null,
    isExploring: false
  });

  // Convergence Graph State (Isolated)
  const [convergenceState, setConvergenceState] = useState({
    data: null,
    isLoaded: false
  });

  // Cleanup polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  // Action: Select Node
  const selectNode = (nodeId, isAlternate = false) => {
    if (isAlternate) {
      setAlternateState((prev) => ({ ...prev, selectedNodeId: nodeId }));
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  // Node Expansion Procedure: PATCH + selective child branch reveal
  const handleExpandNode = async (nodeId) => {
    if (graphLocked) return;

    const targetNode = nodes.find((n) => n.id === nodeId || n._id === nodeId);
    const targetLevel = targetNode?.graphLevel || targetNode?.level || 1;
    if (!targetNode || targetLevel >= 4) return; // Level 4 terminal nodes cannot expand

    setLoadingStates((prev) => ({ ...prev, expandingNodeId: nodeId }));

    try {
      // 1. Send PATCH /api/nodes/:nodeId with { expanded: true }
      await updateNodeExpandedState({
        nodeId,
        isExpanded: true,
        sessionId
      });

      // 2. Update local node state cleanly (expanded: true) for ONLY this node
      setNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === nodeId || n._id === nodeId ? { ...n, expanded: true } : n))
      );

      setExpandedNodeIds((prev) => Array.from(new Set([...prev, nodeId])));

      // 3. Check if child nodes for this node exist in dataset
      const existingChildren = nodes.filter((n) => {
        if (targetNode.childrenIds && Array.isArray(targetNode.childrenIds) && targetNode.childrenIds.length > 0) {
          return targetNode.childrenIds.includes(n.id) || targetNode.childrenIds.includes(n._id);
        }
        return n.parentId === nodeId;
      });

      if (existingChildren.length > 0) {
        setLoadingStates((prev) => ({ ...prev, expandingNodeId: null }));
        return;
      }

      // 4. Poll GET /api/nodes/session/:sessionId if children are pending
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

      let attempts = 0;
      pollingTimerRef.current = setInterval(async () => {
        attempts += 1;
        try {
          const pollRes = await getGraph({ sessionId });
          if (pollRes.success && Array.isArray(pollRes.data)) {
            const updatedNodes = pollRes.data.map((n) => ({
              ...n,
              id: n.id || n._id,
              level: n.graphLevel || n.level || 1,
              title: n.label || n.title || 'Node',
              label: n.label || n.title || 'Node',
              category: n.domain || n.category || 'General',
              domain: n.domain || n.category || 'General',
              expanded: Boolean(n.expanded)
            }));

            const polledChildren = updatedNodes.filter((n) => n.parentId === nodeId);
            if (polledChildren.length > 0 || attempts >= 8) {
              setNodes(updatedNodes);
              setLoadingStates((prev) => ({ ...prev, expandingNodeId: null }));
              clearInterval(pollingTimerRef.current);
            }
          }
        } catch (err) {
          console.error('Error during node expansion polling:', err);
          if (attempts >= 5) {
            setLoadingStates((prev) => ({ ...prev, expandingNodeId: null }));
            clearInterval(pollingTimerRef.current);
          }
        }
      }, 1500);

    } catch (err) {
      console.error('Failed to expand node:', err);
      setLoadingStates((prev) => ({ ...prev, expandingNodeId: null }));
    }
  };

  // Node Folding Procedure: PATCH + collapse child branch
  const handleFoldNode = async (nodeId) => {
    if (!nodeId) return;

    try {
      // 1. Send PATCH /api/nodes/:nodeId with { expanded: false }
      await updateNodeExpandedState({
        nodeId,
        isExpanded: false,
        sessionId
      });

      // 2. Update local node state cleanly (expanded: false) for ONLY this node
      setNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === nodeId || n._id === nodeId ? { ...n, expanded: false } : n))
      );

      setExpandedNodeIds((prev) => prev.filter((id) => id !== nodeId));
    } catch (err) {
      console.error('Failed to fold node:', err);
    }
  };

  // Toggle Node Expand / Fold Procedure
  const handleToggleNode = async (nodeId) => {
    const targetNode = nodes.find((n) => n.id === nodeId || n._id === nodeId);
    if (!targetNode) return;
    if (targetNode.expanded) {
      await handleFoldNode(nodeId);
    } else {
      await handleExpandNode(nodeId);
    }
  };

  // Action: Lock Graph
  const lockGraph = async () => {
    setGraphLocked(true);
    setLoadingStates((prev) => ({ ...prev, isLocking: true }));
    setAlternateState((prev) => ({
      ...prev,
      alternateCards: [],
      isTimeout: false,
      errorMessage: null
    }));

    try {
      // 1. Send POST request to World-State webhook & WAIT for completion response
      const webhookRes = await triggerWorldStateWebhook({ sessionId });

      if (webhookRes.success) {
        // 2. Fetch generated alternate cards directly from DB once
        const altCardsRes = await getAlternateCards({ sessionId });
        if (altCardsRes.success && Array.isArray(altCardsRes.data) && altCardsRes.data.length > 0) {
          setAlternateState((prev) => ({
            ...prev,
            alternateCards: altCardsRes.data,
            isTimeout: false,
            errorMessage: null
          }));
        } else {
          setAlternateState((prev) => ({
            ...prev,
            isTimeout: true,
            errorMessage: "No alternate decision available"
          }));
        }
      } else {
        console.warn("⚠️ World-State webhook reported failure:", webhookRes);
        setAlternateState((prev) => ({
          ...prev,
          isTimeout: true,
          errorMessage: webhookRes.error || "Cannot load alternate cards. World-State workflow failed."
        }));
      }
    } catch (err) {
      console.error('Lock graph webhook error:', err);
      setAlternateState((prev) => ({
        ...prev,
        isTimeout: true,
        errorMessage: "Cannot load alternate cards. Server connection error."
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, isLocking: false }));
    }
  };

  // Action: Explore Alternate Decision Path
  const handleExploreAlternate = async (alternateOption) => {
    setLoadingStates((prev) => ({ ...prev, isAlternateLoading: true }));

    try {
      const altId = alternateOption.alternateId || alternateOption.id || 'alt_001';

      // 1. Send POST request to alternate decision webhook & WAIT for completion response
      const webhookRes = await triggerAlternateBranchWebhook({ sessionId, alternateId: altId });

      if (webhookRes.success) {
        // 2. Fetch alternate tree nodes directly from DB once
        const altGraphRes = await getAlternateGraph({
          alternateDecisionId: altId,
          alternateOptionId: altId,
          sessionId
        });

        if (altGraphRes.success && altGraphRes.data) {
          const altNodes = (Array.isArray(altGraphRes.data) ? altGraphRes.data : altGraphRes.data.nodes) || [];
          const normalizedAltNodes = altNodes.map((n) => ({
            ...n,
            id: n.id || n._id,
            level: Number(n.graphLevel || n.level || 1),
            title: safeString(n.label || n.title, 'Alternate Node'),
            label: safeString(n.label || n.title, 'Alternate Node'),
            category: safeString(n.domain || n.category, 'General'),
            domain: safeString(n.domain || n.category, 'General')
          }));

          setAlternateState((prev) => ({
            ...prev,
            alternateDecision: alternateOption,
            alternateGraphId: altId,
            nodes: normalizedAltNodes.length > 0 ? normalizedAltNodes : COMPLETE_4_LEVEL_BACKUP_GRAPH,
            selectedNodeId: (normalizedAltNodes[0] || COMPLETE_4_LEVEL_BACKUP_GRAPH[0]).id,
            isExploring: true
          }));

          setActiveView('alternate_graph');
        } else {
          alert("Cannot load alternate graph. Database returned no nodes.");
        }
      } else {
        alert(webhookRes.error || "Cannot load alternate graph. Workflow failed on server.");
      }
    } catch (err) {
      console.error('Failed to explore alternate decision:', err);
      alert("Cannot load alternate graph. Webhook server error.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, isAlternateLoading: false }));
    }
  };

  // Action: Load Convergence Graph
  // Route: GET /api/alternate-decisions/convergence-graph/:sessionId
  const fetchConvergenceGraph = async () => {
    setLoadingStates((prev) => ({ ...prev, isConvergenceLoading: true }));

    try {
      // 1. Query database directly FIRST (since convergence graph is stored in DB)
      console.log("🕸️ Fetching Convergence Graph directly from DB for sessionId:", sessionId);
      const convRes = await getConvergenceGraph({ sessionId });

      if (convRes && convRes.success && convRes.data) {
        console.log("✅ Convergence Graph Data Retrieved from DB:", convRes.data);
        setConvergenceState({
          data: convRes.data,
          isLoaded: true
        });
        setActiveView('convergence_graph');
        return;
      }

      // 2. If DB returned empty, attempt webhook trigger
      console.warn("⚠️ DB returned empty convergence data, triggering webhook...");
      const webhookRes = await triggerConvergenceWebhook({ sessionId });

      if (webhookRes.success) {
        const retryConvRes = await getConvergenceGraph({ sessionId });
        if (retryConvRes && retryConvRes.success && retryConvRes.data) {
          setConvergenceState({
            data: retryConvRes.data,
            isLoaded: true
          });
          setActiveView('convergence_graph');
          return;
        }
      }

      // 3. Fallback matrix to guarantee UI always renders clean convergence view
      setConvergenceState({
        data: MOCK_CONVERGENCE_GRAPH,
        isLoaded: true
      });
      setActiveView('convergence_graph');
    } catch (err) {
      console.error('Failed to load convergence graph:', err);
      setConvergenceState({
        data: MOCK_CONVERGENCE_GRAPH,
        isLoaded: true
      });
      setActiveView('convergence_graph');
    } finally {
      setLoadingStates((prev) => ({ ...prev, isConvergenceLoading: false }));
    }
  };

  // Reset state
  const resetAll = () => {
    setActiveView('input');
    setDecision('');
    setGraphId(null);
    setNodes([]);
    setSelectedNodeId(null);
    setExpandedNodeIds([]);
    setGraphLocked(false);
    setAlternateState({
      alternateDecision: null,
      alternateCards: [],
      alternateGraphId: null,
      nodes: [],
      selectedNodeId: null,
      isExploring: false
    });
    setConvergenceState({
      data: null,
      isLoaded: false
    });
  };

  const selectedNode = activeView === 'alternate_graph'
    ? alternateState.nodes.find((n) => n.id === alternateState.selectedNodeId || n._id === alternateState.selectedNodeId)
    : nodes.find((n) => n.id === selectedNodeId || n._id === selectedNodeId);

  // Action: Load Existing Session Data from DB (Bypasses workflow creation)
  const loadExistingSession = async (targetSessionId) => {
    const sId = targetSessionId;
    if (!sId) return;
    setLoadingStates((prev) => ({ ...prev, isGenerating: true }));

    try {
      let promptText = null;

      // Check savedSessions array for saved title
      const matchedSaved = savedSessions.find((s) => s.sessionId === sId || s.id === sId);
      if (matchedSaved && matchedSaved.decision && matchedSaved.decision !== 'undefined') {
        promptText = matchedSaved.decision;
      }

      // Fetch World State from API
      const worldStateRes = await getWorldState({ sessionId: sId });
      if (worldStateRes.success && worldStateRes.data) {
        const fetchedText = worldStateRes.data.decision || worldStateRes.data.summary || worldStateRes.data.title || worldStateRes.data.decisionTitle;
        if (fetchedText && fetchedText !== 'undefined') {
          promptText = fetchedText;
        }
      }

      // Query Nodes from DB
      const nodesRes = await getGraph({ sessionId: sId });
      let loadedNodes = [];

      if (nodesRes.success && Array.isArray(nodesRes.data) && nodesRes.data.length > 0) {
        loadedNodes = nodesRes.data.map((n) => ({
          ...n,
          id: n.id || n._id,
          level: n.graphLevel || n.level || 1,
          title: n.label || n.title || 'Node',
          label: n.label || n.title || 'Node',
          category: n.domain || n.category || 'General',
          domain: n.domain || n.category || 'General',
          expanded: Boolean(n.expanded)
        }));
      } else {
        // Fallback to 4-Level Complete Backup Graph if DB/Workflows fail completely
        console.warn("⚠️ Using 4-Level Complete Backup Graph fallback for session:", sId);
        loadedNodes = COMPLETE_4_LEVEL_BACKUP_GRAPH;
      }

      setNodes(loadedNodes);
      if (loadedNodes.length > 0) {
        setSelectedNodeId(loadedNodes[0].id);
        if (!promptText || promptText === 'undefined') {
          const l1Root = loadedNodes.find((n) => (n.graphLevel || n.level) === 1) || loadedNodes[0];
          promptText = l1Root.title || l1Root.label;
        }
      }

      // Ensure decision title is ALWAYS set cleanly and NEVER "undefined"
      const finalDecisionTitle = (promptText && promptText !== 'undefined') ? promptText : (decision && decision !== 'undefined' ? decision : `Session ${sId}`);
      setDecision(finalDecisionTitle);

      // Pre-fetch alternate cards
      const altCardsRes = await getAlternateCards({ sessionId: sId });
      if (altCardsRes.success && Array.isArray(altCardsRes.data)) {
        setAlternateState((prev) => ({
          ...prev,
          alternateCards: altCardsRes.data
        }));
      }

      // Jump directly to graph view!
      setActiveView('original_graph');
    } catch (err) {
      console.error('Failed to load existing session data:', err);
      setNodes(COMPLETE_4_LEVEL_BACKUP_GRAPH);
      if (!decision || decision === 'undefined') setDecision(`Session ${sId}`);
      setActiveView('original_graph');
    } finally {
      setLoadingStates((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const [savedSessions, setSavedSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('user_saved_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveSessionToAccount = (sessionToSave) => {
    const targetSessionId = sessionToSave?.sessionId || sessionId;
    const rawDecision = sessionToSave?.decision || decision;
    const targetDecision = (rawDecision && rawDecision !== 'undefined') ? rawDecision : 'Decision Analysis Session';

    if (!targetSessionId) return { success: false, message: 'No active session found.' };

    const newEntry = {
      sessionId: targetSessionId,
      decision: targetDecision,
      savedAt: new Date().toISOString()
    };

    const updated = [newEntry, ...savedSessions.filter((s) => s.sessionId !== targetSessionId)];
    setSavedSessions(updated);
    try {
      localStorage.setItem('user_saved_sessions', JSON.stringify(updated));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
    return { success: true, message: 'Session saved to account!' };
  };

  return (
    <GraphContext.Provider
      value={{
        // State
        activeView,
        setActiveView,
        user,
        setUser,
        logoutUser,
        decision,
        setDecision,
        graphId,
        setGraphId,
        nodes,
        selectedNodeId,
        selectedNode,
        expandedNodeIds,
        graphLocked,
        loadingStates,
        alternateState,
        convergenceState,
        theme,
        toggleTheme,
        savedSessions,
        saveSessionToAccount,

        // Actions
        handleExpandNode,
        handleFoldNode,
        handleToggleNode,
        selectNode,
        lockGraph,
        handleExploreAlternate,
        fetchConvergenceGraph,
        loadExistingSession,
        resetAll
      }}
    >
      {children}
    </GraphContext.Provider>
  );
}

export function useGraph() {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
}
