import type { Tag } from "./Tag";

export interface Video {
    id: number;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    size: number;
    status: "PROCESANDO" | "LISTO" | "ERROR";
    errorMessage: string | null;
    tags: Tag[];
}