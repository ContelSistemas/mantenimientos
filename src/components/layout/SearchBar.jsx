import React from 'react';

export function SearchBar({ query, setQuery, loading }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--accent-color)", fontSize: "16px", pointerEvents: "none" }}>⌕</span>
      <input
        type="text"
        placeholder="Buscar por obra, nº cliente, cliente o descripción..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        autoFocus
        disabled={loading}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "var(--input-bg)", border: "1.5px solid var(--input-border)", borderRadius: "10px",
          padding: "10px 36px 10px 38px", fontSize: "13px", color: "var(--text-color)",
          outline: "none", fontFamily: "inherit",
          opacity: loading ? 0.6 : 1
        }}
        onFocus={e => e.target.style.borderColor = "var(--highlight-color)"}
        onBlur={e => e.target.style.borderColor = "var(--input-border)"}
      />
      {query && (
        <button onClick={() => setQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--accent-color)", cursor: "pointer", fontSize: "18px" }}>×</button>
      )}
    </div>
  );
}
