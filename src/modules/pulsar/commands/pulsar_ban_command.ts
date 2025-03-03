import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import DiscordClient from '../../../client/DiscordClient';
import { ICommand } from '../../../client/managers/commandmanager';
import {
  bannissementPulsar,
  bannissementPulsarGlobal,
  unbannissementPulsar,
  unbannissementPulsarGlobal,
} from '../utils/pulsar';

const pulsarCommand: ICommand = {
  data: new SlashCommandBuilder()
    .setName('pulsar')
    .setDescription('Utilisation du système Pulsar.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('ban')
        .setDescription('Faire une demande de bannissement Pulsar.')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('Utilisateur')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('Faire une demande de bannissement Pulsar.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('unban')
        .setDescription('Répond avec le temps de latence du bot')
        .addStringOption((option) =>
          option
            .setName('user')
            .setDescription('Utilisateur (format: xxxxxxxxxxxxxxxxxxx)')
            .setRequired(true),
        ),
    ),
  execute: async (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction,
  ) => {
    try {
      if (interaction.options.getSubcommand() === 'ban') {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');

        if (!user) {
          await interaction.reply({
            ephemeral: true,
            content: 'Vous devez spécifier un utilisateur.',
          });
          return;
        }

        if (!reason) {
          await interaction.reply({
            ephemeral: true,
            content: 'Vous devez spécifier une raison.',
          });
          return;
        }

        const banConfirm = await bannissementPulsar(client, user.id, reason);
        if (banConfirm) {
          await user.send({
            content: `Vous avez reçu un bannissement de Pulsar, cela signifie que vous avez été de tous les serveur discord utilisant le bot Persona.`,
          });
          await bannissementPulsarGlobal(client, user.id, reason);
          await interaction.reply({
            ephemeral: true,
            content: 'Utilisateur banni par Pulsar.',
          });
          return;
        }
        await interaction.reply({
          ephemeral: true,
          content: 'Erreur lors de la commande Pulsar.',
        });
      }
      if (interaction.options.getSubcommand() === 'unban') {
        const user = interaction.options.getString('user');

        if (!user) {
          await interaction.reply({
            ephemeral: true,
            content: 'Vous devez spécifier un utilisateur.',
          });
          return;
        }

        const unbanConfirm = await unbannissementPulsar(client, user);
        if (unbanConfirm) {
          await unbannissementPulsarGlobal(client, user);
          await interaction.reply({
            ephemeral: true,
            content: 'Utilisateur debannissé par Pulsar.',
          });
          return;
        }
        await interaction.reply({
          ephemeral: true,
          content: 'Erreur lors de la commande Pulsar.',
        });
      }
    } catch (error) {
      await interaction.reply({
        ephemeral: true,
        content: 'Erreur lors de la commande Pulsar.',
      });
    }
  },
};

export default pulsarCommand;
