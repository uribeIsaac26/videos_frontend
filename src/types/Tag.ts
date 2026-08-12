export type TagType = "VIDEO" | "IMAGE" | "MANGA";

export interface Tag{
    id: number;
    name: string;
    type: TagType;
}