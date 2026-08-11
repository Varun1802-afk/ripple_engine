import React from 'react';
import { useDebug } from '../store/DebugContext.jsx';
import { Terminal, X, Trash2, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

export function DebugPanel() {
  const {
    requestLogs,
    selectedLogIndex,
    setSelectedLogIndex,
    isDebugPanelOpen,
    toggleDebugPanel,
    clearLogs,
    currentLog
  } = useDebug();

  if (!isDebugPanelOpen) return null;

  return (
    <div className="debug-panel-drawer">
      {/* Debug Header */}
      <div className="debug-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} color="#A6E22E" />
          <span style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0.05em' }}>
            DEVELOPER INSPECT PANEL // REQUEST CONTRACT LOGS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-notion btn-notion"
            onClick={clearLogs}
            style={{ padding: '2px 8px', fontSize: '11px', color: '#E2E2DC', borderColor: '#444' }}
            title="Clear logged requests"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>

          <button
            onClick={toggleDebugPanel}
            style={{ background: 'none', border: 'none', color: '#E2E2DC', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Debug Body */}
      <div className="debug-body">
        {/* Left List of Logged Requests */}
        <div className="debug-logs-list">
          {requestLogs.length === 0 ? (
            <div style={{ padding: '16px', fontSize: '11px', color: '#777', textAlign: 'center' }}>
              No API requests logged yet. Perform an action to inspect payloads.
            </div>
          ) : (
            requestLogs.map((log, idx) => {
              const isSelected = idx === selectedLogIndex;
              return (
                <div
                  key={idx}
                  className={`debug-log-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedLogIndex(idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: log.method === 'PATCH' ? '#FD971F' : '#66D9EF' }}>
                      {log.method}
                    </span>
                    <span style={{ fontSize: '10px', color: '#888' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: log.isUrlConfigured ? '#A6E22E' : '#E6DB74', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.endpointName.split(' ')[0]}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Inspector Details View */}
        <div className="debug-inspector">
          {currentLog ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* 1. Endpoint & Status Header */}
              <div style={{ borderBottom: '1px solid #333330', paddingBottom: '10px' }}>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>TARGET WORKFLOW ENDPOINT</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: currentLog.isUrlConfigured ? '#A6E22E' : '#E6DB74' }}>
                  {currentLog.url}
                </div>
                <div style={{ fontSize: '11px', color: '#AAA', marginTop: '2px' }}>
                  Action: {currentLog.endpointName}
                </div>
              </div>

              {/* 2. HTTP Method & Session ID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#888' }}>HTTP METHOD</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#66D9EF' }}>{currentLog.method}</div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#888' }}>SESSION ID</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#AE81FF' }}>{currentLog.sessionId}</div>
                </div>
              </div>

              {/* 3. Request Body Payload */}
              <div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>REQUEST BODY PAYLOAD</div>
                <pre className="debug-json-code">
                  {JSON.stringify(currentLog.requestBody, null, 2)}
                </pre>
              </div>

              {/* 4. Response Expected by Frontend */}
              <div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>RESPONSE EXPECTED BY FRONTEND</div>
                <pre className="debug-json-code" style={{ color: '#66D9EF' }}>
                  {JSON.stringify(currentLog.expectedResponseSchema, null, 2)}
                </pre>
              </div>

            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              Select a request from the left panel to inspect its exact payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
