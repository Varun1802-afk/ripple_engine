import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_ORIGINAL_GRAPH, MOCK_ALTERNATE_GRAPH, MOCK_CONVERGENCE_GRAPH, COMPLETE_4_LEVEL_BACKUP_GRAPH } from '../data/mockData.js';
import { fetchDecisionSession } from '../api/decisionApi.js';
import { getLevel1Nodes, getGraph, updateNodeExpandedState } from '../api/graphApi.js';
import { 
  getAlternateCards, 
  getAlternateGraph, 
  getConvergenceGraph 
} from '../api/alternateApi.js';

const initialDecision = MOCK_ORIGINAL_GRAPH.decision;
const initialNodes = MOCK_ORIGINAL_GRAPH.nodes;

const GraphContext = createContext(null);

const extractDecisionText = (data) => {
  if (!data) return '';
  if (typeof data === 'string' && data !== 'undefined' && data !== 'null') return data;
  if (Array.isArray(data) && data.length > 0) {
    for (const item of data) {
      const found = extractDecisionText(item);
      if (found) return found;
    }
  }
  if (typeof data === 'object') {
    if (data.decision && typeof data.decision === 'string' && data.decision !== 'undefined' && data.decision !== 'null') return data.decision;
    if (data.prompt && typeof data.prompt === 'string' && data.prompt !== 'undefined' && data.prompt !== 'null') return data.prompt;
    if (data.title && typeof data.title === 'string' && data.title !== 'undefined' && data.title !== 'null') return data.title;
    if (data.decisionText && typeof data.decisionText === 'string' && data.decisionText !== 'undefined' && data.decisionText !== 'null') return data.decisionText;
    if (data.decisionStatement && typeof data.decisionStatement === 'string' && data.decisionStatement !== 'undefined' && data.decisionStatement !== 'null') return data.decisionStatement;
    if (data.session) return extractDecisionText(data.session);
    if (data.data) return extractDecisionText(data.data);
  }
  return '';
};

const safeString = (val, fallback = '') => {
  if (!val || val === 'undefined' || val === 'null') return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map((v) => safeString(v, fallback)).filter(Boolean).join(', ') || fallback;
    }
    const keys = Object.keys(val);
    if (keys.length > 0) {
      const firstVal = val[keys[0]];
      if (typeof firstVal === 'string' || typeof firstVal === 'number') {
        return `${keys[0]}: ${firstVal}`;
      }
      return keys.join(', ');
    }
  }
  return fallback;
};

export function GraphProvider({ children }) {
  // Theme state: 'diorama'
  const [theme, setTheme] = useState('diorama');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'diorama' ? 'eraser' : 'diorama'));
  };

  // Active view: 'landing' | 'input' | 'original_graph' | 'alternate_graph' | 'convergence_graph'
  const [activeView, setActiveView] = useState('landing');

  // User Authentication State
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ripple_engine_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const loginUser = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('ripple_engine_user', JSON.stringify(userData));
    } catch {}
  };

  const logoutUser = () => {
    setUser(null);
    try {
      localStorage.removeItem('ripple_engine_user');
    } catch {}
  };

  // Saved Sessions in User Account
  const [savedSessions, setSavedSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('ripple_engine_saved_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSessionToAccount = (sessionObj) => {
    if (!sessionObj || !sessionObj.sessionId) return { success: false };
    const exists = savedSessions.some((s) => s.sessionId === sessionObj.sessionId);
    if (exists) return { success: true, alreadySaved: true };

    const updated = [
      {
        sessionId: sessionObj.sessionId,
        decision: sessionObj.decision || 'Strategic Policy Decision',
        savedAt: new Date().toISOString()
      },
      ...savedSessions
    ];
    setSavedSessions(updated);
    try {
      localStorage.setItem('ripple_engine_saved_sessions', JSON.stringify(updated));
    } catch {}
    return { success: true };
  };

  // Main Decision State
  const [decision, setDecision] = useState(initialDecision);

  // Active Session ID
  const [graphId, setGraphId] = useState('1786263972176-q2ibfuaj');

  // Graph lock state
  const [graphLocked, setGraphLocked] = useState(false);

  // Nodes in active primary graph
  const [nodes, setNodes] = useState(initialNodes);

  // Active selected node ID
  const [selectedNodeId, setSelectedNodeId] = useState('node_1');

  // Node branch fold state map { [nodeId]: boolean }
  const [foldedNodes, setFoldedNodes] = useState({});

  const handleFoldNodeMap = (nodeId) => {
    setFoldedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Alternate Decision State
  const [alternateState, setAlternateState] = useState({
    isExploring: false,
    alternateDecision: null,
    alternateGraphId: null,
    nodes: [],
    selectedNodeId: null,
    alternateCards: [],
    isTimeout: false,
    errorMessage: null
  });

  // Convergence Graph State
  const [convergenceState, setConvergenceState] = useState({
    data: MOCK_CONVERGENCE_GRAPH,
    isLoaded: false,
    errorMessage: null
  });

  // Granular Loading States
  const [loadingStates, setLoadingStates] = useState({
    isGraphLoading: false,
    isLocking: false,
    isAlternateLoading: false,
    isConvergenceLoading: false,
    expandingNodeId: null
  });

  // Action: Select Node
  const handleSelectNode = (nodeId, isAlt = false) => {
    if (!nodeId) return;
    if (isAlt || activeView === 'alternate_graph') {
      setAlternateState((prev) => ({ ...prev, selectedNodeId: nodeId }));
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  // Expand Node (PATCH /api/nodes/:nodeId) + Merges child nodes into state
  const handleExpandNode = async (nodeId) => {
    if (!nodeId) return;
    setLoadingStates((prev) => ({ ...prev, expandingNodeId: nodeId }));

    try {
      // 1. Send PATCH /api/nodes/:nodeId to update expanded state in DB
      await updateNodeExpandedState({
        nodeId,
        isExpanded: true,
        sessionId: graphId
      });

      // 2. Fetch full graph nodes from GET /api/nodes/session/:sessionId to ensure child nodes are loaded
      const fullGraphRes = await getGraph({ sessionId: graphId });
      let allFetchedNodes = [];
      if (fullGraphRes && fullGraphRes.data && Array.isArray(fullGraphRes.data)) {
        allFetchedNodes = fullGraphRes.data.map((n, idx) => ({
          ...n,
          id: n.id || n._id || `node-${idx}`,
          level: Number(n.graphLevel || n.level || 1),
          graphLevel: Number(n.graphLevel || n.level || 1),
          title: safeString(n.label || n.title || n.name, 'Consequence Node'),
          label: safeString(n.label || n.title || n.name, 'Consequence Node'),
          category: safeString(n.domain || n.category, 'General'),
          domain: safeString(n.domain || n.category, 'General')
        }));
      }

      setNodes((prevNodes) => {
        const nodeMap = {};
        prevNodes.forEach((n) => {
          nodeMap[n.id] = n;
        });

        allFetchedNodes.forEach((n) => {
          if (!nodeMap[n.id]) {
            nodeMap[n.id] = n;
          }
        });

        // Set expanded = true on the target node
        const targetKey = Object.keys(nodeMap).find(
          (key) => key === nodeId || nodeMap[key]._id === nodeId
        );
        if (targetKey) {
          nodeMap[targetKey] = { ...nodeMap[targetKey], expanded: true };
        }

        return Object.values(nodeMap);
      });
    } catch (err) {
      console.error('Failed to expand node:', err);
      // Fallback local state toggle
      setNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === nodeId || n._id === nodeId ? { ...n, expanded: true } : n))
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, expandingNodeId: null }));
    }
  };

  // Fold Node (PATCH /api/nodes/:nodeId)
  const handleFoldNode = async (nodeId) => {
    if (!nodeId) return;

    try {
      await updateNodeExpandedState({
        nodeId,
        isExpanded: false,
        sessionId: graphId
      });

      setNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === nodeId || n._id === nodeId ? { ...n, expanded: false } : n))
      );
    } catch (err) {
      console.error('Failed to fold node:', err);
      setNodes((prevNodes) =>
        prevNodes.map((n) => (n.id === nodeId || n._id === nodeId ? { ...n, expanded: false } : n))
      );
    }
  };

  const handleToggleNode = async (nodeId) => {
    const targetNode = nodes.find((n) => n.id === nodeId || n._id === nodeId);
    if (!targetNode) return;
    if (targetNode.expanded) {
      await handleFoldNode(nodeId);
    } else {
      await handleExpandNode(nodeId);
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 1 & 3: Load Existing Session
  // - Uses HTTP Method 1 (GET /api/sessions/:sessionId) to fetch root decision
  // - Uses HTTP Method 3 (GET /api/nodes?sessionId=:sessionId&graphLevel=1) to fetch Level 1 nodes
  // - Resets graphLocked to false so fetched sessions are NOT locked by default!
  // ---------------------------------------------------------------------------
  const loadExistingSession = async (targetSessionId) => {
    if (!targetSessionId) return;
    setLoadingStates((prev) => ({ ...prev, isGraphLoading: true }));

    try {
      console.log(`🌐 [Method 1] Fetching Decision from GET /api/sessions/${targetSessionId}...`);
      const sessionRes = await fetchDecisionSession({ sessionId: targetSessionId });

      console.log(`🌐 [Method 3] Fetching Level 1 Nodes from GET /api/nodes?sessionId=${targetSessionId}&graphLevel=1...`);
      const l1NodesRes = await getLevel1Nodes({ sessionId: targetSessionId });

      // Also fetch full graph in background so child nodes exist for branch expansion
      const fullGraphRes = await getGraph({ sessionId: targetSessionId });

      // 1. Extract Root Decision Statement from Method 1
      let rootDecisionText = '';
      if (sessionRes && sessionRes.data) {
        rootDecisionText = extractDecisionText(sessionRes.data);
      }

      // 2. Extract Nodes from Method 3 and full graph
      let rawL1Nodes = [];
      if (l1NodesRes && l1NodesRes.data && Array.isArray(l1NodesRes.data)) {
        rawL1Nodes = l1NodesRes.data;
      }

      let rawFullNodes = [];
      if (fullGraphRes && fullGraphRes.data && Array.isArray(fullGraphRes.data)) {
        rawFullNodes = fullGraphRes.data;
      }

      const combinedRaw = [...rawL1Nodes, ...rawFullNodes];

      const nodeMap = {};
      combinedRaw.forEach((n, idx) => {
        const idKey = n.id || n._id || `node-${idx}`;
        if (!nodeMap[idKey]) {
          nodeMap[idKey] = {
            ...n,
            id: idKey,
            level: Number(n.graphLevel || n.level || 1),
            graphLevel: Number(n.graphLevel || n.level || 1),
            title: safeString(n.label || n.title || n.name, 'Consequence Node'),
            label: safeString(n.label || n.title || n.name, 'Consequence Node'),
            category: safeString(n.domain || n.category, 'General'),
            domain: safeString(n.domain || n.category, 'General')
          };
        }
      });

      const normalizedNodes = Object.values(nodeMap);

      // Fallback decision string if DB literally stored "undefined"
      if (!rootDecisionText || rootDecisionText === 'undefined' || rootDecisionText === 'null') {
        if (normalizedNodes.length > 0) {
          const l1Domain = normalizedNodes[0].domain || normalizedNodes[0].category;
          rootDecisionText = `Strategic Policy & ${l1Domain} Decision Analysis`;
        } else {
          rootDecisionText = `Strategic Decision Analysis (${targetSessionId})`;
        }
      }

      setDecision(rootDecisionText);

      if (normalizedNodes.length > 0) {
        setNodes(normalizedNodes);
        setSelectedNodeId(normalizedNodes[0].id);
      }

      setGraphId(targetSessionId);

      // UNLOCK GRAPH ON SESSION LOAD (User Directive: "when the user fetches a session again the graph should not be locked")
      setGraphLocked(false);

      setActiveView('original_graph');
    } catch (err) {
      console.error('Failed to load existing session:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, isGraphLoading: false }));
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 4: Lock Graph & Fetch Alternate Decision Cards
  // - Uses HTTP Method 5 (GET /api/alternate-decisions/:sessionId) directly
  // ---------------------------------------------------------------------------
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
      console.log(`🔒 [Method 5] Fetching Alternate Cards from GET /api/alternate-decisions/${graphId}...`);
      const altCardsRes = await getAlternateCards({ sessionId: graphId });

      if (altCardsRes && altCardsRes.success && Array.isArray(altCardsRes.data) && altCardsRes.data.length > 0) {
        console.log("✅ Retrieved Alternate Cards from DB:", altCardsRes.data);
        setAlternateState((prev) => ({
          ...prev,
          alternateCards: altCardsRes.data,
          isTimeout: false,
          errorMessage: null
        }));
      } else {
        console.warn("⚠️ No alternate decision cards found in database for session:", graphId);
        setAlternateState((prev) => ({
          ...prev,
          alternateCards: [],
          isTimeout: true,
          errorMessage: `No alternate decision cards found in database for session '${graphId}'`
        }));
      }
    } catch (err) {
      console.error('Failed to fetch alternate cards from DB:', err);
      setAlternateState((prev) => ({
        ...prev,
        alternateCards: [],
        isTimeout: true,
        errorMessage: "Error connecting to database to retrieve alternate cards."
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, isLocking: false }));
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 5: Explore Alternate Decision Graph
  // - Uses HTTP Method 6 (GET /api/alternate-decisions/:sessionId/:alternateId/graph) directly
  // ---------------------------------------------------------------------------
  const handleExploreAlternate = async (alternateOption) => {
    setLoadingStates((prev) => ({ ...prev, isAlternateLoading: true }));

    try {
      const altId = alternateOption.alternateId || alternateOption.id || 'alt_001';
      console.log(`🧭 [Method 6] Fetching Alternate Graph from GET /api/alternate-decisions/${graphId}/${altId}/graph...`);

      const altGraphRes = await getAlternateGraph({
        alternateDecisionId: altId,
        alternateOptionId: altId,
        sessionId: graphId
      });

      if (altGraphRes && altGraphRes.success && altGraphRes.data) {
        const altNodes = (Array.isArray(altGraphRes.data) ? altGraphRes.data : altGraphRes.data.nodes) || [];
        
        if (altNodes.length > 0) {
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
            nodes: normalizedAltNodes,
            selectedNodeId: normalizedAltNodes[0].id,
            isExploring: true,
            errorMessage: null
          }));

          setActiveView('alternate_graph');
        } else {
          alert(`Alternate decision graph '${altId}' not found in database for session '${graphId}'.`);
        }
      } else {
        alert(`Alternate decision graph '${altId}' not found in database for session '${graphId}'.`);
      }
    } catch (err) {
      console.error('Failed to explore alternate decision:', err);
      alert("Error retrieving alternate graph from database.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, isAlternateLoading: false }));
    }
  };

  // ---------------------------------------------------------------------------
  // STEP 6: Fetch Convergence Graph
  // - Uses HTTP Method 7 (GET /api/alternate-decisions/convergence-graph/:sessionId) directly
  // ---------------------------------------------------------------------------
  const fetchConvergenceGraph = async () => {
    setLoadingStates((prev) => ({ ...prev, isConvergenceLoading: true }));

    try {
      console.log(`🕸️ [Method 7] Fetching Convergence Graph from GET /api/alternate-decisions/convergence-graph/${graphId}...`);
      const convRes = await getConvergenceGraph({ sessionId: graphId });

      if (convRes && convRes.success && convRes.data) {
        console.log("✅ Retrieved Convergence Graph from DB:", convRes.data);
        setConvergenceState({
          data: convRes.data,
          isLoaded: true,
          errorMessage: null
        });
        setActiveView('convergence_graph');
      } else {
        console.warn("⚠️ Database returned empty convergence graph for session:", graphId);
        alert(`Convergence graph not found in database for session '${graphId}'.`);
      }
    } catch (err) {
      console.error('Failed to fetch convergence graph from DB:', err);
      alert("Error retrieving convergence graph from database.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, isConvergenceLoading: false }));
    }
  };

  // Sync html data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Derived selected node object (flexible ID matching)
  const activeNodesList = activeView === 'alternate_graph' ? alternateState.nodes : nodes;
  const activeSelectedId = activeView === 'alternate_graph' ? alternateState.selectedNodeId : selectedNodeId;
  const selectedNode = activeNodesList.find((n) => 
    String(n.id) === String(activeSelectedId) || 
    String(n._id) === String(activeSelectedId) || 
    String(n.nodeId) === String(activeSelectedId)
  ) || activeNodesList[0] || null;

  return (
    <GraphContext.Provider
      value={{
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        user,
        loginUser,
        setUser: loginUser,
        logoutUser,
        savedSessions,
        saveSessionToAccount,
        decision,
        setDecision,
        sessionId: graphId,
        setGraphId,
        graphLocked,
        lockGraph,
        handleLockGraph: lockGraph,
        nodes,
        selectedNode,
        selectNode: handleSelectNode,
        handleSelectNode,
        handleExpandBranch: handleExpandNode,
        handleExpandNode,
        handleFoldNode,
        handleToggleNode,
        foldedNodes,
        handleFoldNodeMap,
        alternateState,
        handleExploreAlternate,
        convergenceState,
        fetchConvergenceGraph,
        loadExistingSession,
        loadingStates
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
