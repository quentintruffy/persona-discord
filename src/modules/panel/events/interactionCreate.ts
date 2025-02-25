import { Events, Interaction } from "discord.js";
import DiscordClient from "../../../client/DiscordClient";
import { IEvent } from "../../../manager/EventManager";

/**
 * Événement qui gère toutes les interactions entrantes, en particulier les commandes slash
 */
const interactionCreate: IEvent<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  once: false, // Cet événement doit être exécuté à chaque interaction

  execute: async (client: DiscordClient, interaction: Interaction) => {
    // Vérifier si l'interaction est une commande
    if (interaction.isButton()) {
      if (interaction.customId === "panel:config") {
        console.log("config");
        client.emit("configPanel", interaction);
      }
    }
  },
};

export default interactionCreate;
