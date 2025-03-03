import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';
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
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
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
            .setDescription('Raison du bannissement Pulsar')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('unban')
        .setDescription('Débannir un utilisateur du système Pulsar')
        .addStringOption((option) =>
          option
            .setName('user')
            .setDescription("ID de l'utilisateur (format: xxxxxxxxxxxxxxxxxxx)")
            .setRequired(true),
        ),
    ),
  execute: async (
    client: DiscordClient,
    interaction: ChatInputCommandInteraction,
  ) => {
    try {
      // Vérifier les permissions de l'utilisateur (admin uniquement)
      if (!interaction.memberPermissions?.has('Administrator')) {
        await interaction.reply({
          ephemeral: true,
          content:
            "Vous n'avez pas les permissions nécessaires pour utiliser cette commande.",
        });
        return;
      }

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

        // Indiquer que le traitement est en cours
        await interaction.deferReply({ ephemeral: true });

        try {
          const banConfirm = await bannissementPulsar(client, user.id, reason);

          if (banConfirm) {
            // Notification à l'utilisateur banni
            try {
              await user.send({
                content: `Vous avez reçu un bannissement Pulsar, ce qui signifie que vous avez été banni de tous les serveurs Discord utilisant le bot Persona. Raison: ${reason}`,
              });
            } catch (dmError) {
              console.error(
                `Impossible d'envoyer un DM à l'utilisateur ${user.id}:`,
                dmError,
              );
            }

            // Bannissement global
            await bannissementPulsarGlobal(client, user.id, reason);

            await interaction.editReply({
              content: `L'utilisateur ${user.tag} (${user.id}) a été banni par Pulsar. Raison: ${reason}`,
            });
          } else {
            await interaction.editReply({
              content:
                "Erreur lors de l'enregistrement du bannissement Pulsar.",
            });
          }
        } catch (error) {
          console.error('Erreur lors du bannissement Pulsar:', error);
          await interaction.editReply({
            content: 'Une erreur est survenue lors du bannissement Pulsar.',
          });
        }
      } else if (interaction.options.getSubcommand() === 'unban') {
        const userId = interaction.options.getString('user');

        if (!userId) {
          await interaction.reply({
            ephemeral: true,
            content: "Vous devez spécifier un ID d'utilisateur.",
          });
          return;
        }

        // Vérifier si l'ID a le bon format
        if (!/^\d{17,19}$/.test(userId)) {
          await interaction.reply({
            ephemeral: true,
            content:
              "L'ID d'utilisateur fourni n'est pas valide. Il doit contenir entre 17 et 19 chiffres.",
          });
          return;
        }

        // Indiquer que le traitement est en cours
        await interaction.deferReply({ ephemeral: true });

        try {
          const unbanConfirm = await unbannissementPulsar(client, userId);

          if (unbanConfirm) {
            await unbannissementPulsarGlobal(client, userId);
            await interaction.editReply({
              content: `L'utilisateur avec l'ID ${userId} a été débanni du système Pulsar.`,
            });
          } else {
            await interaction.editReply({
              content:
                'Erreur lors du débannissement Pulsar ou utilisateur non trouvé dans la base de données.',
            });
          }
        } catch (error) {
          console.error('Erreur lors du débannissement Pulsar:', error);
          await interaction.editReply({
            content: 'Une erreur est survenue lors du débannissement Pulsar.',
          });
        }
      }
    } catch (error) {
      console.error('Erreur générale dans la commande Pulsar:', error);

      // Vérifier si la réponse a déjà été différée
      if (interaction.deferred) {
        await interaction.editReply({
          content:
            "Une erreur est survenue lors de l'exécution de la commande Pulsar.",
        });
      } else {
        await interaction.reply({
          ephemeral: true,
          content:
            "Une erreur est survenue lors de l'exécution de la commande Pulsar.",
        });
      }
    }
  },
};

export default pulsarCommand;
