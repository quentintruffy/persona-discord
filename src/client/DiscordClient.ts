/**
 * Client Discord personnalisé qui gère les événements et les commandes
 */
import { ActivityType, Client, IntentsBitField } from "discord.js";
import "dotenv/config";
import { EventManager } from "../manager/EventManager";
import { CommandManager } from "../manager/commandmanager";
import { ModuleManager } from "../manager/modulemanager";

/**
 * Client Discord étendu avec des gestionnaires d'événements et de commandes
 */
export default class DiscordClient extends Client {
  /** Gestionnaire d'événements */
  public readonly event_manager: EventManager;

  /** Gestionnaire de commandes */
  public readonly command_manager: CommandManager;

  /** Gestionnaire de modules */
  public readonly module_manager: ModuleManager;

  /**
   * Crée une nouvelle instance du client Discord personnalisé
   */
  constructor() {
    // Configurer le client avec les intents et la présence
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

    // Initialiser les gestionnaires après l'appel à super()
    this.event_manager = new EventManager(this);
    this.command_manager = new CommandManager(this);
    this.module_manager = new ModuleManager(this);
  }

  /**
   * Connecte le bot à Discord et charge les événements et commandes
   */
  public async connect(): Promise<void> {
    try {
      console.log("Démarrage du bot Discord...");

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
          "CLIENT_TOKEN n'est pas défini dans les variables d'environnement"
        );
      }

      await this.login(token);
      console.log("✓ Bot connecté à Discord avec succès");
    } catch (err) {
      console.error(
        "Échec de la connexion du bot Discord :",
        err instanceof Error ? err.message : err
      );
      process.exit(1); // Quitter le processus en cas d'échec critique
    }
  }
}
