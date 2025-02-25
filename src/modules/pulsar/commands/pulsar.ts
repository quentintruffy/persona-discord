import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import DiscordClient from "../../../client/DiscordClient";
import { ICommand } from "../../../manager/commandmanager";

const ping: ICommand = {
  data: new SlashCommandBuilder()
    .setName("pulsar")
    .setDescription("Commande de modération Pulsar")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ban")
        .setDescription("Répond avec le temps de latence du bot")
        .addUserOption((option) =>
          option.setName("user").setDescription("Utilisateur").setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Raison du bannissement")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unban")
        .setDescription("Répond avec le temps de latence du bot")
        .addUserOption((option) =>
          option.setName("user").setDescription("Utilisateur").setRequired(true)
        )
    ),

  execute: async (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction
  ) => {
    await interaction.deferReply({
      withResponse: true,
      ephemeral: true,
    });

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    if (!user || !reason) {
      await interaction.editReply({
        content: "Veuillez fournir un utilisateur et une raison.",
      });
      return;
    }

    // Confirmation du bannissement sur Pulsar
    const embed = new EmbedBuilder()
      .setTitle("Bannissement Pulsar")
      .setDescription(`Votre demande de bannissement Pulsar a été envoyée.`)
      .setColor("#f6e7ff")
      .addFields([
        {
          name: "Utilisateur",
          value: user.tag,
        },
        {
          name: "Raison",
          value: reason,
        },
      ])
      .setFooter({
        text: "Persona.app - Discord Bot",
        iconURL: client.user?.displayAvatarURL(),
      });

    const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Annuler le bannissement")
        .setStyle(ButtonStyle.Danger)
    );

    const response = await interaction.editReply({
      embeds: [embed],
      components: [button],
    });
  },
};

export default ping;
