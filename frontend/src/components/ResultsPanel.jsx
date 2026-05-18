import delIcon from "../assets/delIconBlack.png";

export default function ResultsPanel({
  result,
  demands = [],
  deleteCurDemand,
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