import { ActivityType, Client, IntentsBitField } from 'discord.js';
import { CommandManager } from './handlers/command-handler';
import { EventManager } from './handlers/event-handler';
import { ModuleManager } from './handlers/module-handler';
import { RedisManager } from './managers/redis-manager';
import { SupabaseManager } from './managers/supabase-manager';

export default class DiscordClient extends Client {
  public readonly event_manager: EventManager;
  public readonly command_manager: CommandManager;
  public readonly module_manager: ModuleManager;
  public readonly supabase_manager: SupabaseManager;
  public readonly redis_manager: RedisManager;

  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
      ],
      presence: {
        activities: [
          {
            name: "Persona.app - Lify's Shard",
            type: ActivityType.Custom,
          },
        ],
        status: 'online',
      },
    });
    this.event_manager = new EventManager(this);
    this.command_manager = new CommandManager(this);
    this.module_manager = new ModuleManager(this);
    this.supabase_manager = new SupabaseManager(this);
    this.redis_manager = new RedisManager(this);
  }

  public async connect(): Promise<void> {
    try {
      // Verifier les variables d'environnement
      if (!process.env.CLIENT_ID || !process.env.CLIENT_TOKEN) {
        throw new Error(
          "Les variables d'environnement CLIENT_ID et CLIENT_TOKEN sont requises",
        );
      }
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error(
          "Les variables d'environnement SUPABASE_URL et SUPABASE_KEY sont requises",
        );
      }

      // Charger les gestionnaires d'événements
      await this.event_manager.loadEvents();

      // Charger les commandes
      await this.command_manager.loadCommands();

      // Charger les modules
      await this.module_manager.loadModules();

      // Connexion au Discord
      await this.login(process.env.CLIENT_TOKEN);
    } catch (err) {
      throw err;
    }
  }
}
