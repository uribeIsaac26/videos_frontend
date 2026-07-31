export type MangaTipo =
    | "MANGA"
    | "DOUJINSHI"
    | "ARTIST_CG"
    | "GAME_CG"
    | "IMAGE_SET"
    | "COSPLAY";

export interface MangaTag {
    name: string;
    esMale: boolean;
    esFemale: boolean;
}

export interface MangaPagina {
    orden: number;
    ancho: number;
    alto: number;
    url: string;
}

export interface Manga {
    id: number;
    title: string;
    tipo: MangaTipo;
    language: string;
    languageLocalName: string;
    fechaPublicacion: string;
    portadaUrl: string;
}

export interface MangaDetail extends Manga {
    japaneseTitle: string;
    artists: string[];
    groups: string[];
    parodys: string[];
    tags: MangaTag[];
    paginas: MangaPagina[];
}

export interface PagedManga {
    content: Manga[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}
