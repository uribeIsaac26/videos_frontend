import type { Tag } from "../types/Tag";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/tags`

export async function getAllTags(
    page: number,
    size: number
): Promise<any> {
    const response = await fetch(
        `${BASE_URL}?page=${page}&size=${size}&sort=id,desc`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = "/login";
        }
        throw new Error("Error al obtener los tags")
    }

    const data: Tag[] = await response.json();
    return data;
}

export const getTagById = async (id: number) => {
    const response = await fetch(`${BASE_URL}/${id}`,
        {
            credentials: "include",
        }
    );
    if (!response.ok) throw new Error("Error al obtener el tag");
    return response.json();
}

export async function createTag(
    name: string,
): Promise<any> {
    const response = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: name })
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = "/login";
        }
        throw new Error("No se pudo eliminar el video");
    }

    return response.json();
}