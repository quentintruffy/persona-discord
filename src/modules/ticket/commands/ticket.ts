import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import DiscordClient from '../../../client/discord-client';
import { ICommand } from '../../../client/handlers/command-handler';
import { CreateTicketContainer } from '../container/create-ticket';

const ticketCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Utilisation du système Ticket.'),
  execute: async (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction,
  ) => {
    try {
      await interaction.deferReply();

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [CreateTicketContainer()],
      });
    } catch (error) {
      await interaction.editReply({
        content: 'Erreur lors de la commande Ticket.',
      });
    }
  },
};

export default ticketCommand;
