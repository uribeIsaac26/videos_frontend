import type { MangaTag } from "../types/Manga";

export function displayTagName(tag: MangaTag) {
  if (tag.esMale) return tag.name.replace(/^male:/, "");
  if (tag.esFemale) return tag.name.replace(/^female:/, "");
  return tag.name;
}

// El backend divide "q" por espacios (ver MangaListPage), así que los valores
// multi-palabra deben viajar con "_" en vez de espacios.
function encodeSearchValue(value: string): string {
  return value.trim().replace(/\s+/g, "_");
}

export function buildLanguageSearchQuery(language: string): string {
  return `language:${encodeSearchValue(language)}`;
}

export function buildTagSearchQuery(tag: MangaTag): string {
  if (tag.esMale) return `male:${encodeSearchValue(displayTagName(tag))}`;
  if (tag.esFemale) return `female:${encodeSearchValue(displayTagName(tag))}`;
  return `tag:${encodeSearchValue(tag.name)}`;
}

export function buildArtistSearchQuery(artist: string): string {
  return `artist:${encodeSearchValue(artist)}`;
}

export function buildGroupSearchQuery(group: string): string {
  return `group:${encodeSearchValue(group)}`;
}

export function buildParodySearchQuery(parody: string): string {
  return `parody:${encodeSearchValue(parody)}`;
}
