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
  const [editingContract, setEditingContract] = useState(null);

  // Theme management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Role management
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "VIEWER";
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const loginAsAdmin = (password) => {
    if (password === "produccion_2026") { // Contraseña actualizada
      setUserRole("ADMIN");

      localStorage.setItem("userRole", "ADMIN");
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserRole("VIEWER");
    localStorage.setItem("userRole", "VIEWER");
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

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
    <div style={{ minHeight: "100vh", background: "var(--bg-color)", fontFamily: "'DM Mono', 'Courier New', monospace", color: "var(--text-color)" }}>
      <Header
        query={query}
        setQuery={setQuery}
        loading={loading}
        error={error}
        resultsLength={results.length}
        dataLength={data.length}
        theme={theme}
        toggleTheme={toggleTheme}
        userRole={userRole}
        onAdminLogin={loginAsAdmin}
        onLogout={logout}
        onNewContractClick={() => setShowForm(true)}
      />

      <div style={{ padding: "12px 18px 40px" }}>
        {loading && data.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--stats-color)" }}>
            <div className="spinner" style={{ marginBottom: "15px", margin: "0 auto" }}></div>
            <div style={{ fontSize: "14px" }}>Sincronizando con base de datos...</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--stats-color)" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
            <div style={{ fontSize: "14px" }}>{query ? <>Sin resultados para <strong style={{ color: "var(--highlight-color)" }}>"{query}"</strong></> : "No hay datos disponibles"}</div>
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
                onEdit={() => setEditingContract(row)}
                copied={copied}
                userRole={userRole}
              />
            ))}
          </div>
        )}
      </div>

      {(showForm || editingContract) && userRole === "ADMIN" && (
        <ContractForm
          initialData={editingContract}
          onClose={() => { setShowForm(false); setEditingContract(null); }}
          onSave={fetchData}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: var(--stats-secondary); }
        mark { font-family: inherit; }
      `}</style>
    </div>
  );
}
