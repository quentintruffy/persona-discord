import { Events } from 'discord.js';
import DiscordClient from '../client/discord-client';
import { IEvent } from '../client/handlers/event-handler';

/**
 * Événement qui gère toutes les interactions entrantes, en particulier les commandes slash
 */
const interactionCreate: IEvent<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  once: false, // Cet événement doit être exécuté à chaque interaction

  execute: async (client: DiscordClient, interaction) => {
    // Vérifier si l'interaction est une commande
    if (!interaction.isChatInputCommand()) return;

    try {
      // Récupérer le nom de la commande depuis l'interaction
      const commandName = interaction.commandName;

      // Récupérer la commande depuis le gestionnaire de commandes
      const command = client.command_manager.commands.get(commandName);

      // Si la commande n'existe pas, informer l'utilisateur
      if (!command) {
        console.warn(
          `La commande "${commandName}" a été invoquée mais n'a pas été trouvée.`,
        );
        await interaction.reply({
          content: "Cette commande n'existe pas ou n'est plus disponible.",
          ephemeral: true, // Visible uniquement pour l'utilisateur qui a exécuté la commande
        });
        return;
      }

      // Journaliser l'utilisation de la commande
      console.log(
        `Commande "${commandName}" exécutée par ${interaction.user.tag}`,
      );

      // Exécuter la commande
      await command.execute(client, interaction);
    } catch (error) {
      // Gérer les erreurs pendant l'exécution de la commande
      console.error(`Erreur lors de l'exécution de la commande:`, error);

      // Informer l'utilisateur que quelque chose s'est mal passé
      // Vérifier si l'interaction a déjà reçu une réponse
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content:
            "Une erreur s'est produite lors de l'exécution de cette commande.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content:
            "Une erreur s'est produite lors de l'exécution de cette commande.",
          ephemeral: true,
        });
      }
    }
  },
};

export default interactionCreate;
