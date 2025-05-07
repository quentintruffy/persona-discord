/**
 * Module d'auto-réaction pour les messages.
 */

import DiscordClient from '../../client/discord-client';
import { IModule } from '../../client/handlers/module-handler';

const autoReactModule: IModule = {
  name: 'AutoReact',
  description: "Module d'auto-réaction pour les messages.",
  version: '1.0.0',
  enabled: true,
  data: {
    hellowords: [
      'coucou',
      'bonjour',
      'salut',
      'hey',
      'hi',
      'hello',
      'yo',
      'sup',
      "what's up",
      'bjr',
      'cc',
    ],
  },

  // Fonction d'initialisation appelée lors du chargement du module
  init: async (client: DiscordClient) => {
    console.log('Initialisation du module AutoReact...');

    // Vous pouvez faire des initialisations spécifiques ici, comme :
    // - Charger des données depuis une base de données
    // - Initialiser des services spécifiques au module
    // - Mettre en place des tâches planifiées
  },

  // Fonction de nettoyage appelée lors de la désactivation du module
  cleanup: async (client: DiscordClient) => {
    console.log('Nettoyage du module AutoReact...');

    // Vous pouvez effectuer des opérations de nettoyage, comme :
    // - Fermer des connexions de base de données
    // - Annuler des tâches planifiées
    // - Libérer des ressources
  },
};

export default autoReactModule;
