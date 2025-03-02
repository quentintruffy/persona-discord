-- Table des guildes (serveurs Discord)
CREATE TABLE IF NOT EXISTS "public"."guilds" (
    "id" text PRIMARY KEY,
    "name" text NOT NULL,
    "icon" text,
    "owner_id" text NOT NULL,
    "joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "public"."guilds" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."guilds" USING (true);

-- Table des configurations de guild
CREATE TABLE IF NOT EXISTS "public"."guild_configs" (
    "guild_id" text PRIMARY KEY REFERENCES "public"."guilds"("id") ON DELETE CASCADE,
    "prefix" text DEFAULT '!' not null,
    "welcome_channel_id" text,
    "enabled_modules" text[] DEFAULT '{}'::text[],
    "custom_settings" jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE "public"."guild_configs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."guild_configs" USING (true);
