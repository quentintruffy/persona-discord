/**
 * Module d'exemple démontrant la structure d'un module
 */
import { Collection } from "discord.js";
import DiscordClient from "../../client/DiscordClient";
import { IModule } from "../../manager/modulemanager";

const voiceChannelModule: IModule = {
  name: "VoiceChannel",
  description: "Module de gestion des salons vocaux privés",
  version: "1.0.0",
  enabled: true,
  data: {
    privateChannels: new Collection<string, string>(),
  },

  // Fonction d'initialisation appelée lors du chargement du module
  init: async (client: DiscordClient) => {
    console.log("Initialisation du module d'exemple...");

    // Vous pouvez faire des initialisations spécifiques ici, comme :
    // - Charger des données depuis une base de données
    // - Initialiser des services spécifiques au module
    // - Mettre en place des tâches planifiées
  },

  // Fonction de nettoyage appelée lors de la désactivation du module
  cleanup: async (client: DiscordClient) => {
    console.log("Nettoyage du module d'exemple...");

    // Vous pouvez effectuer des opérations de nettoyage, comme :
    // - Fermer des connexions de base de données
    // - Annuler des tâches planifiées
    // - Libérer des ressources
  },
};

export default voiceChannelModule;
