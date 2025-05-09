/**
 * Module de modération Ticket.
 */

import DiscordClient from '../../client/discord-client';
import { IModule } from '../../client/handlers/module-handler';

const ticketModule: IModule = {
  name: 'Ticket',
  description: 'Module de modération Ticket.',
  version: '1.0.0',
  enabled: true,
  data: {},

  // Fonction d'initialisation appelée lors du chargement du module
  init: async (client: DiscordClient) => {
    console.log('Initialisation du module Ticket...');

    // Vous pouvez faire des initialisations spécifiques ici, comme :
    // - Charger des données depuis une base de données
    // - Initialiser des services spécifiques au module
    // - Mettre en place des tâches planifiées
  },

  // Fonction de nettoyage appelée lors de la désactivation du module
  cleanup: async (client: DiscordClient) => {
    console.log('Nettoyage du module Ticket...');

    // Vous pouvez effectuer des opérations de nettoyage, comme :
    // - Fermer des connexions de base de données
    // - Annuler des tâches planifiées
    // - Libérer des ressources
  },
};

export default ticketModule;
