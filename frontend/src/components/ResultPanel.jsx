import React from "react";
import delIcon from "../assets/delIconBlack.png";

export default function ResultsPanel({
  result,
  demands = [],
  deleteCurDemand,
  deleteAllDemands
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

            <h3>Загрузка каналов</h3>
            <ul style={{ paddingLeft: "18px" }}>
              {result.edgeLoads.map((edge) => (
                <li key={edge.edgeId}>
                  {edge.edgeId}: {edge.load}/{edge.capacity} |{" "}
                  {Math.round(edge.utilization * 100)}% | π = {edge.pi}
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
        <h2 style={{ marginTop: 0 }}>Demands</h2>

        {demands.length === 0 ? (
          <p>Пока demands не добавлены</p>
        ) : (
          <>
          <ul style={{ paddingLeft: "18px" }}>
            {demands.map((demand) => (
              <li
                key={demand.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: "5px"
                }}
              >
                {demand.source} → {demand.target} | трафик: {demand.traffic}
                <button
                  onClick={() => deleteCurDemand(demand.id)}
                  style={{
                    backgroundColor: "white",
                    border: "none"
                  }}
                ><img src={delIcon} alt="delete" width="15px"/></button>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", justifyContent: "end" }}>
            <button
              onClick={deleteAllDemands}
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
            >Очистить</button>
          </div>
        </>
        )}
      </div>
    </div>
  );
}