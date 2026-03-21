import React from 'react';
import { SearchBar } from './SearchBar';
import { SVC_LABELS } from '../../constants/config';

export function Header({ query, setQuery, loading, error, resultsLength, dataLength, onNewContract }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #1e1b4b 0%, #0f0f1a 100%)",
      borderBottom: "1px solid #312e6e",
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
            <div style={{ fontSize: "10px", color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Contel Ingenieros</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>MONIT. Y HELPDESK — Buscador</div>
          </div>
        </div>
        
        <button
          onClick={onNewContract}
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
      </div>

      <SearchBar query={query} setQuery={setQuery} loading={loading} />

      {/* Stats + legend */}
      <div style={{ display: "flex", gap: "14px", marginTop: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "10px", color: "#64748b" }}>
          {loading ? (
            <span>Cargando datos...</span>
          ) : error ? (
            <span style={{ color: "#ef4444" }}>Error: {error}</span>
          ) : (
            <>
              <span style={{ color: "#818cf8", fontWeight: 700 }}>{resultsLength}</span> resultado{resultsLength !== 1 ? "s" : ""}
              {query && <span> de {dataLength}</span>}
              {" · "}pulsa fila para ver servicios o editar
            </>
          )}
        </span>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {Object.entries(SVC_LABELS).map(([k, v]) => (
            <span key={k} style={{ fontSize: "9px", color: "#475569" }}>
              <span style={{ color: "#818cf8", fontWeight: 700 }}>{v.short}</span> = {v.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
