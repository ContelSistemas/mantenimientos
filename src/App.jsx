import { useState, useMemo, useEffect, useCallback } from "react";
import { Header } from "./components/layout/Header";
import { ContractRow } from "./components/contracts/ContractRow";
import { ContractForm } from "./components/contracts/ContractForm";
import { CoveragePlanner } from "./components/coverage/CoveragePlanner";
import { LoginPage } from "./components/auth/LoginPage";

// Simple debounce function
const debounce = (func, delay) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
};

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // New state for category filter
  const [expanded, setExpanded] = useState(null);
  const [copied, setCopied] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [activeSection, setActiveSection] = useState("contracts");
  const [authLoading, setAuthLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");

  // Theme management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Role management (from authenticated backend session)
  const [userRole, setUserRole] = useState("VIEWER");

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const checkSession = useCallback(async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'same-origin'
      });
      if (!res.ok) {
        setIsAuthenticated(false);
        setUserRole("VIEWER");
        setUsername("");
        return;
      }
      const json = await res.json();
      setIsAuthenticated(Boolean(json.authenticated));
      setUserRole(json.user?.role || "VIEWER");
      setUsername(json.user?.username || "");
    } catch (_err) {
      setIsAuthenticated(false);
      setUserRole("VIEWER");
      setUsername("");
    } finally {
      setAuthLoading(false);
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = useCallback(async (loginUsername, password) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username: loginUsername, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo iniciar sesion");
      }
      const json = await res.json();
      setIsAuthenticated(true);
      setUserRole(json.user?.role || "VIEWER");
      setUsername(json.user?.username || "");
      setAuthError("");
    } catch (err) {
      setIsAuthenticated(false);
      setUserRole("VIEWER");
      setUsername("");
      setAuthError(err.message || "Error de autenticacion");
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin'
      });
    } catch (_err) {
      // Ignore network issues on logout, reset local state anyway
    }
    setIsAuthenticated(false);
    setUserRole("VIEWER");
    setUsername("");
    setShowForm(false);
    setEditingContract(null);
    setExpanded(null);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetchContracts = useCallback(async (currentQuery, currentCategoryFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentQuery) {
        params.append('q', currentQuery);
      }
      if (currentCategoryFilter) {
        params.append('category', currentCategoryFilter);
      }
      const url = `/api/contracts?${params.toString()}`;
      const res = await fetch(url, { credentials: 'same-origin' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        setUserRole("VIEWER");
        setUsername("");
        setData([]);
        return;
      }
      if (!res.ok) throw new Error("Error cargando datos");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchContracts = useMemo(() => debounce(fetchContracts, 300), [fetchContracts]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated && activeSection === "contracts") {
      debouncedFetchContracts(query, categoryFilter);
    }
  }, [isAuthenticated, activeSection, query, categoryFilter, debouncedFetchContracts]);

  const results = useMemo(() => data, [data]);

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const copyText = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} loading={authLoading} error={authError} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)", fontFamily: "'DM Mono', 'Courier New', monospace", color: "var(--text-color)" }}>
      <Header
        query={query}
        setQuery={setQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        loading={loading}
        error={error}
        resultsLength={results.length}
        dataLength={data.length}
        theme={theme}
        toggleTheme={toggleTheme}
        userRole={userRole}
        onLogout={logout}
        username={username}
        onNewContractClick={() => setShowForm(true)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div style={{ padding: "12px 18px 40px" }}>
        {activeSection === "contracts" ? (
          loading && data.length === 0 && !error ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--stats-color)" }}>
              <div className="spinner" style={{ marginBottom: "15px", margin: "0 auto" }}></div>
              <div style={{ fontSize: "14px" }}>Sincronizando con base de datos...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--delete-color)" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>❌</div>
              <div style={{ fontSize: "16px", marginBottom: "10px" }}>Error al cargar los contratos:</div>
              <div style={{ fontSize: "14px" }}>{error}</div>
              <button onClick={() => debouncedFetchContracts(query, categoryFilter)} style={{ marginTop: "20px", padding: "8px 16px", borderRadius: "5px", border: "none", background: "var(--accent-color)", color: "white", cursor: "pointer" }}>Reintentar</button>
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--stats-color)" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔍</div>
              <div style={{ fontSize: "14px" }}>{query || categoryFilter ? <>Sin resultados para <strong style={{ color: "var(--highlight-color)" }}>"{query} {categoryFilter}"</strong></> : "No hay datos disponibles"}</div>
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
                  onUpdate={() => debouncedFetchContracts(query, categoryFilter)}
                  onCopy={copyText}
                  onEdit={() => setEditingContract(row)}
                  copied={copied}
                  userRole={userRole}
                />
              ))}
            </div>
          )
        ) : (
          <CoveragePlanner userRole={userRole} />
        )}
      </div>

      {(showForm || editingContract) && userRole === "ADMIN" && activeSection === "contracts" && (
        <ContractForm
          initialData={editingContract}
          onClose={() => { setShowForm(false); setEditingContract(null); }}
          onSave={() => debouncedFetchContracts(query, categoryFilter)}
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
