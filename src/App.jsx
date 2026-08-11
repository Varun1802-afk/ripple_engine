import React from 'react';
import { SessionProvider } from './store/SessionContext.jsx';
import { DebugProvider } from './store/DebugContext.jsx';
import { GraphProvider, useGraph } from './store/GraphContext.jsx';

import { Header } from './components/Header.jsx';
import { LandingPage } from './components/LandingPage.jsx';
import { DecisionInput } from './components/DecisionInput.jsx';
import { GraphCanvas } from './components/GraphCanvas.jsx';
import { DebugPanel } from './components/DebugPanel.jsx';
import { FeatherCursor } from './components/FeatherCursor.jsx';
import { LoaderOverlay } from './components/LoaderOverlay.jsx';

import { PageTransition } from './components/PageTransition.jsx';

import './styles/index.css';
import './styles/notion.css';

function MainAppLayout() {
  const { activeView } = useGraph();

  if (activeView === 'landing') {
    return <LandingPage />;
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">
        <div key={activeView} className="page-view-transition">
          {activeView === 'input' ? (
            <DecisionInput />
          ) : (
            <GraphCanvas />
          )}
        </div>
      </main>
      <DebugPanel />
      <FeatherCursor />
      <LoaderOverlay />
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <DebugProvider>
        <GraphProvider>
          <MainAppLayout />
        </GraphProvider>
      </DebugProvider>
    </SessionProvider>
  );
}
