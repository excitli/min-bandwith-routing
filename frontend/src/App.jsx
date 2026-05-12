import React, { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import NetworkGraph from "./components/NetworkGraph";
import ResultsPanel from "./components/ResultsPanel";
import { mockNetwork } from "./data/MockData";
import {
  createTopology,
  createDemands,
  createOptimization,
  saveOptimizationResult
} from "./api/NetworkApi";

function App() {
  const [graphRow, setGraphRow] = useState("Выберите способ работы с графом")
  const [mode, setMode] = useState("BIFURCATED");
  const [type, setType] = useState("NAX_FREE_CAP");
  const [result, setResult] = useState(null);
  const [demands, setDemands] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [topologyName, setTopologyName] = useState("");

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
    setLoading(true);
    setErrorMessage("");

    if (!topologyName.trim()) {
      setErrorMessage("Введите название топологии");
      return;
    }

    if (edges.length === 0) {
      setErrorMessage("Добавьте хотя бы одно ребро");
      return;
    }

    if (demands.length === 0) {
      setErrorMessage("Добавьте хотя бы один demand");
      return;
    }

    const topologyPayload = {
      name: topologyName,
      edges: edges.map((edge) => ({
        source: Number(edge.source),
        target: Number(edge.target),
        capacity: Number(edge.capacity),
        weight: Number(edge.weight)
      }))
    };

    const topologyResponse = await createTopology(topologyPayload);

    const scenarioId = topologyResponse["Success. scenario_id"];

    const demandsPayload = {
      scenario_id: scenarioId,
      demands: demands.map((demand) => ({
        source: Number(demand.source),
        target: Number(demand.target),
        traffic: Number(demand.traffic)
      }))
    };

    await createDemands(demandsPayload);

    const optimizationPayload = {
      scenario_id: scenarioId,
      k_paths: 3,
      routing_type: mode,
      optimization_objective: type
    };

    const optimizationResponse = await createOptimization(optimizationPayload);

    const edgeLoadMap = {};

    optimizationResponse.results.paths.forEach((pathObj) => {
      const pathNodes = pathObj.nodes;
      const flow = pathObj.flow;

      for (let i = 0; i < pathNodes.length - 1; i++) {
        const edgeId = `${pathNodes[i]}-${pathNodes[i + 1]}`;

        if (!edgeLoadMap[edgeId]) {
          edgeLoadMap[edgeId] = 0;
        }

        edgeLoadMap[edgeId] += flow;
      }
    });

    const edgeLoads = edges.map((edge) => {
      const load = edgeLoadMap[edge.id] || 0;

      return {
        edgeId: edge.id,
        load,
        utilization: load / edge.capacity
      };
    });

    const normalizedResult = {
      objective: optimizationResponse.results.objective_value,
      paths: optimizationResponse.results.paths.map((item) => ({
        demandId: item.path_id,
        path: item.nodes,
        flow: item.flow
      })),
      edgeLoads
    };

    setResult(normalizedResult);

    await saveOptimizationResult({
      scenario_id: scenarioId,
      objective: type,
      routing_type: mode,
      objective_value: optimizationResponse.results.objective_value,
      paths: optimizationResponse.results.paths,
      duals: optimizationResponse.results.duals || []
    });

  } catch (error) {
    console.error(error);

    if (error.response?.data?.detail) {
      setErrorMessage(error.response.data.detail);
    } else {
      setErrorMessage("Ошибка сервера");
    }
  } finally {
    setLoading(false);
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
    const newNodeId = String(nextNodeNumber);

    const newNode = {
      id: newNodeId,
      label: String(nextNodeNumber),
      position: {
        x: 150 + Math.random() * 400,
        y: 120 + Math.random() * 300
      }
    };

    setNodes((prev) => [...prev, newNode]);
    setNodeCounter((prev) => prev + 1);
    setGraphRow(`⚠️  Узел ${nextNodeNumber} добавлен`);
  };

  const handleDeleteNodeMode = () => {
    setGraphMode((prev) => (prev === "deleteNode" ? "none" : "deleteNode"));
    setGraphRow("⚠️  Нажмите узел, который хотите удалить");
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
      setGraphRow("⚠️  Вес и пропуск должны быть числами");
      return;
    }

    setGraphRow("⚠️  Выберите первый узел");
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
      setGraphRow("⚠️  Выберите второй узел");
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

          setGraphRow(`⚠️  Ребро между узлами ${sourceId} и ${targetId} создано`);
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
      <h1 style={{ marginTop: 0 }}>Маршрутизация с минимальной пропускной способностью</h1>

      {
        errorMessage && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
              border: "1px solid #fecaca"
            }}
          >
            {errorMessage}
          </div>
        )
      }

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
          graphRow={graphRow}
          topologyName={topologyName}
          loading={loading}

          setType={setType}
          setMode={setMode}
          setEdgeWeight={setEdgeWeight}
          setEdgeCapacity={setEdgeCapacity}
          setGraphRow={setGraphRow}
          setTopologyName={setTopologyName}

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