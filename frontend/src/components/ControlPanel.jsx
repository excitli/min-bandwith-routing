import React, { useState } from "react";

export default function ControlPanel({
  mode,
  type,
  edgeWeight,
  edgeCapacity,
  setMode,
  setType,
  setEdgeWeight,
  setEdgeCapacity,
  onRun,
  onAddNode,
  onDeleteNodeMode,
  onAddEdgeMode,
  onAddDemand
}) {
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [traffic, setTraffic] = useState("");

  const handleAddDemandClick = () => {
    if (!startNode.trim() || !endNode.trim() || !traffic.trim()) {
      alert("Заполни все поля demand");
      return;
    }

    const parsedStart = Number(startNode);
    const parsedEnd = Number(endNode);
    const parsedTraffic = Number(traffic);

    if (!Number.isInteger(parsedStart) || parsedStart <= 0) {
      alert("Начало должно быть положительным целым числом");
      return;
    }

    if (!Number.isInteger(parsedEnd) || parsedEnd <= 0) {
      alert("Конец должен быть положительным целым числом");
      return;
    }

    if (parsedStart === parsedEnd) {
      alert("Начало и конец demand не должны совпадать");
      return;
    }

    if (!Number.isInteger(parsedTraffic) || parsedTraffic <= 0) {
      alert("Трафик должен быть положительным целым числом");
      return;
    }

    const newDemand = {
      id: `demand_${Date.now()}`,
      source: parsedStart,
      target: parsedEnd,
      traffic: parsedTraffic
    };

    onAddDemand(newDemand);

    setStartNode("");
    setEndNode("");
    setTraffic("");
  };

  const handleClearDemandInputs = () => {
    setStartNode("");
    setEndNode("");
    setTraffic("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "17px"
      }}
    >
      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "16px",
          background: "#fff"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Создание графа</h2>

        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            flexDirection: "row",
            gap: "5px"
          }}
        >
          <button
            onClick={onDeleteNodeMode}
            style={{
              maxWidth: "35px",
              width: "100%",
              height: "35px",
              border: "none",
              borderRadius: "8px",
              background: "#C55252",
              color: "#fff",
              cursor: "pointer",
              fontSize: "20px"
            }}
          >
            -
          </button>

          <button
            type="button"
            style={{
              maxWidth: "165px",
              width: "100%",
              height: "35px",
              border: "none",
              borderRadius: "8px",
              background: "#E5F989",
              color: "#000",
              cursor: "default",
              fontSize: "15px"
            }}
          >
            Узел
          </button>

          <button
            onClick={onAddNode}
            style={{
              maxWidth: "35px",
              width: "100%",
              height: "35px",
              border: "none",
              borderRadius: "8px",
              background: "#67C552",
              color: "#fff",
              cursor: "pointer",
              fontSize: "20px"
            }}
          >
            +
          </button>
        </div>

        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#A6A6A6",
            marginBottom: "15px"
          }}
        ></div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: "15px"
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Weight:
            </label>
            <input
              type="number"
              className="number-input"
              min="1"
              step="1"
              placeholder="Ex: 15"
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(e.target.value)}
              style={{
                width: "43px",
                height: "35px",
                fontSize: "14px",
                padding: "6px 10px",
                borderRadius: "10px",
                border: "1px solid #A6A6A6"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Capacity:
            </label>
            <input
              type="number"
              className="number-input"
              min="1"
              step="1"
              placeholder="Ex: 8"
              value={edgeCapacity}
              onChange={(e) => setEdgeCapacity(e.target.value)}
              style={{
                width: "43px",
                height: "35px",
                fontSize: "14px",
                padding: "6px 10px",
                borderRadius: "10px",
                border: "1px solid #A6A6A6"
              }}
            />
          </div>
        </div>

        <button
          onClick={onAddEdgeMode}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#FFE57E",
            color: "#000",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Добавить ребро
        </button>
      </div>

      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "16px",
          background: "#fff"
        }}
      >
        <h2 style={{ marginTop: 0 }}>New demand</h2>

        <div
          style={{
            marginBottom: "13px",
            display: "flex",
            flexDirection: "row",
            gap: "21px"
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Начало:
            </label>
            <input
              type="number"
              className="number-input"
              min="1"
              step="1"
              placeholder="Ex: 1"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              style={{
                width: "43px",
                height: "35px",
                fontSize: "14px",
                padding: "6px 10px",
                borderRadius: "10px",
                border: "1px solid #A6A6A6"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Конец:
            </label>
            <input
              type="number"
              className="number-input"
              min="1"
              step="1"
              placeholder="Ex: 4"
              value={endNode}
              onChange={(e) => setEndNode(e.target.value)}
              style={{
                width: "43px",
                height: "35px",
                fontSize: "14px",
                padding: "6px 10px",
                borderRadius: "10px",
                border: "1px solid #A6A6A6"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Трафик
            </label>
            <input
              type="number"
              className="number-input"
              min="1"
              step="1"
              placeholder="Ex: 10"
              value={traffic}
              onChange={(e) => setTraffic(e.target.value)}
              style={{
                width: "43px",
                height: "35px",
                fontSize: "14px",
                padding: "6px 10px",
                borderRadius: "10px",
                border: "1px solid #A6A6A6"
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "6px",
            justifyContent: "end"
          }}
        >
          <button
            type="button"
            onClick={handleClearDemandInputs}
            style={{
              maxWidth: "91px",
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background: "#E5E5E5",
              color: "#000",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Очистить
          </button>

          <button
            type="button"
            onClick={handleAddDemandClick}
            style={{
              maxWidth: "91px",
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background: "#538DE4",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Добавить
          </button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "16px",
          background: "#fff"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Параметры</h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Routing type
          </label>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >
            <option value="BIFURCATED">Bifurcated (LP)</option>
            <option value="NON_BIFURCATED">Non-Bifurcated (MILP)</option>
            <option value="INTEGRAL">Integral Routing</option>
          </select>

          <label style={{ display: "block", marginBottom: "8px", marginTop: "18px" }}>
            Objective type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          >
            <option value="NAX_FREE_CAP">Max Free Capacity</option>
            <option value="MIN_BANDWITH">MIN_BANDWITH</option>
          </select>
        </div>

        <button
          onClick={onRun}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#538DE4",
            color: "#fff",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Запустить расчёт
        </button>
      </div>
    </div>
  );
}