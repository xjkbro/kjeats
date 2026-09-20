export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;

export type Difficulty = (typeof DIFFICULTY_LEVELS)[number];
