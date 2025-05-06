import { ClientEvents } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import DiscordClient from '../discord-client';
import { ICommand } from './command-handler';
import { IEvent } from './event-handler';

/**
 * Gère le chargement et l'exécution des modules du bot
 */
export class ModuleManager {
  /** Instance du client Discord */
  private readonly client: DiscordClient;

  /** Chemin vers le dossier des modules */
  private readonly modulesPath: string;

  /** Map des modules chargés */
  private modules: Map<string, IModule> = new Map();

  /**
   * Crée une nouvelle instance du gestionnaire de modules
   * @param client - Le client Discord auquel ce gestionnaire est associé
   * @param customPath - Chemin personnalisé vers les modules (optionnel)
   */
  constructor(client: DiscordClient, customPath?: string) {
    this.client = client;
    this.modulesPath = customPath || join(process.cwd(), 'src/modules');
  }

  /**
   * Charge tous les modules depuis le dossier configuré
   * @returns Nombre de modules chargés
   */
  public async loadModules(): Promise<number> {
    try {
      // Récupérer tous les dossiers de modules
      const moduleFolders = this.getModuleFolders();

      // Charger chaque module
      for (const folder of moduleFolders) {
        await this.loadModule(folder);
      }

      console.log(`✓ ${this.modules.size} modules chargés`);
      return this.modules.size;
    } catch (error) {
      this.handleError('Erreur lors du chargement des modules', error);
      return 0;
    }
  }

  /**
   * Récupère les dossiers de modules depuis le dossier configuré
   * @returns Liste des dossiers de modules
   */
  private getModuleFolders(): string[] {
    try {
      return readdirSync(this.modulesPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);
    } catch (error) {
      console.warn(
        `Attention: Impossible de lire le dossier des modules ${this.modulesPath}`,
      );
      return [];
    }
  }

  /**
   * Charge un module spécifique
   * @param moduleName - Nom du dossier du module à charger
   */
  private async loadModule(moduleName: string): Promise<void> {
    try {
      const modulePath = join(this.modulesPath, moduleName);

      // Vérifier si le fichier module.ts/js existe
      const moduleFile = join(modulePath, 'module.ts');

      // Importer le module
      const moduleData: IModule = await this.importModule(moduleFile);

      // Valider le module
      this.validateModule(moduleData, moduleName);

      // Si le module est désactivé, on ne le charge pas
      if (!moduleData.enabled) {
        console.log(`Module "${moduleData.name}" désactivé, ignoré.`);
        return;
      }

      // Enregistrer le module
      this.modules.set(moduleData.name, moduleData);

      // Initialiser le module si nécessaire
      if (moduleData.init) {
        await moduleData.init(this.client);
      }

      // Charger les commandes du module
      await this.loadModuleCommands(modulePath, moduleData.name);

      // Charger les événements du module
      await this.loadModuleEvents(modulePath, moduleData.name);

      console.log(
        `✓ Module "${moduleData.name}" v${moduleData.version} chargé`,
      );
    } catch (error) {
      this.handleError(
        `Erreur lors du chargement du module "${moduleName}"`,
        error,
      );
    }
  }

  /**
   * Importe un module
   * @param filePath - Chemin complet vers le fichier du module
   * @returns Module importé
   */
  private async importModule(filePath: string): Promise<IModule> {
    const imported = await import(filePath);
    return imported.default || imported;
  }

  /**
   * Valide qu'un module est conforme
   * @param module - Module à valider
   * @param moduleName - Nom du dossier pour les messages d'erreur
   */
  private validateModule(
    module: any,
    moduleName: string,
  ): asserts module is IModule {
    if (!module?.name) {
      throw new Error(`Le module "${moduleName}" doit avoir un nom`);
    }

    if (!module?.description) {
      throw new Error(`Le module "${moduleName}" doit avoir une description`);
    }

    if (!module?.version) {
      throw new Error(`Le module "${moduleName}" doit avoir une version`);
    }

    if (module.init && typeof module.init !== 'function') {
      throw new Error(`Le module "${moduleName}" a une méthode init invalide`);
    }

    if (module.cleanup && typeof module.cleanup !== 'function') {
      throw new Error(
        `Le module "${moduleName}" a une méthode cleanup invalide`,
      );
    }

    if (typeof module.enabled !== 'boolean') {
      throw new Error(
        `Le module "${moduleName}" doit avoir une propriété enabled de type boolean`,
      );
    }
  }

  /**
   * Charge les commandes d'un module
   * @param modulePath - Chemin du dossier du module
   * @param moduleName - Nom du module
   */
  private async loadModuleCommands(
    modulePath: string,
    moduleName: string,
  ): Promise<void> {
    try {
      const commandsPath = join(modulePath, 'commands');

      // Vérifier si le dossier commands existe
      if (!this.directoryExists(commandsPath)) {
        return; // Pas d'erreur, certains modules peuvent ne pas avoir de commandes
      }

      // Récupérer tous les fichiers de commandes
      const commandFiles = readdirSync(commandsPath).filter(
        (file) => file.endsWith('.js') || file.endsWith('.ts'),
      );

      // Charger chaque commande
      for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command: ICommand = await this.importCommand(filePath);

        // Ajouter le préfixe du module à la description de la commande
        const originalDescription = command.data.description;
        command.data.setDescription(`[${moduleName}] ${originalDescription}`);

        // Enregistrer la commande dans le gestionnaire de commandes
        this.client.command_manager.addCommand(command);
      }

      console.log(
        `  ↳ ${commandFiles.length} commandes chargées depuis le module "${moduleName}"`,
      );
    } catch (error) {
      this.handleError(
        `Erreur lors du chargement des commandes du module "${moduleName}"`,
        error,
      );
    }
  }

  /**
   * Importe une commande
   * @param filePath - Chemin complet vers le fichier de la commande
   * @returns Commande importée
   */
  private async importCommand(filePath: string): Promise<ICommand> {
    const imported = await import(filePath);
    return imported.default || imported;
  }

  /**
   * Charge les événements d'un module
   * @param modulePath - Chemin du dossier du module
   * @param moduleName - Nom du module
   */
  private async loadModuleEvents(
    modulePath: string,
    moduleName: string,
  ): Promise<void> {
    try {
      const eventsPath = join(modulePath, 'events');

      // Vérifier si le dossier events existe
      if (!this.directoryExists(eventsPath)) {
        return; // Pas d'erreur, certains modules peuvent ne pas avoir d'événements
      }

      // Récupérer tous les fichiers d'événements
      const eventFiles = readdirSync(eventsPath).filter(
        (file) => file.endsWith('.js') || file.endsWith('.ts'),
      );

      // Charger chaque événement
      for (const file of eventFiles) {
        const filePath = join(eventsPath, file);
        const event: IEvent<keyof ClientEvents> =
          await this.importEvent(filePath);

        // Adapter l'événement pour qu'il soit lié au module
        const originalExecute = event.execute;
        event.execute = async (client, ...args) => {
          console.log(
            `Événement "${event.name}" déclenché par le module "${moduleName}"`,
          );
          return originalExecute(client, ...args);
        };

        // Enregistrer l'événement dans le client
        if (event.once) {
          this.client.once(event.name, (...args) =>
            event.execute(this.client, ...args),
          );
        } else {
          this.client.on(event.name, (...args) =>
            event.execute(this.client, ...args),
          );
        }
      }

      console.log(
        `  ↳ ${eventFiles.length} événements chargés depuis le module "${moduleName}"`,
      );
    } catch (error) {
      this.handleError(
        `Erreur lors du chargement des événements du module "${moduleName}"`,
        error,
      );
    }
  }

  /**
   * Importe un événement
   * @param filePath - Chemin complet vers le fichier de l'événement
   * @returns Événement importé
   */
  private async importEvent(
    filePath: string,
  ): Promise<IEvent<keyof ClientEvents>> {
    const imported = await import(filePath);
    return imported.default || imported;
  }

  /**
   * Vérifie si un répertoire existe
   * @param dirPath - Chemin du répertoire à vérifier
   * @returns true si le répertoire existe
   */
  private directoryExists(dirPath: string): boolean {
    try {
      return readdirSync(dirPath).length >= 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupère un module par son nom
   * @param moduleName - Nom du module à récupérer
   * @returns Le module ou undefined s'il n'existe pas
   */
  public getModule(moduleName: string): IModule | undefined {
    return this.modules.get(moduleName);
  }

  /**
   * Liste tous les modules chargés
   * @returns Tableau de tous les modules
   */
  public getAllModules(): IModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Désactive un module
   * @param moduleName - Nom du module à désactiver
   * @returns true si le module a été désactivé avec succès
   */
  public async disableModule(moduleName: string): Promise<boolean> {
    const module = this.modules.get(moduleName);

    if (!module) {
      console.warn(`Module "${moduleName}" non trouvé`);
      return false;
    }

    try {
      // Exécuter la fonction de nettoyage si elle existe
      if (module.cleanup) {
        await module.cleanup(this.client);
      }

      // Marquer le module comme désactivé
      module.enabled = false;

      console.log(`Module "${moduleName}" désactivé`);
      return true;
    } catch (error) {
      this.handleError(
        `Erreur lors de la désactivation du module "${moduleName}"`,
        error,
      );
      return false;
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
 * Interface définissant la structure d'un module
 */
export interface IModule {
  /** Nom unique du module */
  name: string;

  /** Description du module */
  description: string;

  /** Version du module */
  version: string;

  /** Fonction d'initialisation appelée au chargement du module */
  init?: (client: DiscordClient) => Promise<void> | void;

  /** Fonction de nettoyage appelée à la désactivation du module */
  cleanup?: (client: DiscordClient) => Promise<void> | void;

  /** Indique si le module est activé */
  enabled: boolean;

  /**
   * Données ou état du module
   * Peut être utilisé pour stocker des informations propres au module
   */
  data?: any;
}
