import { z } from 'zod';

/**
 * Schéma pour valider une guilde Discord
 */
export const GuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional().nullable(),
  owner_id: z.string(),
  joined_at: z.string().or(z.date()).optional(),
});
export type GuildType = z.infer<typeof GuildSchema>;
