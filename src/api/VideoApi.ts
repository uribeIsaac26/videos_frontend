import type { Video } from "../types/Video";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/videos`;

export async function getAllVideos(): Promise<Video[]> {
    const response = await fetch(BASE_URL);

    if(!response.ok){
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
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error uploading video");
  }

  return response.json();
}