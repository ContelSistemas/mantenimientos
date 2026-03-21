import React from 'react';

export function SearchBar({ query, setQuery, loading }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#6366f1", fontSize: "16px", pointerEvents: "none" }}>⌕</span>
      <input
        type="text"
        placeholder="Buscar por obra, nº cliente, cliente o descripción..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
        disabled={loading}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "#1e1b4b", border: "1.5px solid #4338ca", borderRadius: "10px",
          padding: "10px 36px 10px 38px", fontSize: "13px", color: "#f1f5f9",
          outline: "none", fontFamily: "inherit",
          opacity: loading ? 0.6 : 1
        }}
        onFocus={e => e.target.style.borderColor = "#818cf8"}
        onBlur={e => e.target.style.borderColor = "#4338ca"}
      />
      {query && (
        <button onClick={() => setQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "18px" }}>×</button>
      )}
    </div>
  );
}
