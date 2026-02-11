import type { Video } from "../types/Video";

const BASE_URL = "http://localhost:8080/api/videos";

export async function getAllVideos(): Promise<Video[]> {
    const response = await fetch(BASE_URL);

    if(!response){
        throw new Error("Error al obtener los videos")
    }

    const data: Video[] = await response.json();

    return data;
}