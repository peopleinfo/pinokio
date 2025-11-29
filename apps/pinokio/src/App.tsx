import { useState } from "react";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [port, setPort] = useState<number | null>(null);
  const [counter, setCounter] = useState<number | null>(null);
  const [view, setView] = useState<"home" | "dashboard">("home");

  const fetchCounter = async (currentPort: number) => {
    try {
      const response = await fetch(`http://localhost:${currentPort}/counter`);
      const data = await response.json();
      setCounter(data.counter);
    } catch (e) {
      console.error("Failed to fetch counter", e);
    }
  };

  const updateCounter = async (action: "increment" | "decrement") => {
    if (!port) return;
    try {
      const response = await fetch(
        `http://localhost:${port}/counter/${action}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      setCounter(data.counter);
    } catch (e) {
      console.error(`Failed to ${action} counter`, e);
    }
  };

  const start = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await window.electronAPI.startPinokio();
      if (!res || res.started !== true) {
        setError("Pinokio failed to start or is already running.");
        setLoading(false);
      } else {
        setLoading(false);
        if (res.port) {
          setPort(res.port);
          fetchCounter(res.port);
        }
      }
    } catch (err: any) {
      setError(err && err.message ? err.message : String(err));
      setLoading(false);
    }
  };

  const openDashboard = async () => {
    setView("dashboard");
    await window.electronAPI.setDashboardView({
      view: "dashboard",
      port,
    });
  };

  const switchToHome = async () => {
    setView("home");
    await window.electronAPI.setDashboardView({
      view: "home",
    });
  };

  if (port) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #eaeaea",
            background: "#fff",
          }}
        >
          <button
            onClick={switchToHome}
            style={{
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom:
                view === "home" ? "2px solid #111827" : "2px solid transparent",
              fontWeight: view === "home" ? 600 : 400,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Home
          </button>
          <button
            onClick={openDashboard}
            style={{
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom:
                view === "dashboard"
                  ? "2px solid #111827"
                  : "2px solid transparent",
              fontWeight: view === "dashboard" ? 600 : 400,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Dashboard
          </button>
          <div
            style={{
              marginLeft: "auto",
              padding: "12px 20px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            Port: {port}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: view === "home" ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="card">
              <div className="title">Pinokio Running</div>

              <div
                className="counter-container"
                style={{
                  margin: "20px 0",
                  padding: "20px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  width: "100%",
                }}
              >
                <div className="subtitle" style={{ marginBottom: "10px" }}>
                  Counter API Demo
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    margin: "10px 0",
                  }}
                >
                  {counter !== null ? counter : "..."}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    className="btn"
                    onClick={() => updateCounter("decrement")}
                  >
                    -
                  </button>
                  <button
                    className="btn"
                    onClick={() => updateCounter("increment")}
                  >
                    +
                  </button>
                </div>
              </div>

              <button className="btn" onClick={openDashboard}>
                Open Pinokio Dashboard
              </button>
            </div>
          </div>
          {/* Dashboard is now handled by BrowserView in main process */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: view === "dashboard" ? "block" : "none",
              background: "#fff",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="title">Pinokio</div>
      <div className="subtitle">Click to start the server</div>
      {error && <div className="error">{error}</div>}
      <button className="btn" disabled={loading} onClick={start}>
        {loading ? "Starting…" : "Start Pinokio"}
      </button>
    </div>
  );
}

export default App;
