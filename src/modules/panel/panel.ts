import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionResponse,
} from "discord.js";
import DiscordClient from "../../client/DiscordClient";

export const showPanel = async (
  client: DiscordClient,
  interaction: ChatInputCommandInteraction,
  messageReply: InteractionResponse<boolean>
) => {
  try {
    await messageReply.edit({
      content: "",
      embeds: [
        new EmbedBuilder()
          .setTitle("Configuration de Persona")
          .setDescription(
            `Salut <@${interaction.user.id}> ! 👋 \n\n` +
              "Persona est un bot avancé de modération automatique et manuelle, conçu pour les petites, moyennes et grandes communautés.\n\n" +
              "Ce bot est là pour vous aider à maintenir un environnement sûr et agréable. Pour commencer la configuration, veuillez appuyer sur le bouton ci-dessous."
          )
          .setThumbnail(client.user!.avatarURL())
          .setFooter({
            text: "Persona.app - Discord Bot",
            iconURL: client.user!.avatarURL() as string,
          })
          .setColor("#f8e5fe"),
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("Commencer la Configuration")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("panel:config")
        ),
      ],
    });
  } catch (error) {
    console.error(error);
    await messageReply.edit({
      content: "Une erreur est survenue lors de l'envoi de la réponse.",
    });
  }
};
