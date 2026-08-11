# API Data Flow & Endpoint Specification

This document details the exact API endpoints, HTTP methods, request payloads, response contract schemas, frontend consumer components, polling loops, and state mutation behaviors for the Railway backend service (`https://web-production-13d1f.up.railway.app`).

---

## Endpoint Summary Matrix

| Operation | HTTP Method | Endpoint URL | Request Body | Response Object | Consumer Component | Polling? | Modifies Backend? |
|---|---|---|---|---|---|---|---|
| **1. Session Retrieval** | `GET` | `/api/sessions/:sessionId` | None | Session metadata | `SessionContext` / `Header` | No | No |
| **2. World State Retrieval** | `GET` | `/api/world-state/:sessionId` | None | World State object | `GraphContext` / `GraphCanvas` (Root Node) | No | No |
| **3. Original Graph Retrieval** | `GET` | `/api/nodes/session/:sessionId` | None | Array of 136 node items | `GraphContext` / `GraphCanvas` | Initial & Polling | No |
| **4. Original Node Expansion** | `PATCH` | `/api/nodes/:nodeId` | `{ "expanded": true }` | Updated node object | `InfoPanel` / `CompactTreeNode` | Followed by GET polling | Yes |
| **5. Alternate Cards Retrieval** | `GET` | `/api/alternate-decisions/:sessionId` | None | Array of 5 alternate card objects | `AlternateSection` (Carousel) | No | No |
| **6. Alternate Graph Retrieval** | `GET` | `/api/alternate-decisions/:sessionId/:alternateId/graph` | None | Array of 14 alternate graph nodes | `GraphCanvas` (Alternate View) | No | No |
| **7. Convergence Graph Retrieval** | `GET` | `/api/alternate-decisions/:sessionId` | None | Document containing `convergence` array | `ConvergenceGraphView` | No | No |

---

## Data Flow Specifications

### 1. Session Retrieval
- **URL**: `https://web-production-13d1f.up.railway.app/api/sessions/1786263972176-q2ibfuaj`
- **Method**: `GET`
- **Request Parameters**: `sessionId` in URL path
- **Response Structure**:
  ```json
  {
    "success": true,
    "message": "Decision session retrieved successfully",
    "data": {
      "sessionId": "1786263972176-q2ibfuaj",
      "status": "expanded",
      "maxDepth": 4,
      "currentDepth": 4,
      "generatedNodes": 64
    }
  }
  ```
- **Consumer**: `SessionContext` & `Header`
- **Polling**: No
- **State Mutation**: Read-only

---

### 2. World State Retrieval
- **URL**: `https://web-production-13d1f.up.railway.app/api/world-state/1786263972176-q2ibfuaj`
- **Method**: `GET`
- **Request Parameters**: `sessionId` in URL path
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "1786263972176-q2ibfuaj",
      "decision": "A government should transition all public-sector vehicles to electric vehicles by 2032, while providing subsidies for charging infrastructure and workforce reskilling.",
      "domains": ["Transportation", "Energy", "Government", "Employment"],
      "assumptions": ["Battery costs decline 5% annually"],
      "summary": "High consequence fleet transition strategy..."
    }
  }
  ```
- **Consumer**: `GraphCanvas` (populates top ROOT DECISION CARD) & `InfoPanel`
- **Polling**: No
- **State Mutation**: Read-only

---

### 3. Original Graph Retrieval
- **URL**: `https://web-production-13d1f.up.railway.app/api/nodes/session/1786263972176-q2ibfuaj`
- **Method**: `GET`
- **Request Parameters**: `sessionId` in URL path
- **Response Structure**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "1786263972176-q2ibfuaj_node3",
        "sessionId": "1786263972176-q2ibfuaj",
        "graphLevel": 1,
        "label": "Higher upfront capital expenditure for public vehicle procurement",
        "domain": "Government",
        "description": "Purchasing electric or alternative fuel vehicles involves higher initial costs...",
        "impact": { "Transportation": 40, "Energy": 30, "Government": 85, "Employment": 25 },
        "expanded": false,
        "parentId": null,
        "childrenIds": ["1786263972176-q2ibfuaj_1786276280_0", "1786263972176-q2ibfuaj_1786276280_1"]
      }
    ]
  }
  ```
- **Consumer**: `GraphContext` & `GraphCanvas` (populates vertical decision tree)
- **Polling**: Executed initially on load, and polled during node expansion
- **State Mutation**: Read-only

---

### 4. Original Node Expansion & Polling Loop
- **Step 4A: Send Update Request**
  - **URL**: `https://web-production-13d1f.up.railway.app/api/nodes/:nodeId`
  - **Method**: `PATCH`
  - **Request Body**:
    ```json
    {
      "expanded": true
    }
    ```
  - **Response**: `{ "success": true, "data": { "id": ":nodeId", "expanded": true } }`
  - **State Mutation**: Modifies backend node `expanded` field in MongoDB Atlas.

- **Step 4B: Branch Polling Loop**
  - **Method**: `GET` `https://web-production-13d1f.up.railway.app/api/nodes/session/1786263972176-q2ibfuaj`
  - **Polling Frequency**: Every 1.5 seconds until children exist in the backend response.
  - **UI State**: Expanding branch renders inline pill `"Nodes still generating..."` on the affected parent node (**no full-page spinner**).
  - **Completion**: Once children arrive, child nodes render vertically underneath parent node, and polling stops.

---

### 5. Alternate Decision Cards Retrieval
- **URL**: `https://web-production-13d1f.up.railway.app/api/alternate-decisions/1786263972176-q2ibfuaj`
- **Method**: `GET`
- **Request Parameters**: `sessionId` in URL path
- **Response Structure**: Array of alternate decision objects containing `alternateId`, `strategyType`, `tagline`, `decision`, `whyDifferent`, `keyChanges`, `tradeoffs`, `advantages`, `previewMetrics`.
- **Consumer**: `AlternateSection` (populates horizontal carousel cards)
- **Polling**: No
- **State Mutation**: Read-only

---

### 6. Alternate Graph Retrieval
- **URL**: `https://web-production-13d1f.up.railway.app/api/alternate-decisions/1786263972176-q2ibfuaj/:alternateId/graph` (e.g. `:alternateId = alt_002`)
- **Method**: `GET`
- **Request Parameters**: `sessionId` and `alternateId` in URL path
- **Response Structure**: Array of 14 alternate graph nodes containing `id`, `graphLevel`, `label`, `description`, `domain`, `impact`, `parentId`, and `alternateImpact` (`affected`, `effectType`, `direction`, `reason`).
- **Consumer**: `GraphCanvas` (renders separate Alternate Tree view)
- **Polling**: No
- **State Mutation**: Read-only (does NOT mutate original graph)

---

### 7. Convergence Graph Retrieval
- **URL**: `https://web-production-13d1f.up.railway.app/api/alternate-decisions/1786263972176-q2ibfuaj`
- **Method**: `GET`
- **Request Parameters**: `sessionId` in URL path
- **Document Identification**: Filters array item where `convergence` array exists.
- **Response Structure**:
  ```json
  {
    "sessionId": "1786263972176-q2ibfuaj",
    "graphType": "LAST",
    "convergence": [
      {
        "fromNodeId": "1786263972176-q2ibfuaj_1786271184_0",
        "toNodeId": "1786263972176-q2ibfuaj_1786271056_0",
        "relationship": "Extended repair times reduce operational vehicles and transportation throughput"
      }
    ]
  }
  ```
- **Consumer**: `ConvergenceGraphView`
- **Polling**: No
- **State Mutation**: Read-only (references existing node IDs)
