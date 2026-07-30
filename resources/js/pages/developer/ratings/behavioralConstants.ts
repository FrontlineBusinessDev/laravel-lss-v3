/**
 * @file pages/developer/ratings/behavioralConstants.ts
 * Shared between the Setup and Question modal — split out so neither imports
 * the other's default-exported component.
 */
export const TYPE_LABEL = {
    rating: 'Rated 1–5',
    text: 'Written response',
} as const;
