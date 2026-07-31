import type { MangaDetail, PagedManga } from "../types/Manga";

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = `${API_URL}/api/mangas`;

function handleUnauth(response: Response) {
    if (response.status === 401) {
        window.location.href = "/login";
    }
}

export async function getAllMangas(
    page: number,
    size: number,
    sort: string = "id,desc"
): Promise<PagedManga> {
    const response = await fetch(
        `${BASE_URL}?page=${page}&size=${size}&sort=${sort}`,
        {
            credentials: "include",
        }
    );

    if (!response.ok) {
        handleUnauth(response);
        throw new Error("Error al obtener los mangas");
    }

    return response.json();
}

export async function getMangaById(id: number): Promise<MangaDetail> {
    const response = await fetch(`${BASE_URL}/${id}`, {
        credentials: "include",
    });

    if (!response.ok) {
        handleUnauth(response);
        throw new Error("Error al obtener el manga");
    }

    return response.json();
}

export async function getMangasByTag(
    tagId: string | number | (string | number)[],
    page: number,
    size: number,
    sort: string = "id,desc"
): Promise<PagedManga> {
    const params = new URLSearchParams();

    if (Array.isArray(tagId)) {
        params.set("tagIds", tagId.join(","));
    } else {
        params.set("tagIds", tagId.toString());
    }
    params.set("page", page.toString());
    params.set("size", size.toString());
    params.set("sort", sort);

    const response = await fetch(`${BASE_URL}/tag?${params.toString()}`, {
        credentials: "include",
    });

    if (!response.ok) {
        handleUnauth(response);
        throw new Error("Error al obtener los mangas");
    }

    return response.json();
}

export async function getMangasByArtist(
    nombre: string,
    page: number,
    size: number,
    sort: string = "id,desc"
): Promise<PagedManga> {
    const params = new URLSearchParams({
        nombre,
        page: page.toString(),
        size: size.toString(),
        sort,
    });

    const response = await fetch(`${BASE_URL}/artist?${params.toString()}`, {
        credentials: "include",
    });

    if (!response.ok) {
        handleUnauth(response);
        throw new Error("Error al obtener los mangas");
    }

    return response.json();
}

export async function getMangasByGroup(
    nombre: string,
    page: number,
    size: number,
    sort: string = "id,desc"
): Promise<PagedManga> {
    const params = new URLSearchParams({
        nombre,
        page: page.toString(),
        size: size.toString(),
        sort,
    });

    const response = await fetch(`${BASE_URL}/group?${params.toString()}`, {
        credentials: "include",
    });

    if (!response.ok) {
        handleUnauth(response);
        throw new Error("Error al obtener los mangas");
    }

    return response.json();
}

export async function getMangasByParody(
    nombre: string,
    page: number,
    size: number,
    sort: string = "id,desc"
): Promise<PagedManga> {
    const params = new URLSearchParams({
        nombre,
        page: page.toString(),
        size: size.toString(),
        sort,
    });

    const response = await fetch(`${BASE_URL}/parody?${params.toString()}`, {
        credentials: "include",
    });

    if (!response.ok) {
        handleUnauth(response);
        throw new Error("Error al obtener los mangas");
    }

    return response.json();
}

export async function searchMangas(
    q: string,
    page: number,
    size: number,
    sort: string = "id,desc"
): Promise<PagedManga> {
    const params = new URLSearchParams({
        q,
        page: page.toString(),
        size: size.toString(),
        sort,
    });

    const response = await fetch(`${BASE_URL}/search?${params.toString()}`, {
        credentials: "include",
    });

    if (!response.ok) {
        handleUnauth(response);
        throw new Error("Error al buscar los mangas");
    }

    return response.json();
}
