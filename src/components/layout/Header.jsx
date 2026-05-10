import React from 'react';
import { SearchBar } from './SearchBar';
import { SVC_LABELS } from '../../constants/config';

export function Header({ 
  query, setQuery, categoryFilter, setCategoryFilter, loading, error, resultsLength, dataLength, 
  onNewContractClick, theme, toggleTheme,
  userRole, onLogout, username,
  activeSection, onSectionChange,
  onStartTour
}) {
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
            style={{
              background: userRole === "ADMIN" ? "#10b98122" : "#38bdf822",
              color: userRole === "ADMIN" ? "#10b981" : "var(--stats-color)",
              border: `1px solid ${userRole === "ADMIN" ? "#10b981" : "#38bdf8"}`,
              borderRadius: "20px", padding: "4px 12px", fontSize: "10px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "5px"
            }}
            type="button"
          >
            {userRole === "ADMIN" ? "ADMIN" : "LECTURA"} · {username}
          </button>

          <button
            onClick={toggleTheme}
            id="tour-theme-toggle"
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

          <button
            onClick={onStartTour}
            id="tour-start"
            type="button"
            style={{
              background: "transparent",
              color: "var(--stats-color)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              padding: "8px 10px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer"
            }}
            title="Abrir tour guiado"
          >
            Tour
          </button>
          
          {userRole === "ADMIN" && (
            <button
              onClick={onNewContractClick}
              id="tour-new-contract"
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

          <button
            onClick={onLogout}
            type="button"
            id="tour-logout"
            style={{
              background: "transparent",
              color: "var(--stats-color)",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              padding: "8px 10px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Cerrar sesion
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <button
          type="button"
          onClick={() => onSectionChange("contracts")}
          id="tour-section-contracts"
          style={{
            border: "1px solid var(--card-border)",
            background: activeSection === "contracts" ? "var(--accent-color)" : "var(--card-bg)",
            color: activeSection === "contracts" ? "white" : "var(--text-color)",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Buscador Contratos
        </button>
        <button
          type="button"
          onClick={() => onSectionChange("coverage")}
          id="tour-section-coverage"
          style={{
            border: "1px solid var(--card-border)",
            background: activeSection === "coverage" ? "var(--accent-color)" : "var(--card-bg)",
            color: activeSection === "coverage" ? "white" : "var(--text-color)",
            borderRadius: "8px",
            padding: "6px 10px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Asignacion de Soporte
        </button>
      </div>

      {activeSection === "contracts" ? (
        <SearchBar 
          query={query} 
          setQuery={setQuery} 
          categoryFilter={categoryFilter} 
          setCategoryFilter={setCategoryFilter} 
          loading={loading} 
        />
      ) : null}

      {/* Stats + legend */}
      {activeSection === "contracts" ? (
        <div style={{ display: "flex", gap: "14px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "var(--stats-color)" }}>
            {loading ? (
              <span>Cargando datos...</span>
            ) : error ? (
              <span style={{ color: "#ef4444" }}>Error: {error}</span>
            ) : (
              <>
                <span style={{ color: "var(--highlight-color)", fontWeight: 700 }}>{resultsLength}</span> resultado{resultsLength !== 1 ? "s" : ""}
                {(query || categoryFilter) && <span> de {dataLength}</span>}
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
      ) : (
        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--stats-color)" }}>
          Consulta y simulacion de cobertura interna por ausencia de tecnico.
        </div>
      )}
    </div>
  );
}
