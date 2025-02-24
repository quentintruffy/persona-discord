import { z } from "zod";

const GuildSchema = z.object({
  id: z.string(),
  created_at: z.date(),
});

type GuildType = z.infer<typeof GuildSchema>;

export default GuildSchema;
export type { GuildType };
