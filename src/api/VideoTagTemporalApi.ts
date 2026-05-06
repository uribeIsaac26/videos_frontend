import type { VideoTagTemporal } from "../types/VideoTagTemporal";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/video-tag-temporal`;

export async function getAllVideosPending(
  page: number,
  size: number,
  sort: string = "id,desc"
): Promise<any> {

  const response = await fetch(
    `${BASE_URL}/pending?page=${page}&size=${size}&sort=${sort}`,
    {
      credentials: "include", // 🔥 CLAVE
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("Error al obtener los videos");
  }

  const data: VideoTagTemporal[] = await response.json();
  return data;
}