import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkAuth } from "../services/AuthService";
import type { JSX } from "react";

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth()
      .then(setAuthenticated)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando sesión...</div>;

  if (!authenticated) return <Navigate to="/login" />;

  return children;
}