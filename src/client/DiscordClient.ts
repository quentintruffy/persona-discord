import { ActivityType, Client, IntentsBitField } from 'discord.js';
import 'dotenv/config';
import { CommandManager } from './managers/commandmanager';
import { EventManager } from './managers/eventmanager';
import { ModuleManager } from './managers/modulemanager';
import { GuildService } from './services/GuildService';

export default class DiscordClient extends Client {
  public readonly event_manager: EventManager;
  public readonly command_manager: CommandManager;
  public readonly module_manager: ModuleManager;
  public readonly guild_service: GuildService;

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
        status: 'online',
      },
    });

    this.event_manager = new EventManager(this);
    this.command_manager = new CommandManager(this);
    this.module_manager = new ModuleManager(this);
    this.guild_service = new GuildService();
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

      console.log(
        `[Shard ${this.shard?.ids[0] ?? 0}] Démarrage du bot Discord...`,
      );

      // Charger les événements avant la connexion
      await this.event_manager.loadEvents();

      // Charger les commandes
      await this.command_manager.loadCommands();

      // Charger les modules
      await this.module_manager.loadModules();

      // Se connecter à Discord avec le token
      const token = process.env.CLIENT_TOKEN;
      if (!token) {
        throw new Error(
          "CLIENT_TOKEN n'est pas défini dans les variables d'environnement",
        );
      }

      await this.login(token);
      console.log(
        `[Shard ${this.shard?.ids[0] ?? 0}] Bot connecté à Discord avec succès`,
      );
    } catch (err) {
      console.error(
        `[Shard ${this.shard?.ids[0] ?? 0}] Échec de la connexion:`,
        err instanceof Error ? err.message : err,
      );
      process.exit(1);
    }
  }
}
