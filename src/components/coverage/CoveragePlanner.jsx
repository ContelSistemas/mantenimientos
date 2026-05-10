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

function NormalView({
  assignments,
  canEdit,
  dragTargetTechId,
  saving,
  saveError,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  const totalTasks = useMemo(() => TECHNICIANS.reduce((sum, tec) => sum + (assignments[tec.id]?.length || 0), 0), [assignments]);

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

function AbsenceView({ absentId, assignments }) {
  const absent = TECHNICIAN_BY_ID[absentId];
  const coverage = useMemo(() => buildAbsenceCoverage(absentId, assignments), [absentId, assignments]);

  if (!absent) {
    return null;
  }

  return (
    <div className="cov-panel active">
      <div className="cov-alert-box cov-warn">
        <i className="cov-alert-icon">!</i>
        <span>
          Ausente: <strong>{absent.name}</strong>. Las tareas se redistribuyen automaticamente segun la carga actual del equipo.
        </span>
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

  const canEdit = userRole === "ADMIN";

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coverage/assignments", { credentials: "same-origin" });
      if (!res.ok) {
        throw new Error("No se pudo cargar la asignacion de soporte");
      }
      const json = await res.json();
      setAssignments(cloneAssignments(json.assignments || EMPTY_ASSIGNMENTS));
      setSaveError("");
    } catch (err) {
      setAssignments(cloneAssignments(DEFAULT_ASSIGNMENTS));
      setSaveError(err.message || "No se pudo cargar la asignacion");
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
            canEdit={canEdit}
            dragTargetTechId={dragTargetTechId}
            saving={saving}
            saveError={saveError}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          />
        )}
        {!loading && selected && selected !== "normal" && <AbsenceView absentId={selected} assignments={assignments} />}
      </div>

      <footer className="cov-footer">Contel Ingenieros · Dpto. Sistemas y Desarrollo · Uso interno</footer>
    </section>
  );
}
