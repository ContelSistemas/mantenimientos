import { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "./components/layout/Header";
import { ContractRow } from "./components/contracts/ContractRow";
import { ContractForm } from "./components/contracts/ContractForm";

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/contracts")
      .then(res => {
        if (!res.ok) throw new Error("Error cargando datos");
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const results = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return data;
    return data.filter(r =>
      r.obra.toUpperCase().includes(q) ||
      r.nCliente.toUpperCase().includes(q) ||
      r.cliente.toUpperCase().includes(q) ||
      (r.descripcion && r.descripcion.toUpperCase().includes(q))
    );
  }, [query, data]);

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const copyText = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", fontFamily: "'DM Mono', 'Courier New', monospace", color: "#e2e8f0" }}>
      <Header
        query={query}
        setQuery={setQuery}
        loading={loading}
        error={error}
        resultsLength={results.length}
        dataLength={data.length}
        onNewContract={() => setShowForm(true)}
      />

      <div style={{ padding: "12px 18px 40px" }}>
        {loading && data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#475569" }}>
            <div className="spinner" style={{ marginBottom: "15px" }}></div>
            <div style={{ fontSize: "14px" }}>Sincronizando con base de datos...</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#475569" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
            <div style={{ fontSize: "14px" }}>{query ? <>Sin resultados para <strong style={{ color: "#818cf8" }}>"{query}"</strong></> : "No hay datos disponibles"}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {results.map((row) => (
              <ContractRow
                key={row.id}
                row={row}
                query={query}
                isOpen={expanded === row.id}
                onToggle={() => toggleExpand(row.id)}
                onUpdate={fetchData}
                onCopy={copyText}
                copied={copied}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ContractForm
          onClose={() => setShowForm(false)}
          onSave={fetchData}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #475569; }
        mark { font-family: inherit; }
        .spinner {
          width: 30px; height: 30px;
          border: 3px solid #1e1b4b;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
