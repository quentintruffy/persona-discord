import { SlashCommandBuilder } from "discord.js";
import DiscordClient from "../client/DiscordClient";
import { ICommand } from "../manager/commandmanager";

const ping: ICommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Répond avec le temps de latence du bot"),

  execute: async (client: DiscordClient, interaction) => {
    // On calcule la latence
    const sent = await interaction.reply({
      content: "Calcul de la latence...",
      options: {
        fetchReply: true,
      },
      ephemeral: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    // On met à jour le message avec les informations de latence
    await interaction.editReply(
      `🏓 Pong!\n` +
        `Latence: \`${latency}ms\`\n` +
        `Latence API: \`${apiLatency}ms\``
    );

    // On peut ajouter d'autres actions ici
    // Par exemple :
    // - Enregistrer les statistiques d'utilisation
    // - Vérifier les permissions de l'utilisateur
    // - Ajouter des boutons ou des menus
  },
};

export default ping;
