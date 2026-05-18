import { useState } from "react";
import ControlPanel from "./components/ControlPanel";
import NetworkGraph from "./components/NetworkGraph";
import ResultsPanel from "./components/ResultsPanel";
import { mockNetwork } from "./data/MockData";

function circularPosition(index, total, cx = 400, cy = 300, radius = 220) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}
import {
  createTopology,
  createDemands,
  createOptimization,
  saveOptimizationResult,
  getOptimizationResults,
  getTopologyById,
  deleteAllDemands as deleteAllDemandsApi
} from "./api/NetworkApi";

function App() {
  const [graphRow, setGraphRow] = useState("Выберите способ работы с графом")
  const [mode, setMode] = useState("BIFURCATED");
  const [type, setType] = useState("NAX_FREE_CAP");
  const [result, setResult] = useState(null);
  const [demands, setDemands] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [topologyIdInput, setTopologyIdInput] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [nodes, setNodes] = useState(
    mockNetwork.nodes.map((node, index, arr) => ({
      ...node,
      position: circularPosition(index, arr.length)
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
    setResult(null);

    if (edges.length === 0) {
      setErrorMessage("Добавьте хотя бы одно ребро");
      return;
    }

    if (demands.length === 0) {
      setErrorMessage("Добавьте хотя бы один demand");
      return;
    }

    let scenarioIdToUse = selectedScenarioId;

    if (!isEditing || !scenarioIdToUse) {
      const topologyPayload = {
        name: `topology_${Date.now()}`,
        edges: edges.map((edge) => ({
          source: Number(edge.source),
          target: Number(edge.target),
          capacity: Number(edge.capacity),
          weight: Number(edge.weight)
        }))
      };
      console.log("TOPOLOGY PAYLOAD:", JSON.stringify(topologyPayload, null, 2));

      const topologyResponse = await createTopology(topologyPayload);

      console.log("TOPOLOGY RESPONSE:", topologyResponse);

      scenarioIdToUse =
        topologyResponse?.["Success. scenario_id"] ??
        topologyResponse?.scenario_id ??
        topologyResponse?.data?.scenario_id;

      if (!scenarioIdToUse) {
        throw new Error("scenario_id не получен после createTopology");
      }

      setSelectedScenarioId(scenarioIdToUse);
      setIsEditing(true);
    }

    const demandsPayload = {
      scenario_id: scenarioIdToUse,
      demands: demands.map((demand) => ({
        source: Number(demand.source),
        target: Number(demand.target),
        traffic: Number(demand.traffic)
      }))
    };

    console.log("DEMANDS PAYLOAD:", JSON.stringify(demandsPayload, null, 2));
    await createDemands(demandsPayload);

    const optimizationPayload = {
      scenario_id: scenarioIdToUse,
      k_paths: 3,
      routing_type: mode,
      optimization_objective: type
    };

    console.log("OPTIMIZATION PAYLOAD:", JSON.stringify(optimizationPayload, null, 2));

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
        utilization: edge.capacity ? load / edge.capacity : 0
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


    // setDemands([]);

    console.log("Что отправляем в /optimization/results:", {
      scenario_id: scenarioIdToUse,
      objective: type,
      routing_type: mode,
      objective_value: optimizationResponse.results.objective_value,
      paths: JSON.stringify(optimizationResponse.results.paths ?? []),
      duals: JSON.stringify(optimizationResponse.results.duals ?? {})
    });

    try {
      await saveOptimizationResult({
        scenario_id: Number(scenarioIdToUse),
        objective: type,
        routing_type: mode,
        objective_value: optimizationResponse.results.objective_value,

        paths: JSON.stringify(
          optimizationResponse.results.paths ?? []
        ),

        duals: JSON.stringify(
          optimizationResponse.results.duals ?? {}
        )
      });
    } catch (e) {
      console.error("SAVE OPTIMIZATION FAILED:", e?.response?.data || e.message);
    }

  } catch (error) {
    console.error(error);

    if (error.response?.data?.detail) {
      setErrorMessage(
        Array.isArray(error.response.data.detail)
          ? error.response.data.detail[0].msg
          : error.response.data.detail
      );
    } else {
      setErrorMessage("Ошибка сервера");
    }
  } finally {
    setLoading(false);
  }
};

const loadTopology = async (scenarioId) => {
    try {
        setLoading(true);
        setErrorMessage("");

        const data = await getTopologyById(scenarioId);
        console.log("TOPOLOGY DATA:", data);

        const restoredNodes = data.nodes.map((nodeId, index, arr) => ({
            id: String(nodeId),
            label: String(nodeId),
            position: circularPosition(index, arr.length)
        }));

        const restoredEdges = data.edges.map((edge) => ({
            id: `${edge.source}-${edge.target}`,
            source: String(edge.source),
            target: String(edge.target),
            weight: edge.weight,
            capacity: edge.capacity
        }));

        setNodes(restoredNodes);
        setEdges(restoredEdges);

        try {
            const optimizationData = await getOptimizationResults(scenarioId);

            console.log("OPTIMIZATION DATA:", optimizationData);

            if (optimizationData && optimizationData.length > 0) {

                const latestResult =
                    optimizationData[optimizationData.length - 1];
                if (typeof latestResult.paths === "string") {
                    try {
                        latestResult.paths = JSON.parse(latestResult.paths);

                    } catch {
                        latestResult.paths = [];
                    }
                }
                const edgeLoadMap = {};

                latestResult.paths?.forEach((pathObj) => {
                    const pathNodes = pathObj.nodes;
                    const flow = pathObj.flow;

                    for (let i = 0; i < pathNodes.length - 1; i++) {
                        const edgeId = `${pathNodes[i]}-${pathNodes[i + 1]}`;

                        edgeLoadMap[edgeId] =
                            (edgeLoadMap[edgeId] || 0) + flow;
                    }
                });

                const edgeLoads = restoredEdges.map((edge) => {
                    const load = edgeLoadMap[edge.id] || 0;

                    return {
                        edgeId: edge.id,
                        load,
                        utilization: edge.capacity ? load / edge.capacity : 0
                    };
                });

                setResult({
                    objective: latestResult.objective_value,

                    paths: latestResult.paths?.map((item) => ({
                        demandId: item.path_id,
                        path: item.nodes,
                        flow: item.flow
                    })) || [],

                    edgeLoads
                });

            } else {
                setResult(null);
            }

        } catch (optError) {
            setResult(null);
        }

        const maxNodeId = Math.max(...data.nodes.map(n => Number(n)), 0);
        setNodeCounter(maxNodeId);

        setSelectedScenarioId(scenarioId);
        setIsEditing(true);
        setGraphRow(`Загружена топология: ${scenarioId}`);

    } catch (error) {
        console.error(error);
        setErrorMessage("Ошибка загрузки топологии");
    } finally {
        setLoading(false);
    }
};

  const handleNewTopology = () => {
    setNodes(mockNetwork.nodes.map((node, index, arr) => ({
      ...node,
      position: circularPosition(index, arr.length)
    })));
    setEdges(mockNetwork.edges);
    setDemands([]);
    setResult(null);
    setSelectedScenarioId(null);
    setIsEditing(false);
    setNodeCounter(mockNetwork.nodes.length);
    setGraphRow("Выберите способ работы с графом");
    setErrorMessage("");
  };

  const handleAddDemand = (newDemand) => {
    setDemands((prev) => [...prev, newDemand]);
  };

  const deleteCurDemand = ((demandId) => {
    setDemands((prev) => prev.filter((demand) => demand.id !==demandId));
  });

  const deleteDemands = (() => {
    setDemands([]);
  });

  const handleDeleteAllDemands = async () => {
    if (!selectedScenarioId || !isEditing) return;

    try {
      await deleteAllDemandsApi(selectedScenarioId);

      // очищаем запросы
      setDemands([]);

      // очищаем результаты расчёта
      setResult(null);

      // сообщение пользователю
      setGraphRow("Запросы успешно удалены");

    } catch (e) {
      console.warn("Failed to delete demands on backend:", e);

      setGraphRow("Ошибка удаления запросов");
    }
  };

  const handleAddNode = () => {
    const nextNodeNumber = nodeCounter + 1;
    const newNodeId = String(nextNodeNumber);

    const newNode = {
      id: newNodeId,
      label: String(nextNodeNumber),
      position: { x: 400, y: 300 }
    };

    setNodes((prev) => {
      const updated = [...prev, newNode];
      return updated.map((n, i, arr) => ({
        ...n,
        position: circularPosition(i, arr.length)
      }));
    });
    setNodeCounter((prev) => prev + 1);
    setGraphRow(`⚠️  Узел ${nextNodeNumber} добавлен`);
  };

  const handleDeleteNodeMode = () => {
    setGraphMode((prev) => (prev === "deleteNode" ? "none" : "deleteNode"));
    setGraphRow("⚠️  Нажмите узел, который хотите удалить");
    setSelectedNodes([]);
  };

  const handleEdgeClick = (edgeId) => {
    if (graphMode !== "deleteEdge") return;

    setEdges((prevEdges) =>
      prevEdges.filter((edge) => edge.id !== edgeId)
    );

    setGraphRow(`⚠️ Ребро ${edgeId} удалено`);

    setGraphMode("none");
  };

  const handleDeleteEdgeMode = () => {
    setGraphMode((prev) =>
      prev === "deleteEdge" ? "none" : "deleteEdge"
    );

    setGraphRow("⚠️ Нажмите ребро, которое хотите удалить");

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

      setNodes((prevNodes) =>
        prevNodes.filter((node) => node.id !== nodeId)
      );

      setGraphRow(`⚠️ Узел ${nodeId} удалён`);

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
          loading={loading}
          selectedScenarioId={selectedScenarioId}
          isEditing={isEditing}

          setType={setType}
          setMode={setMode}
          setEdgeWeight={setEdgeWeight}
          setEdgeCapacity={setEdgeCapacity}
          setGraphRow={setGraphRow}

          onRun={handleRun}
          onAddNode={handleAddNode}
          onDeleteNodeMode={handleDeleteNodeMode}
          onAddEdgeMode={handleAddEdgeMode}
          onDeleteEdgeMode={handleDeleteEdgeMode}
          onAddDemand={handleAddDemand}
          onLoadTopology={loadTopology}
          onNewTopology={handleNewTopology}
        />

        <NetworkGraph
          nodes={nodes}
          edges={edges}
          edgeLoads={result?.edgeLoads || []}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          graphMode={graphMode}
          selectedNodes={selectedNodes}
        />

        <ResultsPanel
          result={result}
          demands={demands}
          topologyIdInput={topologyIdInput}
          deleteCurDemand={deleteCurDemand}
          deleteAllDemands={handleDeleteAllDemands}
          setTopologyIdInput={setTopologyIdInput}
          onLoadTopology={loadTopology}
          deleteDemands={deleteDemands}
        />
      </div>
    </div>
  );
}

export default App;