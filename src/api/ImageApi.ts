import type { Image } from "../types/Image";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/images`;

export async function getAllImages(
  page: number,
  size: number,
  sort: string = "id,desc"
): Promise<any> {

  const response = await fetch(
    `${BASE_URL}?page=${page}&size=${size}&sort=${sort}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("Error al obtener las imágenes");
  }

  const data: Image[] = await response.json();
  return data;
}

export async function getImagesByTag(
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
  params.set("page", page.toString());
  params.set("size", size.toString());
  params.set("sort", sort);

  const response = await fetch(
    `${BASE_URL}/tag?${params.toString()}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("Error al obtener las imágenes");
  }

  const data: Image[] = await response.json();
  return data;
}

export function uploadImage(
  title: string,
  imageFile: File,
  onProgress: (percent: number) => void
): Promise<any> {

  return new Promise((resolve, reject) => {

    const formData = new FormData();
    formData.append("title", title);
    formData.append("imageFile", imageFile);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", BASE_URL);

    xhr.withCredentials = true;

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
          window.location.href = "/login";
        }
        reject(new Error("Error uploading image"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

    xhr.send(formData);
  });
}

export async function addTagsToImage(imageId: number, tagIds: number[]): Promise<any> {
  const response = await fetch(`${BASE_URL}/tag`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ imageId: imageId, tagIds: tagIds })
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("No se pudieron guardar los tags de la imagen");
  }

  return response.json();
}

export async function deleteImage(id: number) {

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = "/login";
    }
    throw new Error("No se pudo eliminar la imagen");
  }
}
