import DiscordClient from '../../../client/DiscordClient';
import { PulsarPunishmentType } from '../../../schemas/types/bases/pulsarpunishments.schemas';

export const bannissementPulsar = async (
  client: DiscordClient,
  memberId: string,
  reason: string,
): Promise<PulsarPunishmentType> => {
  return await client.pulsar_punishment_service.upsertPulsarPunishment(
    memberId,
    reason,
  );
};

export const bannissementPulsarGlobal = async (
  client: DiscordClient,
  memberId: string,
  reason: string,
) => {
  const botGuilds = client.guilds.cache;

  for (const [guildId, guild] of botGuilds) {
    try {
      await guild.bans.create(memberId, {
        reason: 'Bannissement Pulsar. ID: ' + memberId,
      });
    } catch (error) {
      console.error(
        `Erreur lors de la vérification du membre dans la guilde ${guild.name}:`,
        error,
      );
    }
  }
};

export const unbannissementPulsar = async (
  client: DiscordClient,
  memberId: string,
): Promise<boolean> => {
  console.log('unbannissementPulsar', memberId);
  return await client.pulsar_punishment_service.removePulsarPunishment(
    memberId,
  );
};

export const unbannissementPulsarGlobal = async (
  client: DiscordClient,
  memberId: string,
) => {
  const botGuilds = client.guilds.cache;
  console.log('unbannissementPulsarGlobal', memberId);

  for (const [guildId, guild] of botGuilds) {
    try {
      await guild.bans.remove(memberId);
    } catch (error) {
      console.error(
        `Erreur lors de la vérification du membre dans la guilde ${guild.name}:`,
        error,
      );
    }
  }
};
