import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import DiscordClient from '../../../client/discord-client';
import { ICommand } from '../../../client/handlers/command-handler';

const pulsarCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName('pulsar')
    .setDescription('Utilisation du système Pulsar.'),
  execute: async (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction,
  ) => {
    try {
      await interaction.deferReply({
        ephemeral: true,
      });
      await interaction.editReply({
        content: 'Commande Pulsar exécutée avec succès.',
      });
    } catch (error) {
      await interaction.reply({
        ephemeral: true,
        content: 'Erreur lors de la commande Pulsar.',
      });
    }
  },
};

export default pulsarCommand;
