import { z } from 'zod';

/**
 * Schéma pour valider une membre Discord
 */
export const MemberSchema = z.object({
  id: z.string(),
});
export type MemberType = z.infer<typeof MemberSchema>;
