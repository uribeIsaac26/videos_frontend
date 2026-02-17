import type { Video } from "../types/Video";
import { getToken } from "../services/AuthService";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/videos`;

function getAuthHeaders(){
  const token = getToken();

  return {
    Authorization: `Bearer ${token}`
  }
}

export async function getAllVideos(): Promise<Video[]> {
    const response = await fetch(BASE_URL, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    if(!response.ok){
      if(response.status === 401){
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
        throw new Error("Error al obtener los videos")
    }

    const data: Video[] = await response.json();

    return data;
}

export async function uploadVideo(
  title: string,
  videoFile: File,
  thumbnailFile?: File | null
) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("videoFile", videoFile);

  if (thumbnailFile) {
    formData.append("thumbnailFile", thumbnailFile);
  }

  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!response.ok) {
    if(response.status === 401){
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    throw new Error("Error uploading video");
  }

  return response.json();
}