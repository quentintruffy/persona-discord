import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import DiscordClient from "../../../client/DiscordClient";
import { ICommand } from "../../../manager/commandmanager";
import { showPanel } from "../panel";

const PanelCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName("panel")
    .setDescription("Ouvrir le panneau de configuration")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  execute: async (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction
  ) => {
    try {
      const messageReply = await interaction.deferReply({
        ephemeral: true,
      });
      const guild = interaction.guild;
      if (!guild) {
        return;
      }

      await showPanel(client, interaction, messageReply);
    } catch (error) {
      throw error;
    }
  },
};

export default PanelCommand;
