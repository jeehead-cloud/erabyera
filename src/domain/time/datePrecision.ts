export const DATE_PRECISIONS = [
  'exact',
  'year',
  'approximate',
  'decade',
  'century',
  'range',
  'before',
  'after',
  'unknown',
] as const

export type DatePrecision = (typeof DATE_PRECISIONS)[number]
