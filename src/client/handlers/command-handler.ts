import {
  ChatInputCommandInteraction,
  Collection,
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import DiscordClient from '../discord-client';

/**
 * Gère le chargement et l'exécution des commandes du bot
 */
export class CommandManager {
  /** Instance du client Discord */
  private readonly client: DiscordClient;

  /** Chemin vers le dossier des commandes */
  private readonly commandsPath: string;

  /** Collection des commandes chargées */
  public readonly commands: Collection<string, ICommand>;

  /** Instance REST pour les appels API Discord */
  private readonly rest: REST;

  /**
   * Crée une nouvelle instance du gestionnaire de commandes
   * @param client - Le client Discord auquel ce gestionnaire est associé
   * @param customPath - Chemin personnalisé vers les commandes (optionnel)
   */
  constructor(client: DiscordClient, customPath?: string) {
    this.client = client;
    this.commandsPath = customPath || join(process.cwd(), 'src/commands');
    this.commands = new Collection();

    // Initialiser l'instance REST avec le token du client
    const token = process.env.CLIENT_TOKEN;
    if (!token) {
      throw new Error(
        "CLIENT_TOKEN n'est pas défini dans les variables d'environnement",
      );
    }
    this.rest = new REST().setToken(token);
  }

  /**
   * Charge toutes les commandes depuis le dossier de commandes
   */
  public async loadCommands(): Promise<void> {
    try {
      // Récupérer tous les fichiers de commandes
      const commandFiles = this.getCommandFiles();

      // Charger les commandes
      for (const file of commandFiles) {
        await this.loadCommand(file);
      }

      console.log(`✓ ${this.commands.size} commandes chargées`);
    } catch (error) {
      this.handleError('Erreur lors du chargement des commandes', error);
    }
  }

  /**
   * Récupère les fichiers de commandes depuis le dossier configuré
   * @returns Liste des fichiers de commandes
   */
  private getCommandFiles(): string[] {
    try {
      return readdirSync(this.commandsPath).filter(
        (file) => file.endsWith('.js') || file.endsWith('.ts'),
      );
    } catch (error) {
      console.warn(
        `Attention: Impossible de lire le dossier de commandes ${this.commandsPath}`,
      );
      return [];
    }
  }

  /**
   * Charge une commande spécifique
   * @param fileName - Nom du fichier à charger
   */
  private async loadCommand(fileName: string): Promise<void> {
    try {
      const filePath = join(this.commandsPath, fileName);
      const commandModule = await this.importCommand(filePath);

      this.validateAndRegisterCommand(commandModule, fileName);
    } catch (error) {
      this.handleError(`Erreur lors du chargement de ${fileName}`, error);
    }
  }

  /**
   * Importe un module de commande
   * @param filePath - Chemin complet vers le fichier
   * @returns Module de commande importé
   */
  private async importCommand(filePath: string): Promise<ICommand> {
    const imported = await import(filePath);
    return imported.default || imported;
  }

  /**
   * Valide et enregistre une commande dans la collection
   * @param command - Commande à valider et enregistrer
   * @param fileName - Nom du fichier pour les logs d'erreur
   */
  private validateAndRegisterCommand(
    command: ICommand,
    fileName: string,
  ): void {
    this.validateCommand(command, fileName);
    this.commands.set(command.data.name, command);
  }

  /**
   * Valide qu'un module est bien une commande conforme
   * @param command - Module à valider
   * @param fileName - Nom du fichier pour les messages d'erreur
   */
  private validateCommand(
    command: any,
    fileName: string,
  ): asserts command is ICommand {
    if (!command?.data?.name) {
      throw new Error(`La commande ${fileName} doit avoir un nom`);
    }

    if (typeof command.execute !== 'function') {
      throw new Error(`La commande ${fileName} doit avoir une méthode execute`);
    }
  }

  /**
   * Ajoute manuellement une commande à la collection
   * @param command - La commande à ajouter
   * @returns true si la commande a été ajoutée, false si elle existait déjà
   */
  public addCommand(command: ICommand): boolean {
    try {
      // Vérifier si la commande existe déjà
      if (this.commands.has(command.data.name)) {
        console.warn(
          `La commande "${command.data.name}" existe déjà et sera remplacée.`,
        );
      }

      // Valider la commande
      this.validateCommand(command, command.data.name);

      // Ajouter la commande à la collection
      this.commands.set(command.data.name, command);

      return true;
    } catch (error) {
      this.handleError(
        `Erreur lors de l'ajout de la commande ${command.data.name}`,
        error,
      );
      return false;
    }
  }

  /**
   * Convertit toutes les commandes ou un sous-ensemble en format JSON pour l'API Discord
   * @param commandNames - Liste facultative des noms de commandes à convertir (toutes si non spécifié)
   * @returns Tableau de commandes au format JSON
   */
  private getCommandsAsJSON(
    commandNames?: string[],
  ): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    try {
      const commandsToConvert = commandNames
        ? this.commands.filter((_, name) => commandNames.includes(name))
        : this.commands;

      return [...commandsToConvert.values()].map((cmd) => cmd.data.toJSON());
    } catch (error) {
      this.handleError(
        'Erreur lors de la conversion des commandes en JSON',
        error,
      );
      return [];
    }
  }

  /**
   * Déploie les commandes sur une guilde spécifique
   * @param guildId - ID de la guilde où déployer les commandes
   * @param commandNames - Liste facultative des noms de commandes à déployer
   * @returns Nombre de commandes déployées
   */
  public async deployCommandsToGuild(
    guildId: string,
    commandNames?: string[],
  ): Promise<number> {
    try {
      if (!this.client.application?.id) {
        throw new Error("L'ID de l'application n'est pas disponible");
      }

      const commands = this.getCommandsAsJSON(commandNames);
      if (commands.length === 0) {
        console.warn('Aucune commande à déployer');
        return 0;
      }

      console.log(
        `Déploiement de ${commands.length} commandes sur la guilde ${guildId}...`,
      );

      const data = (await this.rest.put(
        Routes.applicationGuildCommands(this.client.application.id, guildId),
        { body: commands },
      )) as any[];

      console.log(
        `✓ ${data.length} commandes déployées avec succès sur la guilde ${guildId}`,
      );
      return data.length;
    } catch (error) {
      this.handleError(
        `Erreur lors du déploiement des commandes sur la guilde ${guildId}`,
        error,
      );
      return 0;
    }
  }

  /**
   * Déploie les commandes sur plusieurs guildes
   * @param guildIds - Liste des IDs de guildes où déployer les commandes
   * @param commandNames - Liste facultative des noms de commandes à déployer
   * @returns Map des guildes avec le nombre de commandes déployées pour chacune
   */
  public async deployCommandsToGuilds(
    guildIds: string[],
    commandNames?: string[],
  ): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    for (const guildId of guildIds) {
      try {
        const deployed = await this.deployCommandsToGuild(
          guildId,
          commandNames,
        );
        results.set(guildId, deployed);
      } catch (error) {
        this.handleError(
          `Erreur lors du déploiement sur la guilde ${guildId}`,
          error,
        );
        results.set(guildId, 0);
      }
    }

    // Afficher un résumé
    let totalSuccess = 0;
    let totalFailed = 0;

    results.forEach((count, guildId) => {
      if (count > 0) {
        totalSuccess++;
      } else {
        totalFailed++;
      }
    });

    console.log(
      `Déploiement terminé : ${totalSuccess} guildes avec succès, ${totalFailed} échecs`,
    );
    return results;
  }

  /**
   * Déploie les commandes globalement (pour toutes les guildes)
   * @param commandNames - Liste facultative des noms de commandes à déployer
   * @returns Nombre de commandes déployées
   */
  public async deployCommandsGlobally(
    commandNames?: string[],
  ): Promise<number> {
    try {
      if (!this.client.application?.id) {
        throw new Error("L'ID de l'application n'est pas disponible");
      }

      const commands = this.getCommandsAsJSON(commandNames);
      if (commands.length === 0) {
        console.warn('Aucune commande à déployer');
        return 0;
      }

      console.log(`Déploiement global de ${commands.length} commandes...`);

      const data = (await this.rest.put(
        Routes.applicationCommands(this.client.application.id),
        { body: commands },
      )) as any[];

      console.log(
        `✓ ${data.length} commandes déployées globalement avec succès`,
      );
      return data.length;
    } catch (error) {
      this.handleError(
        'Erreur lors du déploiement global des commandes',
        error,
      );
      return 0;
    }
  }

  /**
   * Gère les erreurs de manière uniforme
   * @param message - Message descriptif de l'erreur
   * @param error - L'erreur à traiter
   */
  private handleError(message: string, error: unknown): void {
    console.error(
      `${message}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Interface définissant la structure d'une commande Discord
 */
export type ICommand = {
  /** Métadonnées de la commande utilisées par Discord */
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder;

  /** Fonction exécutée lorsque la commande est invoquée */
  execute: (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction,
  ) => Promise<void> | void;
};
