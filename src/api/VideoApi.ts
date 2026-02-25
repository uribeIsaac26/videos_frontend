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

export async function getAllVideos(
  page: number,
  size: number
): Promise<any> {
    const response = await fetch(
      `${BASE_URL}?page=${page}&size=${size}&sort=id,desc`, {
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

export function uploadVideo(
  title: string,
  videoFile: File,
  thumbnailFile: File | null,
  onProgress: (percent: number) => void
): Promise<any> {

  return new Promise((resolve, reject) => {

    const formData = new FormData();
    formData.append("title", title);
    formData.append("videoFile", videoFile);

    if (thumbnailFile) {
      formData.append("thumbnailFile", thumbnailFile);
    }

    const xhr = new XMLHttpRequest();

    xhr.open("POST", BASE_URL);

    // Auth header
    const token = getToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    // 🔥 Progreso
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        if (xhr.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        reject(new Error("Error uploading video"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

    xhr.send(formData);
  });
}

export async function deleteVideo(id:number) {

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers:{
      ...getAuthHeaders(),
    }
  });

  if(!response.ok){
    throw new Error("No se pudo eliminar el video");
  }
}