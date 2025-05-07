import {
  ChannelType,
  Events,
  ForumChannel,
  Interaction,
  MessageFlags,
  TextChannel,
} from 'discord.js';
import DiscordClient from '../../../client/discord-client';
import { IEvent } from '../../../client/handlers/event-handler';
import { ChannelManager } from '../../../utils/managers/channel-manager';
import { InitiatorTicketContainer } from '../container/initiator-ticket';
import { ResumeTicketContainer } from '../container/resume-ticket';

/**
 * Événement qui gère toutes les interactions entrantes, en particulier les commandes slash
 */
const interactionCreate: IEvent<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  once: false, // Cet événement doit être exécuté à chaque interaction

  execute: async (client: DiscordClient, interaction: Interaction) => {
    try {
      // Check if the interaction is a button

      if (!interaction.isButton()) return;
      if (!interaction.guild) return;

      if (interaction.customId === '[ticket]:create') {
        if (!interaction.guild) return;
        // Obtenir le canal dans lequel le message a été envoyé

        // if (interaction.channel instanceof TextChannel) {
        // //   // Créer un thread dans le canal
        //   const thread = await interaction.channel.threads.create({
        //     startMessage: {
        //       flags: MessageFlags.IsComponentsV2,
        //       components: [InitiatorTicketContainer()],
        //     },
        //     name: 'Ticket - ' + interaction.user.tag,
        //   });
        // }

        const channel = new ChannelManager(
          client,
          interaction.guild?.id,
          interaction.channelId,
        );

        const thread = await channel.createThread<TextChannel>({
          name: 'Ticket - ' + interaction.user.tag,
          type: ChannelType.PrivateThread,
        });

        // Envoyez ensuite un message dans le thread
        await thread.send({
          flags: MessageFlags.IsComponentsV2,
          components: [InitiatorTicketContainer()],
        });

        const channelForum = new ChannelManager(
          client,
          interaction.guild?.id,
          '1369477091933814865',
        );

        const threadForum = await channelForum.createThread<ForumChannel>({
          name: 'Ticket - ' + interaction.user.tag,
          message: {
            flags: MessageFlags.IsComponentsV2,
            components: [ResumeTicketContainer()],
          },
        });
      }

      if (interaction.customId === '[ticket]:request_close') {
        const channel = new ChannelManager(
          client,
          interaction.guild?.id,
          '1369490724093038592',
        );

        const chan = await channel.getChannel<TextChannel>();
        await chan.send({
          content: 'Clore le ticket et demande la fermeture.',
        });
      }
    } catch (error) {
      // Gérer les erreurs pendant l'exécution de la commande
      console.error(`Erreur lors de l'exécution de la commande:`, error);
    }
  },
};

export default interactionCreate;
