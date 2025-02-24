import {
  ChatInputCommandInteraction,
  Collection,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import DiscordClient from "../client/DiscordClient";

const rest = new REST().setToken(process.env.CLIENT_TOKEN as string);

export type ICommand = {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction
  ) => Promise<void> | void;
};

export class CommandManager {
  private readonly client: DiscordClient;
  private readonly commandsPath: string;
  public readonly commands: Collection<string, ICommand>;

  constructor(client: DiscordClient) {
    this.client = client;
    this.commandsPath = join(process.cwd(), "src/commands");
    this.commands = new Collection();
  }

  /**
   * Charge toutes les commandes
   */
  public async loadCommands(): Promise<void> {
    try {
      const commandFiles = this.getCommandFiles();

      for (const file of commandFiles) {
        await this.loadCommand(file);
      }

      console.log(`✓ ${this.commands.size} commandes chargées`);
      // await this.registerCommandsToDiscord();
    } catch (error) {
      this.handleError("Erreur lors du chargement des commandes", error);
    }
  }

  /**
   * Obtient la liste des fichiers de commandes
   */
  private getCommandFiles(): string[] {
    return readdirSync(this.commandsPath).filter(
      (file) => file.endsWith(".js") || file.endsWith(".ts")
    );
  }

  /**
   * Charge une commande spécifique
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
   */
  private async importCommand(filePath: string): Promise<ICommand> {
    const imported = await import(filePath);
    return imported.default || imported;
  }

  /**
   * Valide et enregistre une commande
   */
  private validateAndRegisterCommand(
    command: ICommand,
    fileName: string
  ): void {
    this.validateCommand(command, fileName);
    this.commands.set(command.data.name, command);
  }

  /**
   * Valide la structure d'une commande
   */
  private validateCommand(
    command: any,
    fileName: string
  ): asserts command is ICommand {
    if (!command?.data?.name) {
      throw new Error(`La commande ${fileName} doit avoir un nom`);
    }

    if (typeof command.execute !== "function") {
      throw new Error(`La commande ${fileName} doit avoir une méthode execute`);
    }
  }

  /**
   * Exécute une commande
   */
  public async executeCommand(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    try {
      const command = this.commands.get(interaction.commandName);

      if (!command) {
        await interaction.reply({
          content: "Cette commande n'existe pas.",
          ephemeral: true,
        });
        return;
      }

      await command.execute(this.client, interaction);
    } catch (error) {
      this.handleError(
        `Erreur lors de l'exécution de ${interaction.commandName}`,
        error
      );

      // Gestion de la réponse en cas d'erreur
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content:
            "Une erreur est survenue lors de l'exécution de la commande.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content:
            "Une erreur est survenue lors de l'exécution de la commande.",
          ephemeral: true,
        });
      }
    }
  }

  /**
   * Enregistre les commandes auprès de l'API Discord
   */
  public async registerCommandsToDiscord(): Promise<void> {
    try {
      const commandsData: RESTPostAPIApplicationCommandsJSONBody[] = [];
      this.commands.forEach((command) => {
        commandsData.push(command.data.toJSON());
      });

      // Si on est en développement, on enregistre les commandes sur un serveur spécifique
      if (process.env.NODE_ENV === "development" && process.env.GUILD_ID) {
        await this.client.application?.commands.set(
          commandsData,
          process.env.GUILD_ID
        );
        console.log("✓ Commandes enregistrées sur le serveur de développement");
      } else {
        // Sinon, on les enregistre globalement

        const data: any = await rest.put(
          Routes.applicationCommands(process.env.CLIENT_ID as string),
          {
            body: commandsData,
          }
        );

        // await this.client.application?.commands.set(commandsData);
        console.log("✓ Commandes enregistrées globalement");
      }
    } catch (error) {
      this.handleError("Erreur lors de l'enregistrement des commandes", error);
    }
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(message: string, error: unknown): void {
    console.error(
      `${message}:`,
      error instanceof Error ? error.message : error
    );
  }
}
