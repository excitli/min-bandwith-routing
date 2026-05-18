import { useEffect, useMemo, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";

function getEdgeColor(utilization = 0) {
  if (utilization >= 1) return "#7f1d1d";
  if (utilization >= 0.85) return "#ef4444";
  if (utilization >= 0.6) return "#f59e0b";
  if (utilization >= 0.3) return "#22c55e";
  return "#3b82f6";
}

export default function NetworkGraph({
  nodes = [],
  edges = [],
  edgeLoads = [],
  onNodeClick,
  onEdgeClick,
  selectedNodes = [],
  graphMode
}) {
  const cyRef = useRef(null);
  const loadMap = useMemo(() => {
    const map = new Map();
    edgeLoads.forEach((item) => {
      map.set(item.edgeId, item);
    });
    return map;
  }, [edgeLoads]);

  const elements = useMemo(() => {
    const cyNodes = nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label || node.id,
        isSelected: selectedNodes.includes(node.id) ? "yes" : "no"
      },
      position: node.position
    }));

    const cyEdges = edges.map((edge) => {
      const loadInfo = loadMap.get(edge.id);
      const load = loadInfo?.load ?? 0;
      const capacity = edge.capacity ?? 0;
      const utilization = loadInfo?.utilization ?? 0;

      return {
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: `w:${edge.weight} | ${load}/${capacity} (${Math.round(utilization * 100)}%)`,
          utilization,
          color: getEdgeColor(utilization)
        }
      };
    });

    return [...cyNodes, ...cyEdges];
  }, [nodes, edges, loadMap, selectedNodes]);

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "background-color": "#2563eb",
        color: "#fff",
        "text-valign": "center",
        "text-halign": "center",
        width: 45,
        height: 45,
        "font-size": 14,
        "border-width": 0
      }
    },
    {
      selector: 'node[isSelected = "yes"]',
      style: {
        "background-color": "#f59e0b",
        "border-width": 4,
        "border-color": "#b45309"
      }
    },
    {
      selector: "edge",
      style: {
        width: "mapData(utilization, 0, 1, 3, 10)",
        label: "data(label)",
        "curve-style": "bezier",
        "target-arrow-shape": "triangle",
        "line-color": "data(color)",
        "target-arrow-color": "data(color)",
        color: "#222",
        "font-size": 10,
        "text-background-color": "#fff",
        "text-background-opacity": 1,
        "text-background-padding": 2
      }
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(undefined, 30);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
        style={{
          width: "100%",
          height: "619px",
          border: "1px solid #d1d5db",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#fff"
      }}
    >
      <CytoscapeComponent
          elements={elements}
          stylesheet={stylesheet}
          layout={{
              name: elements.some(e => e.position) ? "preset" : "cose",
              animate: true,
              padding: 30,
              componentSpacing: 100,
              nodeRepulsion: 400000
          }}
          style={{ width: "100%", height: "100%" }}
          cy={(cy) => {
              cyRef.current = cy;

              setTimeout(() => {
                cy.resize();
                cy.fit(undefined, 30);
              }, 0);

              cy.off("tap", "node");
              cy.off("tap", "edge");

              cy.on("tap", "node", (event) => {
                const nodeId = event.target.id();

                if (onNodeClick) {
                  onNodeClick(nodeId);
                }
              });

              cy.on("tap", "edge", (event) => {
                const edgeId = event.target.id();

                if (onEdgeClick) {
                  onEdgeClick(edgeId);
                }
              });
          }}
      />
    </div>
  );
}