export const MAX_SEARCH_QUERY_LENGTH = 200
export const MIN_SEARCH_QUERY_LENGTH = 2

export function normalizeSearchText(value: string): string {
  return value
    .slice(0, MAX_SEARCH_QUERY_LENGTH)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}
