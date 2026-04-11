import { useState } from "react";
import "./login.css";

export function LoginPage({ onLogin, loading, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username.trim(), password);
  };

  return (
    <div className="login-root">
      <div className="login-tech-bg" aria-hidden="true">
        <div className="signal-orbit orbit-1"></div>
        <div className="signal-orbit orbit-2"></div>
        <div className="signal-orbit orbit-3"></div>
        <div className="node-grid"></div>
        <div className="beam beam-a"></div>
        <div className="beam beam-b"></div>
      </div>

      <div className="login-panel">
        <div className="brand-row">
          <div className="brand-icon">TX</div>
          <div>
            <div className="brand-top">Contel Ingenieros</div>
            <h1>Acceso a Plataforma</h1>
          </div>
        </div>

        <p className="login-subtitle">
          Monitorizacion, helpdesk y asignacion de soporte.
          <br />
          Inicia sesion para continuar.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin o viewer"
              autoComplete="username"
              required
              disabled={loading}
            />
          </label>

          <label>
            Contrasena
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contrasena"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </label>

          {error ? <div className="login-error">{error}</div> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Conectando..." : "Iniciar Sesion"}
          </button>
        </form>
      </div>
    </div>
  );
}
