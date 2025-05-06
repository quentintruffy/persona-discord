import { Events, Guild } from 'discord.js';
import DiscordClient from '../client/discord-client';
import { IEvent } from '../client/handlers/event-handler';

const guildCreate: IEvent<Events.GuildDelete> = {
  name: Events.GuildDelete,
  execute: async (client: DiscordClient, guild: Guild) => {},
};

export default guildCreate;
