import { z } from 'zod';

/**
 * Schéma pour valider un ban de Pulsar
 */
export const PulsarPunishmentSchema = z.object({
  user_id: z.string(),
  reason: z.string(),
  created_at: z.string().datetime({ offset: true }),
});
export type PulsarPunishmentType = z.infer<typeof PulsarPunishmentSchema>;
