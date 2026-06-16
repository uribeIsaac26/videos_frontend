import type { GrupoDuplicado, PagedGruposDuplicados } from "../types/VideoDuplicate";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/video-duplicates`;

function handleUnauth(response: Response) {
  if (response.status === 401) window.location.href = "/login";
}

export async function getGruposDuplicados(
  page: number,
  size: number
): Promise<PagedGruposDuplicados> {
  const response = await fetch(`${BASE_URL}?page=${page}&size=${size}`, {
    credentials: "include",
  });
  if (!response.ok) {
    handleUnauth(response);
    throw new Error("Error al obtener grupos de duplicados");
  }
  return response.json();
}

export async function getGrupoDuplicado(id: number): Promise<GrupoDuplicado> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    credentials: "include",
  });
  if (!response.ok) {
    handleUnauth(response);
    throw new Error("Error al obtener el grupo de duplicados");
  }
  return response.json();
}
