/** Semantic colour roles shared by badges, meters, charts and messages. */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'critical';

/** The subset used where only "how bad is it" matters. */
export type SeverityTone = Extract<Tone, 'neutral' | 'warning' | 'critical'>;
