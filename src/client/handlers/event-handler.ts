/**
 * Gestionnaire d'événements pour un bot Discord
 * Ce module gère le chargement dynamique et l'exécution des gestionnaires d'événements
 */
import { ClientEvents, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import DiscordClient from '../discord-client';

/**
 * Gère le chargement et l'exécution des gestionnaires d'événements du bot
 */
export class EventManager {
  /** Instance du client Discord */
  private readonly client: DiscordClient;

  /** Chemin vers le dossier des événements */
  private readonly eventsPath: string;

  /** Collection des événements chargés */
  private readonly events: Collection<string, IEvent<keyof ClientEvents>>;

  /**
   * Crée une nouvelle instance du gestionnaire d'événements
   * @param client - Le client Discord auquel ce gestionnaire est associé
   * @param customPath - Chemin personnalisé vers les événements (optionnel)
   */
  constructor(client: DiscordClient, customPath?: string) {
    this.client = client;
    this.eventsPath = customPath || join(process.cwd(), 'src/events');
    this.events = new Collection();
  }

  /**
   * Charge tous les gestionnaires d'événements depuis le dossier configuré
   */
  public async loadEvents(): Promise<void> {
    try {
      // Récupérer tous les fichiers d'événements
      const eventFiles = this.getEventFiles();

      // Charger les événements
      for (const file of eventFiles) {
        await this.loadEvent(file);
      }

      console.log(`✓ ${this.events.size} événements chargés`);
    } catch (error) {
      this.handleError('Erreur lors du chargement des événements', error);
    }
  }

  /**
   * Récupère les fichiers d'événements depuis le dossier configuré
   * @returns Liste des fichiers d'événements
   */
  private getEventFiles(): string[] {
    try {
      return readdirSync(this.eventsPath).filter(
        (file) => file.endsWith('.js') || file.endsWith('.ts'),
      );
    } catch (error) {
      console.warn(
        `Attention: Impossible de lire le dossier d'événements ${this.eventsPath}`,
      );
      return [];
    }
  }

  /**
   * Charge un événement spécifique
   * @param fileName - Nom du fichier à charger
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
   * @param filePath - Chemin complet vers le fichier
   * @returns Module d'événement importé
   */
  private async importEvent(
    filePath: string,
  ): Promise<IEvent<keyof ClientEvents>> {
    const imported = await import(filePath);
    return imported.default || imported;
  }

  /**
   * Valide et enregistre un événement
   * @param event - Événement à valider et enregistrer
   * @param fileName - Nom du fichier pour les logs d'erreur
   */
  private validateAndRegisterEvent(
    event: IEvent<keyof ClientEvents>,
    fileName: string,
  ): void {
    this.validateEvent(event, fileName);
    this.registerEvent(event);
    this.events.set(event.name, event);
  }

  /**
   * Valide qu'un module est bien un événement conforme
   * @param event - Module à valider
   * @param fileName - Nom du fichier pour les messages d'erreur
   */
  private validateEvent(
    event: any,
    fileName: string,
  ): asserts event is IEvent<keyof ClientEvents> {
    if (!event?.name) {
      throw new Error(`L'événement ${fileName} doit avoir un nom`);
    }

    if (typeof event.execute !== 'function') {
      throw new Error(`L'événement ${fileName} doit avoir une méthode execute`);
    }
  }

  /**
   * Enregistre un événement auprès du client Discord
   * @param event - Événement à enregistrer
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
   * Exécute un gestionnaire d'événement avec gestion des erreurs
   * @param event - Événement à exécuter
   * @param args - Arguments de l'événement passés par Discord.js
   */
  private async executeEvent<K extends keyof ClientEvents>(
    event: IEvent<K>,
    ...args: ClientEvents[K]
  ): Promise<void> {
    try {
      await event.execute(this.client, ...args);
    } catch (error) {
      this.handleError(
        `Erreur lors de l'exécution de l'événement '${event.name}'`,
        error,
      );
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
 * Interface définissant la structure d'un gestionnaire d'événement Discord
 * @template K - Type d'événement Discord
 */
export type IEvent<K extends keyof ClientEvents> = {
  /** Nom de l'événement à écouter */
  name: K;

  /** Si true, l'événement ne sera déclenché qu'une seule fois */
  once?: boolean;

  /** Fonction exécutée lorsque l'événement est déclenché */
  execute: (
    client: DiscordClient,
    ...args: ClientEvents[K]
  ) => Promise<void> | void;
};
