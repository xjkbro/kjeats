export const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'] as const;

export type PriceRange = (typeof PRICE_RANGES)[number];
