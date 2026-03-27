import type { Tag } from "./Tag";

export interface Video{
    id: number;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    tags: Tag[];
}