import type { Video } from "../types/Video";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/videos`;

export async function getAllVideos(
  page: number,
  size: number,
  sort: string = "id,desc"
): Promise<any> {

  const response = await fetch(
    `${BASE_URL}?page=${page}&size=${size}&sort=${sort}`,
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

  const data: Video[] = await response.json();
  return data;
}

export async function getVideosByTag(
  tagId: string | number | (string | number)[],
  page: number,
  size: number,
  sort: string = "id,desc"
): Promise<any> {

  const params = new URLSearchParams();

  if (Array.isArray(tagId)) {
    tagId.forEach(id => params.append("tagIds", id.toString()));
  } else {
    params.append("tagIds", tagId.toString());
  }
  params.append("page", page.toString());
  params.append("size", size.toString());
  params.append("sort", sort);

    const response = await fetch(
      `${BASE_URL}/tags?${params.toString()}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("Error al obtener los videos");
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

    xhr.withCredentials = true;

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

export async function addTagsToVideo(videoId: number, tagIds: number[]): Promise<any> {
  const response = await fetch(`${BASE_URL}/tag`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ videoId: videoId, tagIds: tagIds })
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("No se pudo eliminar el video");
  }

  return response.json();
}

export async function deleteVideo(id: number) {

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("No se pudo eliminar el video");
  }
}