import { ActivityType, Client, Guild, IntentsBitField } from "discord.js";
import "dotenv/config";
import { CommandManager } from "../manager/CommandManager";
import { EventManager } from "../manager/EventManager";
import { GuildType } from "../schemas/GuildSchema";
import { supabase } from "../utils/supabase";

export default class DiscordClient extends Client {
  event_manager = new EventManager(this);
  command_manager = new CommandManager(this);

  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates,
      ],
      presence: {
        activities: [
          {
            name: "Persona.app - Lify's Shard",
            type: ActivityType.Custom,
          },
        ],
        status: "online",
      },
    });
  }

  connect = async () => {
    try {
      await this.event_manager.loadEvents();
      await this.command_manager.loadCommands();

      await this.login(process.env.CLIENT_TOKEN);
      await this.checkGuilds();
    } catch (err) {
      console.log("Failed to connect to the Discord bot :", err);
    }
  };

  addGuild = async (guild: Guild) => {
    try {
      const { data, error } = await supabase.from("guilds").insert([
        {
          id: guild.id,
          created_at: new Date(),
        },
      ]);

      if (error) {
        console.error("Failed to add guild to the database :", error);
      }
    } catch (err) {
      console.log("Failed to add guild to the database :", err);
    }
  };

  addGuilds = async (guilds: GuildType[]) => {
    try {
      const { data, error } = await supabase.from("guilds").insert(guilds);

      if (error) {
        console.error("Failed to add guilds to the database :", error);
      }
    } catch (err) {
      console.log("Failed to add guilds to the database :", err);
    }
  };

  removeGuild = async (guild: Guild) => {
    try {
      const { data, error } = await supabase.from("guilds").delete().match({
        id: guild.id,
      });
      if (error) {
        console.error("Failed to remove guild from the database :", error);
      }
    } catch (err) {
      console.log("Failed to remove guild from the database :", err);
    }
  };

  // Check for all guilds if they are in the database or not and add them if they are not
  checkGuilds = async () => {
    try {
      // Récupère uniquement les nouveaux guilds en une seule requête
      const { data: existingGuilds, error } = await supabase
        .from("guilds")
        .select("id")
        .in(
          "id",
          this.guilds.cache.map((guild) => guild.id)
        );

      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }

      // Optimisation avec Map pour une recherche O(1)
      const existingGuildMap = new Map(
        existingGuilds?.map((g) => [g.id, true]) || []
      );

      // Filtre directement pendant l'itération du cache
      const newGuilds = Array.from(this.guilds.cache)
        .filter(([id]) => !existingGuildMap.has(id))
        .map(([id]) => ({
          id,
          created_at: new Date(),
        }));

      if (newGuilds.length > 0) {
        // Utilisation de .upsert pour éviter les doublons potentiels
        await supabase.from("guilds").upsert(newGuilds, { onConflict: "id" });
      }
    } catch (error) {
      console.error("Guild synchronization failed:", error);
    }
  };
}
