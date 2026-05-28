import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_ASSIGNMENTS, TECHNICIAN_BY_ID, TECHNICIANS } from "./coverageData";
import "./coverage.css";

const EMPTY_ASSIGNMENTS = Object.fromEntries(TECHNICIANS.map((tec) => [tec.id, []]));

function cloneAssignments(assignments) {
  return Object.fromEntries(
    TECHNICIANS.map((tec) => [tec.id, (assignments[tec.id] || []).map((row) => ({ loc: row.loc, area: row.area }))])
  );
}

function moveTaskBetweenTechnicians(assignments, sourceTechId, taskIndex, targetTechId) {
  const next = cloneAssignments(assignments);
  const sourceRows = next[sourceTechId] || [];
  if (!sourceRows[taskIndex]) return next;
  const [task] = sourceRows.splice(taskIndex, 1);
  next[targetTechId] = [...(next[targetTechId] || []), task];
  return next;
}

function buildAbsenceCoverage(absentId, assignments) {
  const absentTasks = assignments[absentId] || [];
  const activeTechs = TECHNICIANS.filter((tec) => tec.id !== absentId);
  if (!activeTechs.length) {
    return { cctv: [], monitoring: [], loads: [] };
  }

  const currentLoad = Object.fromEntries(activeTechs.map((tec) => [tec.id, (assignments[tec.id] || []).length]));
  const extraLoad = Object.fromEntries(activeTechs.map((tec) => [tec.id, 0]));
  const cctv = [];
  const monitoring = [];

  for (const task of absentTasks) {
    const assignedTo = activeTechs.reduce((bestId, tec) => {
      if (currentLoad[tec.id] < currentLoad[bestId]) return tec.id;
      return bestId;
    }, activeTechs[0].id);

    currentLoad[assignedTo] += 1;
    extraLoad[assignedTo] += 1;

    const row = { loc: task.loc, by: assignedTo };
    if (task.area.toUpperCase().includes("CCTV")) {
      cctv.push(row);
    } else {
      monitoring.push(row);
    }
  }

  const maxLoad = Math.max(...activeTechs.map((tec) => currentLoad[tec.id]), 1);
  const loads = activeTechs.map((tec) => ({
    id: tec.id,
    width: Math.round((currentLoad[tec.id] / maxLoad) * 100),
    summary: `+${extraLoad[tec.id]} -> ${currentLoad[tec.id]}`,
  }));

  return { cctv, monitoring, loads };
}

function isoToday() {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatIsoDateEs(isoDate) {
  if (!isoDate || typeof isoDate !== "string") return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function clampAbsenceRange(startIso, endIso) {
  const start = startIso || "";
  const end = endIso || "";
  if (!start || !end) return { start, end };
  return start <= end ? { start, end } : { start: end, end: start };
}

function daysInclusive(startIso, endIso) {
  if (!startIso || !endIso) return 0;
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return diffDays >= 0 ? diffDays + 1 : 0;
}

function NormalView({
  assignments,
  canEdit,
  canCreate,
  creating,
  createError,
  dragTargetTechId,
  saving,
  saveError,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onCreate,
}) {
  const totalTasks = useMemo(() => TECHNICIANS.reduce((sum, tec) => sum + (assignments[tec.id]?.length || 0), 0), [assignments]);
  const [newTechId, setNewTechId] = useState(TECHNICIANS[0]?.id || "fe");
  const [newLoc, setNewLoc] = useState("");
  const [newArea, setNewArea] = useState("");

  const submitCreate = useCallback(
    (e) => {
      e.preventDefault();
      if (!canCreate) return;
      const loc = newLoc.trim();
      const area = newArea.trim();
      if (!loc || !area) return;
      onCreate({ technician_id: newTechId, loc, area });
      setNewLoc("");
      setNewArea("");
    },
    [canCreate, newArea, newLoc, newTechId, onCreate]
  );

  return (
    <div className="cov-panel active">
      <div className="cov-alert-box cov-info">
        <i className="cov-alert-icon">i</i>
        <span>
          Reparto dinamico con el equipo completo. Total: {totalTasks} tareas.{" "}
          {canEdit ? "Arrastra clientes entre tecnicos para reasignar y guardar." : "Modo solo lectura para este usuario."}
        </span>
      </div>
      <div className="cov-save-status">
        {saving ? "Guardando cambios..." : saveError ? `Error al guardar: ${saveError}` : "Cambios sincronizados"}
      </div>
      <div className="cov-create">
        <div className="cov-create-title">Nuevo cliente / trabajo</div>
        <form className="cov-create-row" onSubmit={submitCreate}>
          <select className="cov-create-select" value={newTechId} onChange={(e) => setNewTechId(e.target.value)} disabled={!canCreate || creating}>
            {TECHNICIANS.map((t) => (
              <option value={t.id} key={`new-${t.id}`}>
                {t.name}
              </option>
            ))}
          </select>
          <input
            className="cov-create-input"
            value={newLoc}
            onChange={(e) => setNewLoc(e.target.value)}
            placeholder="Cliente / Obra"
            disabled={!canCreate || creating}
          />
          <input
            className="cov-create-input"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            placeholder="Area (CCTV, Monitor., ...)"
            disabled={!canCreate || creating}
          />
          <button className="cov-create-btn" type="submit" disabled={!canCreate || creating || !newLoc.trim() || !newArea.trim()}>
            {creating ? "Creando..." : "Crear"}
          </button>
        </form>
        {createError && <div className="cov-create-error">Error: {createError}</div>}
        {!canCreate && <div className="cov-create-note">Solo un usuario ADMIN puede crear clientes (y no puede hacerse durante una ausencia activa).</div>}
      </div>
      <div className="cov-normal-grid">
        {TECHNICIANS.map((tec) => {
          const rows = assignments[tec.id] || [];
          return (
            <div
              className={`cov-area-card ${dragTargetTechId === tec.id ? "cov-drop-active" : ""}`}
              key={tec.id}
              onDragOver={(e) => onDragOver(e, tec.id)}
              onDragLeave={() => onDragLeave(tec.id)}
              onDrop={(e) => onDrop(e, tec.id)}
            >
              <div className="cov-area-head">
                <span className="cov-area-dot" style={{ background: tec.accentVar }}></span>
                {tec.name} - {rows.length} tareas
              </div>
              {rows.map((row, index) => (
                <div
                  className={`cov-sub-row ${canEdit ? "cov-draggable-row" : ""}`}
                  key={`${tec.id}-${row.loc}-${row.area}-${index}`}
                  draggable={canEdit}
                  onDragStart={(e) => onDragStart(e, tec.id, index)}
                  onDragEnd={onDragEnd}
                >
                  <span className="cov-loc">{row.loc}</span>
                  <span className={`cov-pill ${tec.pillClass}`}>{row.area}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AbsenceView({
  absentId,
  assignments,
  baseAssignments,
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  canEdit,
  saving,
  error,
  onApply,
  onClear,
}) {
  const absent = TECHNICIAN_BY_ID[absentId];
  const sourceAssignments = baseAssignments || assignments;
  const coverage = useMemo(() => buildAbsenceCoverage(absentId, sourceAssignments), [absentId, sourceAssignments]);
  const safeRange = useMemo(() => clampAbsenceRange(rangeStart, rangeEnd), [rangeStart, rangeEnd]);
  const rangeDays = useMemo(() => daysInclusive(safeRange.start, safeRange.end), [safeRange.end, safeRange.start]);

  if (!absent) {
    return null;
  }

  return (
    <div className="cov-panel active">
      <div className="cov-alert-box cov-warn">
        <i className="cov-alert-icon">!</i>
        <span>
          Ausente: <strong>{absent.name}</strong>.
          {" "}
          {safeRange.start && safeRange.end ? (
            <>
              Del <strong>{formatIsoDateEs(safeRange.start)}</strong> al <strong>{formatIsoDateEs(safeRange.end)}</strong>
              {" "}
              {rangeDays ? `(${rangeDays} dia(s))` : ""}
              .{" "}
            </>
          ) : (
            " "
          )}
          Las tareas se redistribuyen automaticamente segun la carga actual del equipo.
        </span>
      </div>
      <div className="cov-range">
        <div className="cov-range-title">Rango de ausencia</div>
        <div className="cov-range-row">
          <label className="cov-range-field">
            <span className="cov-range-label">Desde</span>
            <input
              className="cov-range-input"
              type="date"
              value={safeRange.start}
              onChange={(e) => onRangeStartChange(e.target.value)}
            />
          </label>
          <label className="cov-range-field">
            <span className="cov-range-label">Hasta</span>
            <input
              className="cov-range-input"
              type="date"
              value={safeRange.end}
              onChange={(e) => onRangeEndChange(e.target.value)}
            />
          </label>
        </div>
        <div className="cov-range-note">
          El reparto se aplica y se guarda para el rango indicado usando los criterios actuales de carga.
        </div>
        <div className="cov-range-actions">
          <button className="cov-range-btn" type="button" onClick={onApply} disabled={!canEdit || saving}>
            {saving ? "Aplicando..." : "Aplicar y guardar"}
          </button>
          <button className="cov-range-btn cov-range-btn-secondary" type="button" onClick={onClear} disabled={!canEdit || saving}>
            Retirar ausencia
          </button>
          {error && <div className="cov-range-error">Error: {error}</div>}
          {!canEdit && <div className="cov-range-note">Solo un usuario ADMIN puede aplicar/retirar la ausencia.</div>}
        </div>
      </div>
      <div className="cov-areas">
        <div className="cov-area-card">
          <div className="cov-area-head">
            <span className="cov-area-dot" style={{ background: absent.accentVar }}></span>
            CCTV - cubre
          </div>
          {coverage.cctv.map((row) => (
            <div className="cov-sub-row" key={`${absentId}-cctv-${row.loc}`}>
              <span className="cov-loc">{row.loc}</span>
              <span className={`cov-pill ${TECHNICIAN_BY_ID[row.by].pillClass}`}>{TECHNICIAN_BY_ID[row.by].name}</span>
            </div>
          ))}
        </div>
        <div className="cov-area-card">
          <div className="cov-area-head">
            <span className="cov-area-dot" style={{ background: absent.accentVar }}></span>
            Monitorizacion - cubre
          </div>
          {coverage.monitoring.map((row) => (
            <div className="cov-sub-row" key={`${absentId}-monitor-${row.loc}`}>
              <span className="cov-loc">{row.loc}</span>
              <span className={`cov-pill ${TECHNICIAN_BY_ID[row.by].pillClass}`}>{TECHNICIAN_BY_ID[row.by].name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="cov-load-summary">
        <div className="cov-load-title">Carga resultante durante ausencia</div>
        <div className="cov-load-bars">
          {coverage.loads.map((load) => (
            <div className="cov-bar-row" key={`${absentId}-${load.id}-bar`}>
              <span className="cov-bar-name">{TECHNICIAN_BY_ID[load.id].name}</span>
              <div className="cov-bar-track">
                <div className="cov-bar-fill" style={{ width: `${load.width}%`, background: TECHNICIAN_BY_ID[load.id].accentVar }} />
              </div>
              <span className="cov-bar-count">{load.summary}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CoveragePlanner({ userRole }) {
  const [selected, setSelected] = useState(null);
  const [assignments, setAssignments] = useState(cloneAssignments(DEFAULT_ASSIGNMENTS));
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragTargetTechId, setDragTargetTechId] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [absenceStart, setAbsenceStart] = useState(isoToday());
  const [absenceEnd, setAbsenceEnd] = useState(isoToday());
  const [coverageMode, setCoverageMode] = useState("normal"); // normal | absence
  const [activeAbsence, setActiveAbsence] = useState(null); // { absentId, start_date, end_date } | null
  const [absenceBaseAssignments, setAbsenceBaseAssignments] = useState(null);
  const [absenceSaving, setAbsenceSaving] = useState(false);
  const [absenceError, setAbsenceError] = useState("");
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");

  const canEdit = userRole === "ADMIN";
  const canCreate = canEdit && coverageMode !== "absence";

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coverage/assignments", { credentials: "same-origin" });
      if (!res.ok) {
        throw new Error("No se pudo cargar la asignacion de soporte");
      }
      const json = await res.json();
      setAssignments(cloneAssignments(json.assignments || EMPTY_ASSIGNMENTS));
      setCoverageMode(json.mode === "absence" ? "absence" : "normal");
      setActiveAbsence(json.absence || null);
      setAbsenceBaseAssignments(json.baseAssignments || null);
      if (json.absence?.start_date) setAbsenceStart(json.absence.start_date);
      if (json.absence?.end_date) setAbsenceEnd(json.absence.end_date);
      setSaveError("");
    } catch (err) {
      setAssignments(cloneAssignments(DEFAULT_ASSIGNMENTS));
      setSaveError(err.message || "No se pudo cargar la asignacion");
      setCoverageMode("normal");
      setActiveAbsence(null);
      setAbsenceBaseAssignments(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const persistAssignments = useCallback(async (nextAssignments, previousAssignments) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/coverage/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ assignments: nextAssignments }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo guardar");
      }
      const json = await res.json();
      setAssignments(cloneAssignments(json.assignments || nextAssignments));
      setCoverageMode(json.mode === "absence" ? "absence" : "normal");
      setActiveAbsence(json.absence || null);
    } catch (err) {
      setAssignments(previousAssignments);
      setSaveError(err.message || "Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  }, []);

  const onDragStart = useCallback((event, sourceTechId, taskIndex) => {
    if (!canEdit) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify({ sourceTechId, taskIndex }));
  }, [canEdit]);

  const onDragOver = useCallback((event, targetTechId) => {
    if (!canEdit) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragTargetTechId(targetTechId);
  }, [canEdit]);

  const onDragLeave = useCallback((targetTechId) => {
    if (dragTargetTechId === targetTechId) {
      setDragTargetTechId("");
    }
  }, [dragTargetTechId]);

  const onDragEnd = useCallback(() => {
    setDragTargetTechId("");
  }, []);

  const onDrop = useCallback((event, targetTechId) => {
    if (!canEdit) return;
    event.preventDefault();
    setDragTargetTechId("");
    try {
      const payload = JSON.parse(event.dataTransfer.getData("text/plain") || "{}");
      const sourceTechId = payload.sourceTechId;
      const taskIndex = Number(payload.taskIndex);
      if (!sourceTechId || !Number.isInteger(taskIndex)) return;
      if (sourceTechId === targetTechId) return;

      const previousAssignments = cloneAssignments(assignments);
      const nextAssignments = moveTaskBetweenTechnicians(assignments, sourceTechId, taskIndex, targetTechId);
      setAssignments(nextAssignments);
      persistAssignments(nextAssignments, previousAssignments);
    } catch (_err) {
      setSaveError("Movimiento invalido");
    }
  }, [assignments, canEdit, persistAssignments]);

  const loadByTech = useMemo(
    () => Object.fromEntries(TECHNICIANS.map((tec) => [tec.id, (assignments[tec.id] || []).length])),
    [assignments]
  );

  const clientMatches = useMemo(() => {
    const query = clientQuery.trim().toLowerCase();
    if (!query) return [];

    const matches = [];
    for (const tec of TECHNICIANS) {
      const rows = assignments[tec.id] || [];
      for (const row of rows) {
        const loc = String(row.loc || "");
        if (!loc.toLowerCase().includes(query)) continue;
        matches.push({ loc, area: row.area, techId: tec.id });
      }
    }

    matches.sort((a, b) => {
      const locCmp = a.loc.localeCompare(b.loc, "es", { sensitivity: "base" });
      if (locCmp !== 0) return locCmp;
      const areaCmp = String(a.area || "").localeCompare(String(b.area || ""), "es", { sensitivity: "base" });
      if (areaCmp !== 0) return areaCmp;
      return TECHNICIAN_BY_ID[a.techId].name.localeCompare(TECHNICIAN_BY_ID[b.techId].name, "es", { sensitivity: "base" });
    });

    return matches;
  }, [assignments, clientQuery]);

  const applyAbsence = useCallback(async () => {
    if (!canEdit) return;
    if (!selected || selected === "normal") return;
    const safeRange = clampAbsenceRange(absenceStart, absenceEnd);
    if (!safeRange.start || !safeRange.end) {
      setAbsenceError("Selecciona un rango de fechas valido");
      return;
    }

    setAbsenceSaving(true);
    setAbsenceError("");
    try {
      const res = await fetch("/api/coverage/absence/apply", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ absentId: selected, start_date: safeRange.start, end_date: safeRange.end }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo aplicar la ausencia");
      }
      const json = await res.json();
      setAssignments(cloneAssignments(json.assignments || EMPTY_ASSIGNMENTS));
      setCoverageMode(json.active ? "absence" : "normal");
      setActiveAbsence(json.absence || null);
      setAbsenceBaseAssignments(json.baseAssignments || null);
    } catch (err) {
      setAbsenceError(err.message || "No se pudo aplicar la ausencia");
    } finally {
      setAbsenceSaving(false);
    }
  }, [absenceEnd, absenceStart, canEdit, selected]);

  const clearAbsence = useCallback(async () => {
    if (!canEdit) return;
    setAbsenceSaving(true);
    setAbsenceError("");
    try {
      const res = await fetch("/api/coverage/absence", { method: "DELETE", credentials: "same-origin" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo retirar la ausencia");
      }
      await fetchAssignments();
    } catch (err) {
      setAbsenceError(err.message || "No se pudo retirar la ausencia");
    } finally {
      setAbsenceSaving(false);
    }
  }, [canEdit, fetchAssignments]);

  const createClient = useCallback(async ({ technician_id, loc, area }) => {
    if (!canEdit) return;
    setCreateSaving(true);
    setCreateError("");
    try {
      const res = await fetch("/api/coverage/assignments/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ technician_id, loc, area }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo crear");
      }
      const json = await res.json();
      setAssignments(cloneAssignments(json.assignments || EMPTY_ASSIGNMENTS));
      setCoverageMode(json.mode === "absence" ? "absence" : "normal");
      setActiveAbsence(json.absence || null);
      setAbsenceBaseAssignments(json.baseAssignments || null);
    } catch (err) {
      setCreateError(err.message || "No se pudo crear");
    } finally {
      setCreateSaving(false);
    }
  }, [canEdit]);

  return (
    <section className="cov-root">
      <div className="cov-main">
        <div className="cov-intro">
          <h1>Plan de sustituciones</h1>
          <p>
            Selecciona el tecnico que esta ausente para ver quien asume cada tarea.
            <br />
            Operativa remota, con balance por volumen de asignaciones y reparto editable en tiempo real.
          </p>
        </div>

        {coverageMode === "absence" && activeAbsence && (
          <div className="cov-alert-box cov-warn">
            <i className="cov-alert-icon">!</i>
            <span>
              Ausencia activa hoy: <strong>{TECHNICIAN_BY_ID[activeAbsence.absentId]?.name || activeAbsence.absentId}</strong> del{" "}
              <strong>{formatIsoDateEs(activeAbsence.start_date)}</strong> al <strong>{formatIsoDateEs(activeAbsence.end_date)}</strong>.
            </span>
          </div>
        )}

        <div className="cov-search">
          <div className="cov-search-head">
            <div className="cov-search-title">Buscar cliente</div>
            <div className="cov-search-hint">Busca por nombre de cliente/obra y te indica el tecnico asignado.</div>
          </div>
          <div className="cov-search-row">
            <input
              className="cov-search-input"
              type="search"
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              placeholder="Ej: Parque Santiago, Corales, CC Siam Mall…"
              aria-label="Buscar cliente en asignacion de soporte"
            />
            {clientQuery.trim() && (
              <button className="cov-search-clear" type="button" onClick={() => setClientQuery("")} aria-label="Limpiar busqueda">
                Limpiar
              </button>
            )}
          </div>

          {clientQuery.trim() && (
            <div className="cov-search-results" role="region" aria-label="Resultados de busqueda de cliente">
              <div className="cov-search-meta">
                {loading ? "Cargando asignacion…" : clientMatches.length ? `${clientMatches.length} resultado(s)` : "Sin resultados"}
              </div>
              {!loading &&
                clientMatches.slice(0, 30).map((match, idx) => (
                  <div className="cov-search-item" key={`${match.techId}-${match.loc}-${match.area}-${idx}`}>
                    <span className="cov-loc">{match.loc}</span>
                    <span className="cov-search-right">
                      <span className="cov-pill cov-pill-area">{match.area}</span>
                      <span className={`cov-pill ${TECHNICIAN_BY_ID[match.techId].pillClass}`}>{TECHNICIAN_BY_ID[match.techId].name}</span>
                    </span>
                  </div>
                ))}
              {!loading && clientMatches.length > 30 && (
                <div className="cov-search-more">Refina la busqueda para ver mas (mostrando 30).</div>
              )}
            </div>
          )}
        </div>

        <div className="cov-selector-label">Tecnico ausente hoy</div>
        <div className="cov-selector" id="tour-coverage-selector">
          <button
            className={`cov-btn-normal ${selected === "normal" ? "active" : ""}`}
            onClick={() => setSelected("normal")}
            type="button"
          >
            <div className="cov-initials-n">▶</div>
            <div>
              <span className="cov-tec-name">Ver asignacion normal</span>
              <span className="cov-tec-load">Todo el equipo presente - reparto habitual</span>
            </div>
          </button>

          {TECHNICIANS.map((tec) => (
            <button
              key={tec.id}
              className={`cov-tec-btn ${selected === tec.id ? "active" : ""}`}
              data-tec={tec.id}
              onClick={() => setSelected(tec.id)}
              type="button"
            >
              <div className="cov-initials">{tec.initials}</div>
              <span className="cov-tec-name">{tec.name}</span>
              <span className="cov-tec-load">{loadByTech[tec.id] || 0} tareas</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="cov-placeholder">
            <div className="cov-sym">...</div>
            <p>Cargando asignacion guardada...</p>
          </div>
        )}

        {!selected && !loading && (
          <div className="cov-placeholder">
            <div className="cov-sym">?</div>
            <p>Selecciona un tecnico para ver su plan de cobertura</p>
          </div>
        )}

        {!loading && selected === "normal" && (
          <NormalView
            assignments={assignments}
            canEdit={canEdit && coverageMode !== "absence"}
            canCreate={canCreate}
            creating={createSaving}
            createError={createError}
            dragTargetTechId={dragTargetTechId}
            saving={saving}
            saveError={saveError}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onCreate={createClient}
          />
        )}
        {!loading && selected && selected !== "normal" && (
          <AbsenceView
            absentId={selected}
            assignments={assignments}
            baseAssignments={absenceBaseAssignments}
            rangeStart={absenceStart}
            rangeEnd={absenceEnd}
            onRangeStartChange={setAbsenceStart}
            onRangeEndChange={setAbsenceEnd}
            canEdit={canEdit}
            saving={absenceSaving}
            error={absenceError}
            onApply={applyAbsence}
            onClear={clearAbsence}
          />
        )}
      </div>

      <footer className="cov-footer">Contel Ingenieros · Dpto. Sistemas y Desarrollo · Uso interno</footer>
    </section>
  );
}
