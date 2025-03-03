import { Events, GuildMember, TextChannel } from 'discord.js';
import DiscordClient from '../../../client/DiscordClient';
import { IEvent } from '../../../client/managers/eventmanager';

/**
 * Événement qui gère toutes les interactions entrantes, en particulier les commandes slash
 */
const GuildMemberAdd: IEvent<Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  once: false, // Cet événement doit être exécuté à chaque interaction
  execute: async (client: DiscordClient, member: GuildMember) => {
    try {
      const guildConfig = await client.guild_service.getOrCreateGuildConfig(
        member.guild.id,
      );
      if (!guildConfig.welcome_channel_id) return;

      const channel = member.guild.channels.cache.get(
        guildConfig.welcome_channel_id,
      );
      if (!channel) return;

      if (!(channel instanceof TextChannel)) return;
      await channel.send(`Bienvenue sur le serveur ${member.guild.name}! 👋`);
    } catch (error) {
      console.error(
        `Erreur lors de l'exécution de l'événement GuildMemberAdd:`,
        error,
      );
    }
  },
};

export default GuildMemberAdd;
