import type { Tag } from "./Tag";

export interface Image {
    id: number;
    title: string;
    imageUrl: string;
    size: number;
    contentType: string;
    tags: Tag[];
}
