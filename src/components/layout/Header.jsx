import React from 'react';
import { SearchBar } from './SearchBar';
import { SVC_LABELS } from '../../constants/config';

export function Header({ 
  query, setQuery, loading, error, resultsLength, dataLength, 
  onNewContractClick, theme, toggleTheme,
  userRole, onAdminLogin, onLogout
}) {
  const handleRoleToggle = () => {
    if (userRole === "ADMIN") {
      onLogout();
    } else {
      const pass = prompt("Introduce contraseña de administrador:");
      if (pass) {
        const success = onAdminLogin(pass);
        if (!success) alert("Contraseña incorrecta");
      }
    }
  };

  return (
    <div style={{
      background: "var(--header-bg)",
      borderBottom: "1px solid var(--header-border)",
      padding: "22px 28px 16px",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            width: 34, height: 34, borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "17px", fontWeight: "bold", color: "white", flexShrink: 0,
          }}>C</div>
          <div>
            <div style={{ fontSize: "10px", color: "var(--accent-color)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Contel Ingenieros</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--subtitle-color)", letterSpacing: "-0.02em" }}>MONIT. Y HELPDESK — Buscador</div>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Role Badge/Button */}
          <button
            onClick={handleRoleToggle}
            style={{
              background: userRole === "ADMIN" ? "#10b98122" : "transparent",
              color: userRole === "ADMIN" ? "#10b981" : "var(--stats-color)",
              border: `1px solid ${userRole === "ADMIN" ? "#10b981" : "var(--card-border)"}`,
              borderRadius: "20px", padding: "4px 12px", fontSize: "10px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
            }}
          >
            {userRole === "ADMIN" ? "🔓 ADMIN" : "🔒 LECTURA"}
          </button>

          <button
            onClick={toggleTheme}
            style={{
              background: "var(--card-bg)",
              color: "var(--text-color)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              width: "34px", height: "34px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "16px",
            }}
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {userRole === "ADMIN" && (
            <button
              onClick={onNewContractClick}
              style={{
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                color: "white", border: "none", borderRadius: "8px",
                padding: "8px 16px", fontSize: "12px", fontWeight: 600,
                cursor: "pointer", transition: "transform 0.1s active",
                display: "flex", alignItems: "center", gap: "6px"
              }}
              onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"}
              onMouseLeave={e => e.currentTarget.style.filter = "none"}
            >
              <span style={{ fontSize: "16px" }}>+</span> Nuevo Contrato
            </button>
          )}
        </div>
      </div>

      <SearchBar query={query} setQuery={setQuery} loading={loading} />

      {/* Stats + legend */}
      <div style={{ display: "flex", gap: "14px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "10px", color: "var(--stats-color)" }}>
          {loading ? (
            <span>Cargando datos...</span>
          ) : error ? (
            <span style={{ color: "#ef4444" }}>Error: {error}</span>
          ) : (
            <>
              <span style={{ color: "var(--highlight-color)", fontWeight: 700 }}>{resultsLength}</span> resultado{resultsLength !== 1 ? "s" : ""}
              {query && <span> de {dataLength}</span>}
              {" · "}pulsa fila para ver servicios o editar
            </>
          )}
        </span>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {Object.entries(SVC_LABELS).map(([k, v]) => (
            <span key={k} style={{ fontSize: "9px", color: "var(--stats-secondary)" }}>
              <span style={{ color: "var(--highlight-color)", fontWeight: 700 }}>{v.short}</span> = {v.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
