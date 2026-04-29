import React, { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import NetworkGraph from "./components/NetworkGraph";
import ResultsPanel from "./components/ResultsPanel";
import { mockNetwork } from "./data/MockData";
import { createTopology, createDemands, createOptimization } from "./api/NetworkApi";

function App() {
  const [mode, setMode] = useState("BIFURCATED");
  const [type, setType] = useState("NAX_FREE_CAP");
  const [result, setResult] = useState(null);
  const [demands, setDemands] = useState([]);

  const [nodes, setNodes] = useState(
    mockNetwork.nodes.map((node, index) => ({
      ...node,
      position: {
        x: 180 + index * 120,
        y: index % 2 === 0 ? 220 : 320
      }
    }))
  );

  const [edgeWeight, setEdgeWeight] = useState("");
  const [edgeCapacity, setEdgeCapacity] = useState("");
  const [edges, setEdges] = useState(mockNetwork.edges);
  const [graphMode, setGraphMode] = useState("none");
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [nodeCounter, setNodeCounter] = useState(mockNetwork.nodes.length);

  const handleRun = async () => {
    try {
      console.log("Запуск режима:", mode);

      if (edges.length === 0) {
        alert("Добавь хотя бы одно ребро");
        return;
      }

      if (demands.length === 0) {
        alert("Добавь хотя бы один demand");
        return;
      }

      const hasInvalidInput = edges.some((edge) => {
        const source = Number(edge.source);
        const target = Number(edge.target);
        const weight = Number(edge.weight);
        const capacity = Number(edge.capacity);

        return (
          !Number.isInteger(source) || source <= 0 ||
          !Number.isInteger(target) || target <= 0 ||
          !Number.isInteger(weight) || weight <= 0 ||
          !Number.isInteger(capacity) || capacity <= 0
        );
      });

      if (hasInvalidInput) {
        alert("Есть неверные данные в ребрах");
        return;
      }

      const topologyPayload = {
        name: "test topology",
        edges: edges.map((edge) => ({
          source: Number(edge.source),
          target: Number(edge.target),
          capacity: Number(edge.capacity),
          weight: Number(edge.weight)
        }))
      };

      console.log("Topology payload:", topologyPayload);

      const topologyResponse = await createTopology(topologyPayload);
      console.log("Topology saved:", topologyResponse);

      const scenarioId = topologyResponse["Success. scenario_id"];

      const nodeIds = new Set(nodes.map((node) => Number(node.id)));

      const hasInvalidDemand = demands.some((demand) => {
        const source = Number(demand.source);
        const target = Number(demand.target);
        const traffic = Number(demand.traffic);

        return (
          !nodeIds.has(source) ||
          !nodeIds.has(target) ||
          source == target ||
          !Number.isInteger(traffic) ||
          traffic <= 0
        );
      })

      if (hasInvalidDemand) {
        alert("Есть некорректные demands или узлы demand отсутствуют в графе");
        return;
      }

      const demandsPayload = {
        scenario_id: scenarioId,
        demands: demands.map((demand) => ({
          source: Number(demand.source),
          target: Number(demand.target),
          traffic: Number(demand.traffic)
        }))
      };

      console.log("Demands payload:", demandsPayload);

      const demandsResponse = await createDemands(demandsPayload);
      console.log("Demands saved:", demandsResponse);

      const optimizationPayload = {
        scenario_id: scenarioId,
        k_paths: 3,
        routing_type: mode,
        optimization_objective: type
      };

      console.log("Optimization payload:", optimizationPayload);

      const optimizationResponse = await createOptimization(optimizationPayload);
      console.log("Optimization result:", optimizationResponse);

      const normalizedResult = {
        objective: optimizationResponse.results.objective_value,
        paths: optimizationResponse.results.paths.map((item) => ({
          demandId: item.path_id,
          path: item.nodes,
          flow: item.flow
        })),
        edgeLoads: []
      };

      setResult(normalizedResult);
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Data:", JSON.stringify(error.response?.data, null, 2));
      console.error("Full error:", error);
    }
  };

  const handleAddDemand = (newDemand) => {
    setDemands((prev) => [...prev, newDemand]);
  };

  const deleteCurDemand = ((demandId) => {
    setDemands((prev) => prev.filter((demand) => demand.id !==demandId));
  });

  const deleteAllDemands = () => {
    setDemands([]);
  };

  const handleAddNode = () => {
    const nextNodeNumber = nodeCounter + 1;
    const newNodeId = nextNodeNumber;

    const newNode = {
      id: newNodeId,
      label: nextNodeNumber,
      position: {
        x: 150 + Math.random() * 400,
        y: 120 + Math.random() * 300
      }
    };

    setNodes((prev) => [...prev, newNode]);
    setNodeCounter((prev) => prev + 1);
  };

  const handleDeleteNodeMode = () => {
    setGraphMode((prev) => (prev === "deleteNode" ? "none" : "deleteNode"));
    setSelectedNodes([]);
  };

  const handleAddEdgeMode = () => {
    const parsedWeight = Number(edgeWeight);
    const parsedCapacity = Number(edgeCapacity);

    const isValidWeight =
      Number.isInteger(parsedWeight) && parsedWeight > 0;
    const isValidCapacity =
      Number.isInteger(parsedCapacity) && parsedCapacity > 0;

    if (!isValidWeight || !isValidCapacity) {
      alert("Weight и Capacity должны быть положительными целыми числами");
      return;
    }

    setGraphMode((prev) => (prev === "addEdge" ? "none" : "addEdge"));
    setSelectedNodes([]);
  };

  const handleNodeClick = (nodeId) => {
    if (graphMode === "deleteNode") {
      setEdges((prevEdges) =>
        prevEdges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );

      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));

      setGraphMode("none");
      setSelectedNodes([]);
      return;
    }

    if (graphMode === "addEdge") {
      setSelectedNodes((prevSelected) => {
        const updatedSelected = [...prevSelected, nodeId];

        if (updatedSelected.length === 2) {
          const [sourceId, targetId] = updatedSelected;

          if (sourceId === targetId) {
            alert("Нельзя соединить узел сам с собой");
            setGraphMode("none");
            return [];
          }

          const parsedWeight = Number(edgeWeight);
          const parsedCapacity = Number(edgeCapacity);

          setEdges((prevEdges) => {
            const edgeExists = prevEdges.some(
              (edge) =>
                edge.source === sourceId && edge.target === targetId
            );

            if (edgeExists) {
              return prevEdges;
            }

            const newEdges = [
              ...prevEdges,
              {
                id: `${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                weight: parsedWeight,
                capacity: parsedCapacity
              }
            ];
            console.log("New edges:", newEdges);
            return newEdges;
          });

          setGraphMode("none");
          setEdgeCapacity("");
          setEdgeWeight("");
          return [];
        }

        return updatedSelected;
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "24px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1 style={{ marginTop: 0 }}>Minimum Bandwidth Routing</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr 320px",
          gap: "16px",
          alignItems: "start"
        }}
      >
        <ControlPanel
          mode={mode}
          type={type}
          edgeWeight={edgeWeight}
          edgeCapacity={edgeCapacity}
          setType={setType}
          setMode={setMode}
          setEdgeWeight={setEdgeWeight}
          setEdgeCapacity={setEdgeCapacity}
          onRun={handleRun}
          onAddNode={handleAddNode}
          onDeleteNodeMode={handleDeleteNodeMode}
          onAddEdgeMode={handleAddEdgeMode}
          onAddDemand={handleAddDemand}
        />

        <NetworkGraph
          nodes={nodes}
          edges={edges}
          edgeLoads={result?.edgeLoads || []}
          onNodeClick={handleNodeClick}
          graphMode={graphMode}
          selectedNodes={selectedNodes}
        />

        <ResultsPanel
          result={result}
          demands={demands}
          deleteCurDemand={deleteCurDemand}
          deleteAllDemands={deleteAllDemands}
        />
      </div>
    </div>
  );
}

export default App;