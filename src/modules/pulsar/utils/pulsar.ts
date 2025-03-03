import DiscordClient from '../../../client/DiscordClient';
import { PulsarPunishmentType } from '../../../schemas/types/bases/pulsarpunishments.schemas';

/**
 * Enregistre un bannissement Pulsar dans la base de données
 * @param client Client Discord
 * @param memberId ID du membre à bannir
 * @param reason Raison du bannissement
 * @returns L'objet de punition créé ou mis à jour
 */
export const bannissementPulsar = async (
  client: DiscordClient,
  memberId: string,
  reason: string,
): Promise<PulsarPunishmentType | null> => {
  try {
    // Vérifie si le service existe sur le client
    if (!client.pulsar_punishment_service) {
      console.error(
        'Service pulsar_punishment_service non disponible sur le client',
      );
      return null;
    }

    return await client.pulsar_punishment_service.upsertPulsarPunishment(
      memberId,
      reason,
    );
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement du bannissement Pulsar:",
      error,
    );
    return null;
  }
};

/**
 * Applique le bannissement Pulsar sur tous les serveurs où le bot est présent
 * @param client Client Discord
 * @param memberId ID du membre à bannir
 * @param reason Raison du bannissement
 */
export const bannissementPulsarGlobal = async (
  client: DiscordClient,
  memberId: string,
  reason: string,
): Promise<void> => {
  const botGuilds = client.guilds.cache;
  const failedGuilds: { guildId: string; guildName: string; error: any }[] = [];

  console.log(
    `Début du bannissement global Pulsar pour l'utilisateur ${memberId}`,
  );

  // Pour chaque serveur où le bot est présent
  for (const [guildId, guild] of botGuilds) {
    try {
      // Vérifier si l'utilisateur est déjà banni
      const existingBan = await guild.bans.fetch(memberId).catch(() => null);

      if (existingBan) {
        console.log(
          `L'utilisateur ${memberId} est déjà banni du serveur ${guild.name} (${guildId})`,
        );
        continue;
      }

      // Créer le bannissement
      await guild.bans.create(memberId, {
        reason: `Bannissement Pulsar: ${reason}. ID: ${memberId}`,
        deleteMessageSeconds: 604800, // Supprimer les messages des 7 derniers jours
      });

      console.log(
        `Utilisateur ${memberId} banni du serveur ${guild.name} (${guildId})`,
      );
    } catch (error) {
      console.error(
        `Erreur lors du bannissement de l'utilisateur ${memberId} dans la guilde ${guild.name} (${guildId}):`,
        error,
      );
      failedGuilds.push({ guildId, guildName: guild.name, error });
    }
  }

  if (failedGuilds.length > 0) {
    console.warn(
      `Le bannissement Pulsar a échoué sur ${failedGuilds.length} serveurs`,
    );
  } else {
    console.log(
      `Bannissement global Pulsar réussi pour l'utilisateur ${memberId}`,
    );
  }
};

/**
 * Supprime un bannissement Pulsar de la base de données
 * @param client Client Discord
 * @param memberId ID du membre à débannir
 * @returns true si le débannissement a réussi, false sinon
 */
export const unbannissementPulsar = async (
  client: DiscordClient,
  memberId: string,
): Promise<boolean> => {
  try {
    console.log('Suppression du bannissement Pulsar pour', memberId);

    // Vérifie si le service existe sur le client
    if (!client.pulsar_punishment_service) {
      console.error(
        'Service pulsar_punishment_service non disponible sur le client',
      );
      return false;
    }

    return await client.pulsar_punishment_service.removePulsarPunishment(
      memberId,
    );
  } catch (error) {
    console.error(
      'Erreur lors de la suppression du bannissement Pulsar:',
      error,
    );
    return false;
  }
};

/**
 * Retire le bannissement Pulsar sur tous les serveurs où le bot est présent
 * @param client Client Discord
 * @param memberId ID du membre à débannir
 */
export const unbannissementPulsarGlobal = async (
  client: DiscordClient,
  memberId: string,
): Promise<void> => {
  const botGuilds = client.guilds.cache;
  const failedGuilds: { guildId: string; guildName: string; error: any }[] = [];

  console.log(
    `Début du débannissement global Pulsar pour l'utilisateur ${memberId}`,
  );

  // Pour chaque serveur où le bot est présent
  for (const [guildId, guild] of botGuilds) {
    try {
      // Vérifier si l'utilisateur est banni
      const existingBan = await guild.bans.fetch(memberId).catch(() => null);

      if (!existingBan) {
        console.log(
          `L'utilisateur ${memberId} n'est pas banni du serveur ${guild.name} (${guildId})`,
        );
        continue;
      }

      // Retirer le bannissement
      await guild.bans.remove(memberId, 'Débannissement Pulsar');

      console.log(
        `Utilisateur ${memberId} débanni du serveur ${guild.name} (${guildId})`,
      );
    } catch (error) {
      console.error(
        `Erreur lors du débannissement de l'utilisateur ${memberId} dans la guilde ${guild.name} (${guildId}):`,
        error,
      );
      failedGuilds.push({ guildId, guildName: guild.name, error });
    }
  }

  if (failedGuilds.length > 0) {
    console.warn(
      `Le débannissement Pulsar a échoué sur ${failedGuilds.length} serveurs`,
    );
  } else {
    console.log(
      `Débannissement global Pulsar réussi pour l'utilisateur ${memberId}`,
    );
  }
};
