import { z } from 'zod';

/**
 * Schéma pour une configuration de guilde
 */
export const GuildConfigSchema = z.object({
  guild_id: z.string(),
  prefix: z.string().default('!'),
  welcome_channel_id: z.string().optional().nullable(),
  enabled_modules: z.string().array().default([]).optional(),
});
export type GuildConfigType = z.infer<typeof GuildConfigSchema>;
