# Backend Data Contract Specification

This document defines the exact data schemas, field types, and semantics for all persisted data structures from the live Railway backend (`https://web-production-13d1f.up.railway.app`) for session **`1786263972176-q2ibfuaj`**.

---

## Overview of Data Structures

| Structure | API Endpoint | Purpose | Primary ID | Session Relation |
|---|---|---|---|---|
| **1. Session / DecisionSession** | `GET /api/sessions/:sessionId` | Core session metadata & generation status | `sessionId` | `sessionId` |
| **2. World State** | `GET /api/world-state/:sessionId` | Strategic context, root decision text & domain metrics | `sessionId` | `sessionId` |
| **3. Original Graph Nodes** | `GET /api/nodes/session/:sessionId` | Node documents constructing the decision tree | `id` | `sessionId` |
| **4. Alternate Decision Cards** | `GET /api/alternate-decisions/:sessionId` | Alternate counter-strategy selection cards | `alternateId` | `sessionId` |
| **5. Alternate Graph** | `GET /api/alternate-decisions/:sessionId/:alternateId/graph` | Separate tree graph evaluating alternate decision impact | `id` | `sessionId` + `alternateId` |
| **6. Convergence Graph** | `GET /api/alternate-decisions/:sessionId` (document with `convergence` array) | Causal relationships linking downstream nodes to upstream nodes | `fromNodeId` + `toNodeId` | `sessionId` |

---

## 1. SESSION / DECISION SESSION

### Collection: `decision_session`
### Model: `DecisionSession`

| Field | Type | Meaning | Frontend Usage |
|---|---|---|---|
| `_id` | `string (ObjectId)` | MongoDB primary key | Internal record identifier |
| `sessionId` | `string` | Unique session identifier (`1786263972176-q2ibfuaj`) | Header status pill & API request parameter |
| `decision` | `string` | Original prompt string (or `undefined`) | Fallback title if world-state is loading |
| `status` | `string` | Session status (`"expanded"`, `"processing"`, `"completed"`) | Session lifecycle status indicator |
| `maxDepth` | `number` | Maximum tree depth reached (e.g. `4`) | Depth progress bar ceiling |
| `currentDepth` | `number` | Current tree depth | Active depth progress |
| `generatedNodes` | `number` | Total number of nodes generated in session (e.g. `64` / `136`) | Node count metadata |
| `createdAt` | `string (ISO)` | Creation timestamp | Session initialization time |
| `updatedAt` | `string (ISO)` | Last update timestamp | Last activity time |

---

## 2. WORLD STATE

### Collection: `world_state`
### Model: `WorldState`

| Field | Type | Meaning | Frontend Usage |
|---|---|---|---|
| `_id` | `string (ObjectId)` | MongoDB primary key | Internal record identifier |
| `sessionId` | `string` | Session identifier (`1786263972176-q2ibfuaj`) | Session relation |
| `decision` | `string` | **Root Decision Prompt** (*"A government should transition all public-sector vehicles..."*) | **Top Root Card in Vertical Tree** |
| `domains` | `array of strings` | Primary domains affected (e.g. `["Transportation", "Energy", "Government"]`) | Strategic domain pills |
| `assumptions` | `array of strings` | Core baseline assumptions | Contextual metadata in Info Panel |
| `summary` | `string` | Executive summary of decision environment | High-level summary text |
| `graphSummary` | `object / string` | Summary metrics of generated tree | Graph metadata |
| `statistics` | `object` | Quantitative domain impact statistics | Analytics cards |
| `lastUpdated` | `string (ISO)` | World state timestamp | Sync timestamp |
| `createdAt` | `string (ISO)` | Creation timestamp | System metadata |
| `updatedAt` | `string (ISO)` | Update timestamp | System metadata |

---

## 3. ORIGINAL GRAPH NODES

### Collection: `nodes_collection`
### Model: `NodeItem`

| Field | Type | Meaning | Frontend Usage |
|---|---|---|---|
| `_id` | `string (ObjectId)` | MongoDB primary key | Database identifier |
| `id` | `string` | Unique node identifier (`"1786263972176-q2ibfuaj_node3"`) | **React key & parent-child mapping** |
| `sessionId` | `string` | Session ID (`"1786263972176-q2ibfuaj"`) | Request filter & verification |
| `graphLevel` | `number` | Tree level (1 = Primary, 2 = Ripple, 3 = Downstream, 4 = Terminal) | **Vertical tree level placement** |
| `label` | `string` | Compact title of node consequence | **Compact Node Card Title** |
| `description` | `string` | Full detailed node explanation | **Right Info Panel Description** |
| `domain` | `string` | Node category / domain (e.g. `"Government"`, `"Transportation"`) | Domain tag badge |
| `impact` | `object / number` | Impact values by domain (e.g. `{ Transportation: 40, Government: 85 }`) | Impact severity calculation & visualization |
| `expanded` | `boolean` | Backend-controlled state (`true` / `false`) | **Controls whether child nodes render underneath** |
| `parentId` | `string \| null` | Parent node ID (`null` for Level 1) | **Determines vertical tree parent** |
| `childrenIds` | `array of strings` | Array of direct child node IDs | **Determines child branch relationships** |
| `expansionPrompt` | `object` | Reasoning path & prompt metadata used during generation | Debug inspect info |
| `createdAt` | `string (ISO)` | Creation timestamp | Audit timestamp |
| `updatedAt` | `string (ISO)` | Update timestamp | Sync timestamp |

---

## 4. ALTERNATE DECISION CARDS

### Collection: `alternate_decisions`
### Model: `AlternateDecision`

| Field | Type | Meaning | Frontend Usage |
|---|---|---|---|
| `_id` | `string (ObjectId)` | MongoDB primary key | Database identifier |
| `sessionId` | `string` | Session ID (`"1786263972176-q2ibfuaj"`) | Filter for session cards |
| `alternateId` | `string` | Unique alternate ID (`"alt_001"`, `"alt_002"`, `"alt_003"`) | **Identifier for fetching alternate graph** |
| `strategyType` | `string` | Strategy type (e.g. `"Hybrid"`, `"Conditional"`, `"Decentralize"`) | Carousel strategy tag |
| `tagline` | `string` | One-line headline summary of alternate approach | **Carousel Headline Title** |
| `decision` | `string` | Full alternate decision specification | **Carousel Card Description** |
| `whyDifferent` | `string` | Core rationale explaining why counter-move differs | Carousel detail explanation |
| `keyChanges` | `array of strings` | Bullet points of major operational changes | Carousel key changes list |
| `expectedOutcome` | `string` | Predicted overall outcome | Outcome text |
| `affectedDomains` | `array of strings` | Domains impacted by alternate choice | Affected domain badges |
| `impactScore` | `number` | Overall impact rating (0-100) | Impact metric pill |
| `riskScore` | `number` | Overall risk rating (0-100) | Risk metric pill |
| `feasibilityScore` | `number` | Overall feasibility rating (0-100) | Feasibility metric pill |
| `previewMetrics` | `object` | `{ impact, risk, feasibility }` | Quick metric gauge |
| `impactBreakdown` | `object` | Impact score by domain | Domain impact radar/bars |
| `outcomeBreakdown` | `object` | `{ Positive, Negative, Neutral }` | Sentiment breakdown bar |
| `advantages` | `array of strings` | Pros of alternate strategy | Advantages bullet list |
| `tradeoffs` | `array of strings` | Cons and risks of alternate strategy | Tradeoffs bullet list |
| `timeHorizon` | `string` | Execution timeframe (e.g. `"5–10 years"`) | Time horizon pill |

---

## 5. ALTERNATE GRAPH

### Collection: `alternate_graph_nodes`
### Model: `AlternateGraphNode`

| Field | Type | Meaning | Frontend Usage |
|---|---|---|---|
| `_id` | `string (ObjectId)` | MongoDB primary key | Database identifier |
| `sessionId` | `string` | Session ID (`"1786263972176-q2ibfuaj"`) | Session relation |
| `alternateId` | `string` | Alternate decision ID (`"alt_002"`) | Alternate graph relation |
| `id` | `string` | Unique node identifier (`"1786263972176-q2ibfuaj_node1"`) | React key & tree node identity |
| `graphLevel` | `number` | Hierarchy level (1..4) | Vertical level placement |
| `label` | `string` | Compact title of node | Node Card Title |
| `description` | `string` | **ORIGINAL UNCHANGED DESCRIPTION** | Right Info Panel Description |
| `domain` | `string` | Domain category | Domain tag badge |
| `impact` | `object / number` | Impact breakdown object | Impact metrics |
| `parentId` | `string \| null` | Parent node ID | Tree relationship |
| `alternateImpact` | `object` | Impact annotation object | **Visual affected indicator & hover popover** |
| `alternateImpact.affected` | `boolean` | `true` if node is changed by alternate strategy | **Triggers restrained Paperism ink styling** |
| `alternateImpact.effectType` | `string` | Effect type (e.g. `"Modifies"`, `"Decreases"`, `"Mitigated"`) | **Hover Popover Effect Label** |
| `alternateImpact.direction` | `string` | Impact direction (e.g. `"Mixed"`, `"Positive"`, `"Negative"`) | **Hover Popover Direction Tag** |
| `alternateImpact.reason` | `string` | Detailed explanation of alternate impact | **Hover Popover Reason Text** |

---

## 6. CONVERGENCE GRAPH / CONVERGENCE RELATIONSHIPS

### Embedded in: `alternate_decisions` collection (document with `alternateId: null` & `graphType: "LAST"`)

| Field | Type | Meaning | Frontend Usage |
|---|---|---|---|
| `sessionId` | `string` | Session ID (`"1786263972176-q2ibfuaj"`) | Session relation |
| `convergence` | `array of objects` | Array of causal relationship items | **Convergence graph relationship list** |
| `convergence[].fromNodeId` | `string` | ID of downstream node (e.g. Level 4 / Level 3 node ID) | **Origin node reference** |
| `convergence[].toNodeId` | `string` | ID of target node toward which consequence converges | **Target node reference** |
| `convergence[].relationship` | `string` | Explanation of why downstream node contributes to target node | **Causal relationship text shown on hover/click** |

> [!IMPORTANT]
> **Convergence Semantics**: The convergence structure does NOT create new nodes. It references existing `id` values of original graph nodes to map causal links (e.g. Level 4 → Level 3 → Level 2 → Level 1).
