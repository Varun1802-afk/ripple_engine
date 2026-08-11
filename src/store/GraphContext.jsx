import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSession } from './SessionContext.jsx';
import { TEST_MODE_ENABLED, TEST_SESSION_ID } from '../config/api.js';
import { TEST_SESSION_DECISION, MOCK_CONVERGENCE_GRAPH } from '../data/mockData.js';
import { createDecision, createAlternateDecision } from '../api/decisionApi.js';
import { expandNode, updateNodeExpandedState, getGraph, getLevel1Nodes } from '../api/graphApi.js';
import { getAlternateCards, getAlternateGraph, getConvergenceGraph } from '../api/alternateApi.js';
import { getWorldState } from '../api/worldStateApi.js';
import { auth } from '../config/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  triggerWorldStateWebhook, 
  triggerAlternateBranchWebhook, 
  triggerConvergenceWebhook 
} from '../api/decisionApi.js';

const GraphContext = createContext(null);

export function GraphProvider({ children }) {
  const { sessionId, createNewSession } = useSession();

  // Theme state: 'eraser' | 'diorama'
  const [theme, setTheme] = useState('eraser');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'eraser' ? 'diorama' : 'eraser'));
  };

  useEffect(() => {
    document.body.classList.remove('theme-notion', 'theme-diorama', 'theme-eraser');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  // Active view: 'landing' | 'input' | 'original_graph' | 'alternate_graph' | 'convergence_graph'
  const [activeView, setActiveView] = useState('landing');
  const [user, setUser] = useState(null); // Firebase user object
  const [decision, setDecision] = useState('');
  const [graphId, setGraphId] = useState(null);

  // Automatically sync Firebase Auth persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Authenticated User',
          photoURL: firebaseUser.photoURL
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout error:', e);
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

  // Session data is loaded strictly when a valid sessionId is received or entered

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

  // Action: Lock Graph
  const lockGraph = async () => {
    setGraphLocked(true);
    setLoadingStates((prev) => ({ ...prev, isLocking: true }));
    try {
      // 1. Send POST request to World-State webhook https://ai-arena-first.app.n8n.cloud/webhook/World-State
      await triggerWorldStateWebhook({ sessionId });

      // 2. Poll DB for alternate decision cards generated by World-State workflow
      let attempts = 0;
      const pollAltCards = setInterval(async () => {
        attempts++;
        const altCardsRes = await getAlternateCards({ sessionId });
        if (altCardsRes.success && Array.isArray(altCardsRes.data) && altCardsRes.data.length > 0) {
          setAlternateState((prev) => ({
            ...prev,
            alternateCards: altCardsRes.data
          }));
          clearInterval(pollAltCards);
          setLoadingStates((prev) => ({ ...prev, isLocking: false }));
        } else if (attempts >= 10) {
          clearInterval(pollAltCards);
          setLoadingStates((prev) => ({ ...prev, isLocking: false }));
        }
      }, 2000);
    } catch (err) {
      console.error('Lock graph webhook error:', err);
      setLoadingStates((prev) => ({ ...prev, isLocking: false }));
    }
  };

  // Action: Explore Alternate Decision Path
  const handleExploreAlternate = async (alternateOption) => {
    setLoadingStates((prev) => ({ ...prev, isAlternateLoading: true }));

    try {
      const altId = alternateOption.alternateId || alternateOption.alternateId || alternateOption.id || 'alt_001';

      // 1. Send POST request to alternate decision webhook https://decision-planner.app.n8n.cloud/webhook/ce2ef43b-5d9f-4465-a52d-df3ee1ea1fd3
      await triggerAlternateBranchWebhook({ sessionId, alternateId: altId });

      // 2. Poll DB for alternate graph tree nodes
      let attempts = 0;
      const pollAltNodes = setInterval(async () => {
        attempts++;
        const altGraphRes = await getAlternateGraph({
          alternateDecisionId: altId,
          alternateOptionId: altId,
          sessionId
        });

        if (altGraphRes.success && altGraphRes.data) {
          const altNodes = (Array.isArray(altGraphRes.data) ? altGraphRes.data : altGraphRes.data.nodes) || [];
          if (altNodes.length > 0) {
            const normalizedAltNodes = altNodes.map((n) => ({
              ...n,
              id: n.id || n._id,
              level: n.graphLevel || n.level || 1,
              title: n.label || n.title || 'Alternate Node',
              label: n.label || n.title || 'Alternate Node'
            }));

            setAlternateState((prev) => ({
              ...prev,
              alternateDecision: alternateOption,
              alternateGraphId: altId,
              nodes: normalizedAltNodes,
              selectedNodeId: normalizedAltNodes[0].id,
              isExploring: true
            }));

            setActiveView('alternate_graph');
            clearInterval(pollAltNodes);
            setLoadingStates((prev) => ({ ...prev, isAlternateLoading: false }));
          }
        }

        if (attempts >= 10) {
          clearInterval(pollAltNodes);
          setLoadingStates((prev) => ({ ...prev, isAlternateLoading: false }));
        }
      }, 2000);

    } catch (err) {
      console.error('Failed to explore alternate decision:', err);
      setLoadingStates((prev) => ({ ...prev, isAlternateLoading: false }));
    }
  };

  // Action: Load Convergence Graph
  const fetchConvergenceGraph = async () => {
    setLoadingStates((prev) => ({ ...prev, isConvergenceLoading: true }));

    try {
      // 1. Send POST request to convergence webhook https://ai-arena-first.app.n8n.cloud/webhook/expand-more
      await triggerConvergenceWebhook({ sessionId });

      // 2. Poll DB for convergence matrix data
      let attempts = 0;
      const pollConvData = setInterval(async () => {
        attempts++;
        const convRes = await getConvergenceGraph({ sessionId });

        if (convRes.success && convRes.data) {
          setConvergenceState({
            data: convRes.data,
            isLoaded: true
          });
          setActiveView('convergence_graph');
          clearInterval(pollConvData);
          setLoadingStates((prev) => ({ ...prev, isConvergenceLoading: false }));
        } else if (attempts >= 10) {
          clearInterval(pollConvData);
          setLoadingStates((prev) => ({ ...prev, isConvergenceLoading: false }));
        }
      }, 2000);

    } catch (err) {
      console.error('Failed to load convergence graph:', err);
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
      // 1. Fetch World State
      const worldStateRes = await getWorldState({ sessionId: sId });
      if (worldStateRes.success && worldStateRes.data) {
        const promptText = worldStateRes.data.decision || worldStateRes.data.summary;
        if (promptText) setDecision(promptText);
      }

      // 2. Query Nodes from DB
      const nodesRes = await getGraph({ sessionId: sId });
      if (nodesRes.success && Array.isArray(nodesRes.data) && nodesRes.data.length > 0) {
        const normalizedNodes = nodesRes.data.map((n) => ({
          ...n,
          id: n.id || n._id,
          level: n.graphLevel || n.level || 1,
          title: n.label || n.title || 'Node',
          label: n.label || n.title || 'Node',
          category: n.domain || n.category || 'General',
          domain: n.domain || n.category || 'General',
          expanded: Boolean(n.expanded)
        }));

        setNodes(normalizedNodes);
        if (normalizedNodes.length > 0) {
          setSelectedNodeId(normalizedNodes[0].id);
        }
      }

      // 3. Pre-fetch alternate cards
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
    const targetDecision = sessionToSave?.decision || decision || 'Decision Analysis Session';

    if (!targetSessionId) return { success: false, message: 'No active session found.' };

    const newEntry = {
      sessionId: targetSessionId,
      decision: targetDecision,
      savedAt: new Date().toISOString(),
      userUid: user ? user.uid : 'guest'
    };

    setSavedSessions((prev) => {
      const exists = prev.some((s) => s.sessionId === targetSessionId);
      if (exists) return prev;
      const updated = [newEntry, ...prev];
      localStorage.setItem('user_saved_sessions', JSON.stringify(updated));
      return updated;
    });

    return { success: true, message: 'Session saved successfully to your account!' };
  };

  return (
    <GraphContext.Provider
      value={{
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
