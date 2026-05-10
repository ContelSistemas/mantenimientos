import React, { useState, useEffect, useMemo } from 'react';

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

export function SearchBar({ query, setQuery, categoryFilter, setCategoryFilter, loading }) {
  const [internalQuery, setInternalQuery] = useState(query);
  const [internalCategoryFilter, setInternalCategoryFilter] = useState(categoryFilter);

  // Update internal state when props change (e.g., parent clears filters)
  useEffect(() => {
    setInternalQuery(query);
  }, [query]);

  useEffect(() => {
    setInternalCategoryFilter(categoryFilter);
  }, [categoryFilter]);

  // Debounced setters for parent's state
  const debouncedSetQuery = useMemo(() => debounce(setQuery, 300), [setQuery]);
  const debouncedSetCategoryFilter = useMemo(() => debounce(setCategoryFilter, 300), [setCategoryFilter]);

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setInternalQuery(value);
    debouncedSetQuery(value);
  };

  const handleCategoryFilterChange = (e) => {
    const value = e.target.value;
    setInternalCategoryFilter(value);
    debouncedSetCategoryFilter(value);
  };

  const clearQuery = (e) => {
    e.preventDefault(); // Prevent any default button behavior
    setInternalQuery("");
    setQuery(""); // Clear parent's state immediately
  };

  const clearCategoryFilter = (e) => {
    e.preventDefault(); // Prevent any default button behavior
    setInternalCategoryFilter("");
    setCategoryFilter(""); // Clear parent's state immediately
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <div style={{ position: "relative", flexGrow: 1 }}>
        <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "var(--accent-color)", fontSize: "16px", pointerEvents: "none" }}>⌕</span>
        <input
          id="tour-search-query"
          type="text"
          placeholder="Buscar por obra, nº cliente, cliente o descripción..."
          value={internalQuery}
          onChange={handleQueryChange}
          autoFocus
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
        {internalQuery && (
          <button type="button" onClick={clearQuery} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--accent-color)", cursor: "pointer", fontSize: "18px" }}>×</button>
        )}
      </div>

      <div style={{ position: "relative", width: "150px" }}>
        <input
          id="tour-search-category"
          type="text"
          placeholder="Categoría (ej. Mantenimiento)"
          value={internalCategoryFilter}
          onChange={handleCategoryFilterChange}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "var(--input-bg)", border: "1.5px solid var(--input-border)", borderRadius: "10px",
            padding: "10px 12px", fontSize: "13px", color: "var(--text-color)",
            outline: "none", fontFamily: "inherit",
            opacity: loading ? 0.6 : 1
          }}
          onFocus={e => e.target.style.borderColor = "var(--highlight-color)"}
          onBlur={e => e.target.style.borderColor = "var(--input-border)"}
        />
        {internalCategoryFilter && (
          <button type="button" onClick={clearCategoryFilter} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--accent-color)", cursor: "pointer", fontSize: "14px" }}>×</button>
        )}
      </div>
    </div>
  );
}
