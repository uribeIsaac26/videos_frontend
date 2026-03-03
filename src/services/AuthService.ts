
const API_URL = import.meta.env.VITE_API_URL;

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 🔥 OBLIGATORIO
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Credenciales invalidas");
  }
}

export async function logout() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function checkAuth() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });

  return response.ok;
}
