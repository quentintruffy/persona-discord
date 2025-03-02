import { ActivityType, Client, IntentsBitField } from 'discord.js';
import 'dotenv/config';
import { CommandManager } from './managers/commandmanager';
import { EventManager } from './managers/eventmanager';
import { ModuleManager } from './managers/modulemanager';

export default class DiscordClient extends Client {
  public readonly event_manager: EventManager;
  public readonly command_manager: CommandManager;
  public readonly module_manager: ModuleManager;

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
  }

  public async connect(): Promise<void> {
    try {
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
