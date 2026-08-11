/**
 * Comprehensive Dataset for Session: 1786263972176-q2ibfuaj
 * Implements real backend structures with reset expansion state (expanded: false).
 */

export const INITIAL_DECISION_PRESETS = [
  {
    id: "preset-1",
    title: "Global EV & Hydrogen Fleet Transition vs Internal Combustion Refinements",
    category: "Corporate Strategy",
    description: "Evaluating global commercial vehicle fleet decarbonization across battery electric, hydrogen fuel cell, and synthetic fuel ICE powertrains."
  },
  {
    id: "preset-2",
    title: "Migrate Core Monolith to Event-Driven Microservices",
    category: "Architecture",
    description: "Refactoring legacy payment & inventory processing monolith into decentralized Kafka-backed event streams over a 14-month window."
  },
  {
    id: "preset-3",
    title: "Pivot Product Strategy to B2B Enterprise Compliance",
    category: "Product & Market",
    description: "Shifting primary roadmap focus from self-serve SMB tier to SOC2/HIPAA enterprise features and dedicated single-tenant deployments."
  }
];

export const TEST_SESSION_DECISION = {
  sessionId: "1786263972176-q2ibfuaj",
  graphId: "graph-1786263972176",
  decision: "Global EV & Hydrogen Fleet Transition vs Internal Combustion Refinements",
  createdTimestamp: "2026-08-10T18:00:00.000Z",
  nodes: [
    // --- LEVEL 1 NODES ---
    {
      id: "node-1-1",
      level: 1,
      graphLevel: 1,
      title: "Supply Chain & Rare Mineral Dependency",
      label: "Supply Chain & Rare Mineral Dependency",
      category: "Supply Chain",
      domain: "Supply Chain",
      probability: 0.88,
      impactScore: 8.9,
      impact: 8.9,
      description: "Critical bottleneck in battery chemistry lithium/cobalt refining capacities across Tier-1 suppliers.",
      expanded: false,
      parentId: null,
      childrenIds: ["node-2-1", "node-2-2"]
    },
    {
      id: "node-1-2",
      level: 1,
      graphLevel: 1,
      title: "Grid Infrastructure Capacity Constraints",
      label: "Grid Infrastructure Capacity Constraints",
      category: "Infrastructure",
      domain: "Infrastructure",
      probability: 0.76,
      impactScore: 8.2,
      impact: 8.2,
      description: "High-voltage distribution grid transformer overload during peak depot fast-charging windows.",
      expanded: false,
      parentId: null,
      childrenIds: ["node-2-3", "node-2-4"]
    },
    {
      id: "node-1-3",
      level: 1,
      graphLevel: 1,
      title: "Legacy Powertrain Asset Impairment",
      category: "Finance & Assets",
      domain: "Finance & Assets",
      probability: 0.92,
      impactScore: 7.5,
      impact: 7.5,
      description: "Accelerated write-down of $18B in internal combustion engine manufacturing plants and tooling.",
      expanded: false,
      parentId: null,
      childrenIds: ["node-2-5"]
    },

    // --- LEVEL 2 NODES ---
    {
      id: "node-2-1",
      level: 2,
      graphLevel: 2,
      title: "Raw Material Tariff Volatility",
      label: "Raw Material Tariff Volatility",
      category: "Geopolitics",
      domain: "Geopolitics",
      probability: 0.72,
      impactScore: 8.5,
      impact: 8.5,
      description: "Geopolitical trade restrictions trigger 45% spike in battery cell pack manufacturing cost.",
      expanded: false,
      parentId: "node-1-1",
      childrenIds: ["node-3-1"]
    },
    {
      id: "node-2-2",
      level: 2,
      graphLevel: 2,
      title: "Refinery Capacity Lead Time Deficit",
      label: "Refinery Capacity Lead Time Deficit",
      category: "Operations",
      domain: "Operations",
      probability: 0.65,
      impactScore: 7.1,
      impact: 7.1,
      description: "Construction delays on domestic cathode processing facilities push back vehicle delivery targets.",
      expanded: false,
      parentId: "node-1-1",
      childrenIds: ["node-3-2"]
    },
    {
      id: "node-2-3",
      level: 2,
      graphLevel: 2,
      title: "Depot Transformer Overload Risk",
      label: "Depot Transformer Overload Risk",
      category: "Power Grid",
      domain: "Power Grid",
      probability: 0.81,
      impactScore: 9.0,
      impact: 9.0,
      description: "Local utility curtailment mandates restrict depot megawatt charging speeds during daytime shifts.",
      expanded: false,
      parentId: "node-1-2",
      childrenIds: ["node-3-3"]
    },
    {
      id: "node-2-4",
      level: 2,
      graphLevel: 2,
      title: "Hydrogen Storage Fueling Bottlenecks",
      label: "Hydrogen Storage Fueling Bottlenecks",
      category: "Fuel Logistics",
      domain: "Fuel Logistics",
      probability: 0.58,
      impactScore: 7.9,
      impact: 7.9,
      description: "Cryogenic tank compressor maintenance downtime halts long-haul heavy transport routes.",
      expanded: false,
      parentId: "node-1-2",
      childrenIds: ["node-3-4"]
    },
    {
      id: "node-2-5",
      level: 2,
      graphLevel: 2,
      title: "Stranded Factory Asset Depreciation",
      label: "Stranded Factory Asset Depreciation",
      category: "Capital",
      domain: "Capital",
      probability: 0.89,
      impactScore: 8.0,
      impact: 8.0,
      description: "Heavy early impairment charges penalize quarterly EBITDA guidance by 240 basis points.",
      expanded: false,
      parentId: "node-1-3",
      childrenIds: ["node-3-5"]
    },

    // --- LEVEL 3 NODES ---
    {
      id: "node-3-1",
      level: 3,
      graphLevel: 3,
      title: "Vehicle Unit Margin Squeeze",
      label: "Vehicle Unit Margin Squeeze",
      category: "Financial Risk",
      domain: "Financial Risk",
      probability: 0.78,
      impactScore: 9.1,
      impact: 9.1,
      description: "Surging component bills erode gross profit margins below the 12% corporate hurdle rate.",
      expanded: false,
      parentId: "node-2-1",
      childrenIds: ["node-4-1"]
    },
    {
      id: "node-3-2",
      level: 3,
      graphLevel: 3,
      title: "Assembly Line Stoppage",
      label: "Assembly Line Stoppage",
      category: "Manufacturing",
      domain: "Manufacturing",
      probability: 0.62,
      impactScore: 8.4,
      impact: 8.4,
      description: "Shortage of processed nickel forces 3-week temporary shutdown of main electric truck assembly plant.",
      expanded: false,
      parentId: "node-2-2",
      childrenIds: ["node-4-2"]
    },
    {
      id: "node-3-3",
      level: 3,
      graphLevel: 3,
      title: "Fleet Operational Downtime",
      label: "Fleet Operational Downtime",
      category: "Logistics SLA",
      domain: "Logistics SLA",
      probability: 0.85,
      impactScore: 9.3,
      impact: 9.3,
      description: "Uncharged commercial vehicles miss delivery windows, triggering contract performance penalties.",
      expanded: false,
      parentId: "node-2-3",
      childrenIds: ["node-4-3"]
    },
    {
      id: "node-3-4",
      level: 3,
      graphLevel: 3,
      title: "Hydrogen Pipeline Expansion Cost Overrun",
      label: "Hydrogen Pipeline Expansion Cost Overrun",
      category: "CapEx",
      domain: "CapEx",
      probability: 0.48,
      impactScore: 7.6,
      impact: 7.6,
      description: "Specialized high-pressure piping installation exceeds capital budget allocations by $1.4B.",
      expanded: false,
      parentId: "node-2-4",
      childrenIds: ["node-4-4"]
    },
    {
      id: "node-3-5",
      level: 3,
      graphLevel: 3,
      title: "Credit Rating Downgrade Pressure",
      label: "Credit Rating Downgrade Pressure",
      category: "Corporate Credit",
      domain: "Corporate Credit",
      probability: 0.70,
      impactScore: 8.8,
      impact: 8.8,
      description: "Rating agencies place debt on negative watch due to elevated debt-to-capital ratio.",
      expanded: false,
      parentId: "node-2-5",
      childrenIds: ["node-4-5"]
    },

    // --- LEVEL 4 NODES (TERMINAL NODES) ---
    {
      id: "node-4-1",
      level: 4,
      graphLevel: 4,
      title: "Market Share Loss to Incumbent ICE Rivals",
      label: "Market Share Loss to Incumbent ICE Rivals",
      category: "Market Position",
      domain: "Market Position",
      probability: 0.74,
      impactScore: 9.6,
      impact: 9.6,
      description: "Price-sensitive commercial fleets migrate orders to lower-cost hybrid alternatives.",
      expanded: false,
      parentId: "node-3-1",
      childrenIds: []
    },
    {
      id: "node-4-2",
      level: 4,
      graphLevel: 4,
      title: "Quarterly Revenue Guidance Miss",
      label: "Quarterly Revenue Guidance Miss",
      category: "Valuation",
      domain: "Valuation",
      probability: 0.80,
      impactScore: 8.7,
      impact: 8.7,
      description: "Delayed shipments cause 18% sell-off in public stock equity valuation.",
      expanded: false,
      parentId: "node-3-2",
      childrenIds: []
    },
    {
      id: "node-4-3",
      level: 4,
      graphLevel: 4,
      title: "Anchor Enterprise Client Cancellation",
      label: "Anchor Enterprise Client Cancellation",
      category: "Revenue Impact",
      domain: "Revenue Impact",
      probability: 0.68,
      impactScore: 9.7,
      impact: 9.7,
      description: "Top logistics partner terminates multi-year EV delivery contract due to SLA breaches.",
      expanded: false,
      parentId: "node-3-3",
      childrenIds: []
    },
    {
      id: "node-4-4",
      level: 4,
      graphLevel: 4,
      title: "Sub-optimal Fleet Fuel Mix Lock-In",
      label: "Sub-optimal Fleet Fuel Mix Lock-In",
      category: "Strategy",
      domain: "Strategy",
      probability: 0.52,
      impactScore: 8.1,
      impact: 8.1,
      description: "Stranded infrastructure investments force retreat from hydrogen back to conventional fuels.",
      expanded: false,
      parentId: "node-3-4",
      childrenIds: []
    },
    {
      id: "node-4-5",
      level: 4,
      graphLevel: 4,
      title: "Capital Cost Premium Spike",
      label: "Capital Cost Premium Spike",
      category: "Treasury",
      domain: "Treasury",
      probability: 0.75,
      impactScore: 9.0,
      impact: 9.0,
      description: "Borrowing costs increase by 175 basis points across all future corporate bond issuances.",
      expanded: false,
      parentId: "node-3-5",
      childrenIds: []
    }
  ]
};

export const MOCK_ORIGINAL_GRAPH = TEST_SESSION_DECISION;

export const MOCK_EXPANDED_NODES = {
  "node-1-1": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-1-1"),
  "node-1-2": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-1-2"),
  "node-1-3": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-1-3"),
  "node-2-1": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-2-1"),
  "node-2-2": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-2-2"),
  "node-2-3": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-2-3"),
  "node-2-4": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-2-4"),
  "node-2-5": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-2-5"),
  "node-3-1": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-3-1"),
  "node-3-2": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-3-2"),
  "node-3-3": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-3-3"),
  "node-3-4": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-3-4"),
  "node-3-5": TEST_SESSION_DECISION.nodes.filter((n) => n.parentId === "node-3-5")
};

// Preset Alternate Decision Options for Carousel
export const MOCK_ALTERNATE_DECISION_OPTIONS = [
  {
    id: "alt-opt-1",
    title: "Dual Synthetic Fuel & Biofuel Hybrid Fleet Strategy",
    description: "Incorporate sustainable biofuel and e-fuel hybrids for long-haul routes while retaining targeted electric charging for urban last-mile corridors.",
    riskProfile: "Balanced CapEx / High Resilience"
  },
  {
    id: "alt-opt-2",
    title: "Phased Battery Swapping Station Consortium",
    description: "Partner with regional utilities to deploy standardized battery-swapping depots, bypassing high-voltage grid upgrades.",
    riskProfile: "Shared Infrastructure Risk"
  },
  {
    id: "alt-opt-3",
    title: "Retrofit Conversion Kits for Existing ICE Assets",
    description: "Extend asset life by manufacturing modular plug-in hybrid powertrain conversion packages for existing diesel tractor units.",
    riskProfile: "Asset Preservation / Low Cash Burn"
  }
];

// Alternate Graph Data (With alternateImpact affected flags)
export const MOCK_ALTERNATE_GRAPH = {
  alternateGraphId: "alt-graph-1786263972176",
  alternateDecision: "Dual Synthetic Fuel & Biofuel Hybrid Fleet Strategy",
  createdTimestamp: "2026-08-10T18:10:00.000Z",
  nodes: [
    {
      id: "node-1-1",
      level: 1,
      graphLevel: 1,
      title: "Supply Chain & Rare Mineral Dependency",
      label: "Supply Chain & Rare Mineral Dependency",
      category: "Supply Chain",
      domain: "Supply Chain",
      probability: 0.40,
      impactScore: 4.5,
      impact: 4.5,
      description: "Critical bottleneck in battery chemistry lithium/cobalt refining capacities across Tier-1 suppliers.",
      parentId: null,
      alternateImpact: {
        affected: true,
        effectType: "Decreases",
        direction: "Negative",
        reason: "Including hydrogen and sustainable biofuel vehicles reduces battery pack size requirements by 65%, drastically lowering lithium dependency."
      }
    },
    {
      id: "node-1-2",
      level: 1,
      graphLevel: 1,
      title: "Grid Infrastructure Capacity Constraints",
      label: "Grid Infrastructure Capacity Constraints",
      category: "Infrastructure",
      domain: "Infrastructure",
      probability: 0.32,
      impactScore: 3.8,
      impact: 3.8,
      description: "High-voltage distribution grid transformer overload during peak depot fast-charging windows.",
      parentId: null,
      alternateImpact: {
        affected: true,
        effectType: "Mitigated",
        direction: "Positive",
        reason: "Liquid biofuel and synthetic fuel refueling leverages existing liquid pipeline networks, bypassing electrical grid upgrades."
      }
    },
    {
      id: "node-1-3",
      level: 1,
      graphLevel: 1,
      title: "Legacy Powertrain Asset Impairment",
      category: "Finance & Assets",
      domain: "Finance & Assets",
      probability: 0.45,
      impactScore: 4.0,
      impact: 4.0,
      description: "Accelerated write-down of $18B in internal combustion engine manufacturing plants and tooling.",
      parentId: null,
      alternateImpact: {
        affected: true,
        effectType: "Mitigated",
        direction: "Positive",
        reason: "ICE manufacturing tooling repurposed for synthetic fuel combustion engines, preserving 75% of asset book value."
      }
    },
    {
      id: "node-2-1",
      level: 2,
      graphLevel: 2,
      title: "Raw Material Tariff Volatility",
      label: "Raw Material Tariff Volatility",
      category: "Geopolitics",
      domain: "Geopolitics",
      probability: 0.30,
      impactScore: 3.5,
      impact: 3.5,
      description: "Geopolitical trade restrictions trigger 45% spike in battery cell pack manufacturing cost.",
      parentId: "node-1-1",
      alternateImpact: {
        affected: true,
        effectType: "Decreases",
        direction: "Positive",
        reason: "Reduced battery volume insulates company balance sheet from battery mineral tariff spikes."
      }
    },
    {
      id: "node-2-3",
      level: 2,
      graphLevel: 2,
      title: "Depot Transformer Overload Risk",
      label: "Depot Transformer Overload Risk",
      category: "Power Grid",
      domain: "Power Grid",
      probability: 0.25,
      impactScore: 3.0,
      impact: 3.0,
      description: "Local utility curtailment mandates restrict depot megawatt charging speeds during daytime shifts.",
      parentId: "node-1-2",
      alternateImpact: {
        affected: true,
        effectType: "Mitigated",
        direction: "Positive",
        reason: "Biofuel dual-fuel operation eliminates peak charging bottlenecks at fleet depots."
      }
    },
    {
      id: "node-3-1",
      level: 3,
      graphLevel: 3,
      title: "Vehicle Unit Margin Squeeze",
      label: "Vehicle Unit Margin Squeeze",
      category: "Financial Risk",
      domain: "Financial Risk",
      probability: 0.35,
      impactScore: 4.2,
      impact: 4.2,
      description: "Surging component bills erode gross profit margins below the 12% corporate hurdle rate.",
      parentId: "node-2-1",
      alternateImpact: {
        affected: true,
        effectType: "Mitigated",
        direction: "Positive",
        reason: "Lower bill-of-materials cost restores unit gross margins to healthy 18.5%."
      }
    },
    {
      id: "node-4-1",
      level: 4,
      graphLevel: 4,
      title: "Market Share Loss to Incumbent ICE Rivals",
      label: "Market Share Loss to Incumbent ICE Rivals",
      category: "Market Position",
      domain: "Market Position",
      probability: 0.20,
      impactScore: 3.0,
      impact: 3.0,
      description: "Price-sensitive commercial fleets migrate orders to lower-cost hybrid alternatives.",
      parentId: "node-3-1",
      alternateImpact: {
        affected: true,
        effectType: "Diverged",
        direction: "Positive",
        reason: "Flexible multi-fuel fleet portfolio wins major enterprise logistics tenders."
      }
    }
  ]
};

export const MOCK_ALTERNATE_GRAPH_RESPONSES = {
  "alt-opt-1": MOCK_ALTERNATE_GRAPH,
  "alt-opt-2": MOCK_ALTERNATE_GRAPH,
  "alt-opt-3": MOCK_ALTERNATE_GRAPH
};

// Convergence Graph Relationships (Mapping Level 4 -> Level 3 -> Level 2 -> Level 1)
export const MOCK_CONVERGENCE_GRAPH = {
  sessionId: "1786263972176-q2ibfuaj",
  convergenceScore: 74.2,
  divergenceCount: 4,
  relationships: [
    {
      id: "conv-1",
      fromNodeId: "node-4-1",
      fromTitle: "Market Share Loss to Incumbent ICE Rivals",
      fromLevel: 4,
      toNodeId: "node-3-1",
      toTitle: "Vehicle Unit Margin Squeeze",
      toLevel: 3,
      relationship: "Direct Margin Erosion Cascade",
      description: "Unit margin squeeze directly triggers market share loss as pricing becomes non-competitive."
    },
    {
      id: "conv-2",
      fromNodeId: "node-3-1",
      fromTitle: "Vehicle Unit Margin Squeeze",
      fromLevel: 3,
      toNodeId: "node-2-1",
      toTitle: "Raw Material Tariff Volatility",
      toLevel: 2,
      relationship: "Upstream Tariff Cost Pass-Through",
      description: "Tariffs on raw materials drive up cell costs, compressing gross margins."
    },
    {
      id: "conv-3",
      fromNodeId: "node-2-1",
      fromTitle: "Raw Material Tariff Volatility",
      fromLevel: 2,
      toNodeId: "node-1-1",
      toTitle: "Supply Chain & Rare Mineral Dependency",
      toLevel: 1,
      relationship: "Geopolitical Bottleneck Root Cause",
      description: "Mineral concentration in single geographic regions enables tariff leverage."
    },
    {
      id: "conv-4",
      fromNodeId: "node-4-3",
      fromTitle: "Anchor Enterprise Client Cancellation",
      fromLevel: 4,
      toNodeId: "node-3-3",
      toTitle: "Fleet Operational Downtime",
      toLevel: 3,
      relationship: "SLA Failure Contract Termination",
      description: "Extended operational downtime triggers contractual SLA termination clauses."
    },
    {
      id: "conv-5",
      fromNodeId: "node-3-3",
      fromTitle: "Fleet Operational Downtime",
      fromLevel: 3,
      toNodeId: "node-2-3",
      toTitle: "Depot Transformer Overload Risk",
      toLevel: 2,
      relationship: "Charging Delay Bottleneck",
      description: "Transformer curtailment prevents timely vehicle charging during shifts."
    },
    {
      id: "conv-6",
      fromNodeId: "node-2-3",
      fromTitle: "Depot Transformer Overload Risk",
      toLevel: 2,
      toNodeId: "node-1-2",
      toTitle: "Grid Infrastructure Capacity Constraints",
      toLevel: 1,
      relationship: "Grid Distribution Capacity Ceiling",
      description: "High-voltage distribution bottlenecks restrict utility grid supply to charging depots."
    }
  ]
};
