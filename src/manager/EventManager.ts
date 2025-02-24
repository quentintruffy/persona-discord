import { ClientEvents, Collection } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import DiscordClient from "../client/DiscordClient";

export type IEvent<K extends keyof ClientEvents> = {
  name: K;
  once?: boolean;
  execute: (
    client: DiscordClient,
    ...args: ClientEvents[K]
  ) => Promise<void> | void;
};

export class EventManager {
  private readonly client: DiscordClient;
  private readonly eventsPath: string;
  private readonly events: Collection<string, IEvent<keyof ClientEvents>>;

  constructor(client: DiscordClient) {
    this.client = client;
    this.eventsPath = join(process.cwd(), "src/events");
    this.events = new Collection();
  }

  /**
   * Charge tous les événements
   */
  public async loadEvents(): Promise<void> {
    try {
      const eventFiles = this.getEventFiles();

      for (const file of eventFiles) {
        await this.loadEvent(file);
      }

      console.log(`✓ ${this.events.size} événements chargés`);
    } catch (error) {
      this.handleError("Erreur lors du chargement des événements", error);
    }
  }

  /**
   * Obtient la liste des fichiers d'événements
   */
  private getEventFiles(): string[] {
    return readdirSync(this.eventsPath).filter(
      (file) => file.endsWith(".js") || file.endsWith(".ts")
    );
  }

  /**
   * Charge un événement spécifique
   */
  private async loadEvent(fileName: string): Promise<void> {
    try {
      const filePath = join(this.eventsPath, fileName);
      const eventModule = await this.importEvent(filePath);

      this.validateAndRegisterEvent(eventModule, fileName);
    } catch (error) {
      this.handleError(`Erreur lors du chargement de ${fileName}`, error);
    }
  }

  /**
   * Importe un module d'événement
   */
  private async importEvent(
    filePath: string
  ): Promise<IEvent<keyof ClientEvents>> {
    const imported = await import(filePath);
    return imported.default || imported;
  }

  /**
   * Valide et enregistre un événement
   */
  private validateAndRegisterEvent(
    event: IEvent<keyof ClientEvents>,
    fileName: string
  ): void {
    this.validateEvent(event, fileName);
    this.registerEvent(event);
    this.events.set(event.name, event);
  }

  /**
   * Valide la structure d'un événement
   */
  private validateEvent(
    event: any,
    fileName: string
  ): asserts event is IEvent<keyof ClientEvents> {
    if (!event?.name) {
      throw new Error(`L'événement ${fileName} doit avoir un nom`);
    }

    if (typeof event.execute !== "function") {
      throw new Error(`L'événement ${fileName} doit avoir une méthode execute`);
    }
  }

  /**
   * Enregistre un événement auprès du client Discord
   */
  private registerEvent<K extends keyof ClientEvents>(event: IEvent<K>): void {
    const listener = (...args: ClientEvents[K]) =>
      this.executeEvent(event, ...args);

    if (event.once) {
      this.client.once(event.name, listener);
    } else {
      this.client.on(event.name, listener);
    }
  }

  /**
   * Exécute un événement avec gestion d'erreur
   */
  private async executeEvent<K extends keyof ClientEvents>(
    event: IEvent<K>,
    ...args: ClientEvents[K]
  ): Promise<void> {
    try {
      await event.execute(this.client, ...args);
    } catch (error) {
      this.handleError(`Erreur lors de l'exécution de ${event.name}`, error);
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
