import React, { useState } from "react";

export default function ControlPanel({
  mode,
  type,
  edgeWeight,
  edgeCapacity,
  graphRow,
  setMode,
  setType,
  setEdgeWeight,
  setEdgeCapacity,
  setGraphRow,
  onRun,
  onAddNode,
  onDeleteNodeMode,
  onAddEdgeMode,
  onAddDemand,
  onDeleteEdgeMode,
  loading,

  savedTopologies,
  selectedScenarioId,
  isEditing,
  onLoadTopology,
  onFetchTopologies,
  onNewTopology,
}) {
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [traffic, setTraffic] = useState("");

  const handleAddDemandClick = () => {
    if (!startNode.trim() || !endNode.trim() || !traffic.trim()) {
      alert("Заполни все поля запроса трафика");
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
      alert("Начало и конец запроса трафика не должны совпадать");
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

         <div style={{ marginBottom: "16px" }}>
          {/*<label style={{ display: "block", marginBottom: "8px" }}>
            Сохранённые топологии
          </label>

          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <select
              onChange={(e) => {
                const id = e.target.value;
                if (id) onLoadTopology(Number(id));
              }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
            >
              <option value="">Выберите топологию...</option>
              {savedTopologies.map((top) => (
                <option key={top.scenario_id} value={top.scenario_id}>
                  {top.name} (ID: {top.scenario_id})
                </option>
              ))}
            </select>

            <button
              onClick={onFetchTopologies}
              style={{
                padding: "10px",
                border: "none",
                borderRadius: "8px",
                background: "#538DE4",
                color: "#fff",
                cursor: "pointer"
              }}
              title="Обновить список"
            >
              🔄
            </button>
          </div>  */}

          {isEditing && (
            <div style={{
              padding: "8px",
              background: "#e0f2fe",
              borderRadius: "6px",
              fontSize: "12px",
              marginBottom: "8px"
            }}>
              Режим редактирования: ID {selectedScenarioId}
            </div>
          )}

          <button
            onClick={onNewTopology}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#fff",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            + Новая топология
          </button>
        </div>

        <div style={{ width: "100%", height: "1px", backgroundColor: "#A6A6A6", marginBottom: "15px" }}></div>
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
              Вес:
            </label>
            <input
              type="number"
              className="number-input"
              min="1"
              step="1"
              placeholder="Пр: 15"
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
              Пропуск:
            </label>
            <input
              type="number"
              className="number-input"
              min="1"
              step="1"
              placeholder="Пр: 8"
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
        <div
          style={{
            marginTop: "18px",
            fontSize: "10px",
            textAlign: "right",
            color: "#9a0000",
            fontWeight: "bold"
          }}
        >
          {graphRow}
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
        <h2 style={{ marginTop: 0 }}>Новый запрос</h2>

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
              placeholder="Пр: 1"
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
              placeholder="Пр: 4"
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
              placeholder="Пр: 10"
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
            Тип маршрутизации
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
            <option value="BIFURCATED">Разделяемая маршрутизация (LP)</option>
            <option value="NON_BIFURCATED">Неразделяемая маршрутизация (MILP)</option>
            <option value="INTEGRAL">Целочисленная маршрутизация</option>
          </select>

          <label style={{ display: "block", marginBottom: "8px", marginTop: "18px" }}>
            Целевая функция
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
            <option value="NAX_FREE_CAP">Максимум свободной пропускной способности</option>
            <option value="MIN_BANDWITH">Минимизация используемой пропускной способности</option>
          </select>
        </div>

        <button
          onClick={onRun}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: loading ? "#94a3b8" : "#538DE4",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px"
          }}
        >
          {loading ? "Расчёт..." : "Запустить расчёт"}
        </button>
      </div>
    </div>
  );
}