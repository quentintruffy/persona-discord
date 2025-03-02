import { z } from 'zod';

// Schéma pour les guildes
export const GuildSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    icon: z.string().nullable().optional(),
    owner_id: z.string(),
    joined_at: z.string(),
    created_at: z.string().optional(),
  })
  .strict();
export const GuildsSchema = z.array(GuildSchema);

// Type dérivé du schéma
export type GuildType = z.infer<typeof GuildSchema>;
export type GuildsType = z.infer<typeof GuildSchema>;
