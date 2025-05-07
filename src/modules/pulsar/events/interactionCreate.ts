import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  ForumChannel,
  Interaction,
  MessageFlags,
} from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import DiscordClient from '../../../client/discord-client';
import { IEvent } from '../../../client/handlers/event-handler';
import { ChannelManager } from '../../../utils/managers/channel-manager';
import { LaunchContainer } from '../containers/launch';
import { RapportContainer } from '../containers/rapport';
import pulsarModule from '../module';

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
      if (interaction.customId === '[pulsar]:stop') {
        // Déferer l'interaction pour éviter le timeout
        await interaction.reply({
          flags: MessageFlags.Ephemeral,
          content:
            'Une fois le bannissement lancé, vous ne pouvez revenir en arrière.',
        });
      }
      if (interaction.customId === '[pulsar]:launch') {
        // Déferer l'interaction pour éviter le timeout
        await interaction.deferUpdate();

        const filePath = path.join(__dirname, 'rapport.txt');
        const fileContent = await fs.readFile(filePath, 'utf8');

        const attachment = new AttachmentBuilder(Buffer.from(fileContent), {
          name: 'rapport.txt',
        });

        const buttonComp1 = new ButtonBuilder()
          .setLabel('Voter favorablement')
          .setCustomId('rapport')
          .setStyle(ButtonStyle.Success);

        const buttonComp2 = new ButtonBuilder()
          .setLabel('+53')
          .setCustomId('rapport2n')
          .setStyle(ButtonStyle.Secondary);

        const buttonComp3 = new ButtonBuilder()
          .setLabel('Voter défavorablement')
          .setCustomId('rapport2')
          .setStyle(ButtonStyle.Danger);

        const actionRowComponent =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            buttonComp3,
            buttonComp2,
            buttonComp1,
          );

        const thread2 = new ChannelManager(
          client,
          pulsarModule.data.GUILD_RAPPORT_ID,
          pulsarModule.data.CHANNEL_RAPPORT_ID,
        );
        const thread = await thread2.createThread<ForumChannel>({
          name: 'Bannissement Pulsar - Islamophobie', // Titre du post
          message: {
            flags: MessageFlags.IsComponentsV2,
            components: [
              RapportContainer({
                motif: 'Islamophobie',
              }),
              actionRowComponent,
            ],
            files: [attachment],
          },
        });

        // Mettre à jour le message d'origine
        await interaction.message.edit({
          components: [LaunchContainer({ is_active: true, url: thread.url })],
        });
      }
    } catch (error) {
      // Gérer les erreurs pendant l'exécution de la commande
      console.error(`Erreur lors de l'exécution de la commande:`, error);
    }
  },
};

export default interactionCreate;
