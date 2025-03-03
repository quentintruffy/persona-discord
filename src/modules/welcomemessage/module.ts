/**
 * Module de message de bienvenue pour les nouveaux membres.
 */
import DiscordClient from '../../client/DiscordClient';
import { IModule } from '../../client/managers/modulemanager';

const welcomeMessageModule: IModule = {
  name: 'WelcomeMessage',
  description: 'Module de message de bienvenue pour les nouveaux membres.',
  version: '1.0.0',
  enabled: true,

  // Fonction d'initialisation appelée lors du chargement du module
  init: async (client: DiscordClient) => {
    console.log('Initialisation du module WelcomeMessage...');

    // Vous pouvez faire des initialisations spécifiques ici, comme :
    // - Charger des données depuis une base de données
    // - Initialiser des services spécifiques au module
    // - Mettre en place des tâches planifiées
  },

  // Fonction de nettoyage appelée lors de la désactivation du module
  cleanup: async (client: DiscordClient) => {
    console.log('Nettoyage du module WelcomeMessage...');

    // Vous pouvez effectuer des opérations de nettoyage, comme :
    // - Fermer des connexions de base de données
    // - Annuler des tâches planifiées
    // - Libérer des ressources
  },
};

export default welcomeMessageModule;
