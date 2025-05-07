import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import DiscordClient from '../../../client/discord-client';
import { ICommand } from '../../../client/handlers/command-handler';
import { PreLaunchContainer } from '../containers/prelaunch';
import { PulsarManager } from '../utils/pulsar-manager';

const pulsarCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName('pulsar')
    .setDescription('Utilisation du système Pulsar.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Utilisateur à bannir')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Raison du bannissement')
        .setRequired(true)
        .setChoices([
          // Choix de raison du bannissement GRAVE, exemple: Islamophobe, etc.
          {
            name: 'Islamophobe',
            value: 'Islamophobe',
          },
          {
            name: 'Raciste',
            value: 'Raciste',
          },
          {
            name: 'Homophobe',
            value: 'Homophobe',
          },
          {
            name: 'Autre',
            value: 'Autre',
          },
        ]),
    ),
  execute: async (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction,
  ) => {
    try {
      // Preparer le message d'attente
      await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
      });

      // Récupérer l'utilisateur
      const user = interaction.options.getUser('user');
      if (!user) {
        await interaction.editReply({
          content: 'Veuillez spécifier un utilisateur.',
        });
        return;
      }

      // Lancer le processus de bannissement
      const pulsarManager = new PulsarManager(client);
      const plusarBan = await pulsarManager.launchPulsarBan(
        client,
        interaction.user,
        user.id,
      );

      // Si le bannissement a bien été envoyé, répondre
      if (plusarBan) {
        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [PreLaunchContainer({ url: plusarBan.url })],
        });
        return;
      }

      // Si le bannissement n'a pas été envoyé, répondre
      await interaction.editReply({
        content: 'Erreur lors de la création du bannissement.',
      });
    } catch (error) {
      await interaction.editReply({
        content: 'Erreur lors de la commande Pulsar.',
      });
    }
  },
};

export default pulsarCommand;
