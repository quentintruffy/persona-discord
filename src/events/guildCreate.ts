import { Events, Guild } from 'discord.js';
import DiscordClient from '../client/discord-client';
import { IEvent } from '../client/handlers/event-handler';

const guildCreate: IEvent<Events.GuildCreate> = {
  name: Events.GuildCreate,
  execute: async (client: DiscordClient, guild: Guild) => {
    try {
      await client.data_manager.setData(
        `guild:${guild.id}`,
        {
          id: guild.id,
          name: guild.name,
        },
        'guilds',
      );
    } catch (error) {
      console.error(`Erreur lors de la création de ${guild.name}:`, error);
    }
  },
};

export default guildCreate;
