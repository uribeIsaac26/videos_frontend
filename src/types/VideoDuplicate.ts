export type AccionDuplicado = "PENDIENTE" | "ES_DUPLICADO" | "NO_ES_DUPLICADO";

export interface VideoResumen {
  id: number;
  title: string;
  thumbnailUrl: string;
}

export interface MiembroDuplicado {
  id: number;
  similitud: number;
  revisado: boolean;
  accion: AccionDuplicado;
  video: VideoResumen;
}

export interface GrupoDuplicado {
  id: number;
  tagOrigen: string;
  dateCreation: string;
  totalMembers: number;
  preview?: MiembroDuplicado;
  members?: MiembroDuplicado[];
}

export interface PagedGruposDuplicados {
  content: GrupoDuplicado[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
