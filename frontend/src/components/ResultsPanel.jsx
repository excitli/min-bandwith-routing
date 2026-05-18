import { useState } from "react";
import delIcon from "../assets/delIconBlack.png";

const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  fontSize: "13px",
  boxSizing: "border-box"
};

function DemandItem({ demand, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [source, setSource] = useState(String(demand.source));
  const [target, setTarget] = useState(String(demand.target));
  const [traffic, setTraffic] = useState(String(demand.traffic));

  const handleSave = () => {
    const s = Number(source);
    const t = Number(target);
    const tr = Number(traffic);

    if (!s || s <= 0 || !t || t <= 0 || !tr || tr <= 0) return;

    onEdit(demand.id, { source: s, target: t, traffic: tr });
    setEditing(false);
  };

  const handleCancel = () => {
    setSource(String(demand.source));
    setTarget(String(demand.target));
    setTraffic(String(demand.traffic));
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto",
          gap: "6px",
          alignItems: "center",
          padding: "10px 12px",
          background: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #538DE4"
        }}
      >
        <input
          type="number"
          className="number-input"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="От"
          style={inputStyle}
        />
        <input
          type="number"
          className="number-input"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="В"
          style={inputStyle}
        />
        <input
          type="number"
          className="number-input"
          value={traffic}
          onChange={(e) => setTraffic(e.target.value)}
          placeholder="Трафик"
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "6px 10px",
              border: "none",
              borderRadius: "6px",
              background: "#538DE4",
              color: "#fff",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >OK</button>
          <button
            onClick={handleCancel}
            style={{
              padding: "6px 10px",
              border: "none",
              borderRadius: "6px",
              background: "#E5E5E5",
              color: "#000",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >X</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      title="Двойной клик для редактирования"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        background: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
        transition: "border-color 0.15s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#538DE4"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
        <span style={{
          background: "#538DE4",
          color: "#fff",
          borderRadius: "6px",
          padding: "2px 8px",
          fontSize: "12px",
          fontWeight: 600
        }}>
          {demand.source}
        </span>
        <span style={{ color: "#9ca3af" }}>→</span>
        <span style={{
          background: "#538DE4",
          color: "#fff",
          borderRadius: "6px",
          padding: "2px 8px",
          fontSize: "12px",
          fontWeight: 600
        }}>
          {demand.target}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          {demand.traffic}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(demand.id); }}
          style={{
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <img src={delIcon} alt="delete" width="14px" />
        </button>
      </div>
    </div>
  );
}

export default function ResultsPanel({
  result,
  demands = [],
  deleteCurDemand,
  editDemand,
  deleteAllDemands,
  topologyIdInput,
  setTopologyIdInput,
  onLoadTopology
}) {
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
        <h2 style={{ marginTop: 0 }}>Результаты</h2>

        <div>
          <table>
            <tbody>
              <tr>
                <td><div style={{width: "10px", height: "10px", background: "#3b82f6"}}></div></td>
                <td style={{paddingLeft: "10px", fontSize: "13px"}}>0-30%</td>
              </tr>
              <tr>
                <td><div style={{width: "10px", height: "10px", background: "#22c55e"}}></div></td>
                <td style={{paddingLeft: "10px", fontSize: "13px"}}>30-60%</td>
              </tr>
              <tr>
                <td><div style={{width: "10px", height: "10px", background: "#f59e0b"}}></div></td>
                <td style={{paddingLeft: "10px", fontSize: "13px"}}>60-85%</td>
              </tr>
              <tr>
                <td><div style={{width: "10px", height: "10px", background: "#ef4444"}}></div></td>
                <td style={{paddingLeft: "10px", fontSize: "13px"}}>85-100%</td>
              </tr>
              <tr>
                <td><div style={{width: "10px", height: "10px", background: "#7f1d1d"}}></div></td>
                <td style={{paddingLeft: "10px", fontSize: "13px"}}>Перегруз</td>
              </tr>
            </tbody>
          </table>
        </div>

        {!result ? (
          <p>Пока нет расчёта</p>
        ) : (
          <>
            <p>
              <strong>Целевая функция:</strong> {result.objective}
            </p>

            <h3>Маршруты</h3>
            <ul style={{ paddingLeft: "18px" }}>
              {result.paths.map((item, index) => (
                <li key={index}>
                  {item.demandId}: {item.path.join(" → ")} | поток: {item.flow}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "16px",
          background: "#fff"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Запросы трафика</h2>

        {demands.length === 0 ? (
          <p>Пока ничего не добавлено</p>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {demands.map((demand) => (
                <DemandItem
                  key={demand.id}
                  demand={demand}
                  onDelete={deleteCurDemand}
                  onEdit={editDemand}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "end", marginTop: "12px" }}>
              <button
                onClick={deleteAllDemands}
                style={{
                  maxWidth: "140px",
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#C55252",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >Очистить</button>
            </div>
          </>
        )}
      </div>

      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "16px",
          background: "#fff"
        }}
      >
        <h2 style={{ marginTop: 0 }}>Загрузка топологии</h2>

        <input
          type="number"
          placeholder="Введите ID топологии"
          value={topologyIdInput}
          onChange={(e) => setTopologyIdInput(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
            backgroundColor: "#fff",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          <button
            onClick={() => onLoadTopology(Number(topologyIdInput))}
            style={{
              maxWidth: "91px",
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              background: "#538DE4",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
              marginTop: "10px"
            }}
          >
            Загpузить
          </button>
          <h5
            style={{
              marginTop: "18px",
              fontSize: "10px",
              textAlign: "right",
              color: "#b6b6b6"
            }}
          >При загрузке по ID будет загружен последний запрос</h5>
        </div>
      </div>
    </div>
  );
}
