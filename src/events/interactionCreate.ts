import { Events, Interaction } from "discord.js";
import DiscordClient from "../client/DiscordClient";
import { IEvent } from "../manager/EventManager";

const interactionCreate: IEvent<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  execute: async (client: DiscordClient, interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      try {
        // On exécute la commande via le CommandManager
        await client.command_manager.executeCommand(interaction);
      } catch (error) {
        // On gère les erreurs qui n'auraient pas été attrapées par le CommandManager
        console.error(
          "Erreur non gérée dans l'exécution de la commande:",
          error
        );

        // On envoie un message d'erreur à l'utilisateur si ce n'est pas déjà fait
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content:
              "Une erreur est survenue lors de l'exécution de la commande.",
            ephemeral: true,
          });
        } else if (interaction.deferred) {
          await interaction.followUp({
            content:
              "Une erreur est survenue lors de l'exécution de la commande.",
            ephemeral: true,
          });
        }
      }
    }
  },
};

export default interactionCreate;
