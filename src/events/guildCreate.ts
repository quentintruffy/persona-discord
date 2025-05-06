import { Events, Guild } from 'discord.js';
import DiscordClient from '../client/discord-client';
import { IEvent } from '../client/handlers/event-handler';

const guildCreate: IEvent<Events.GuildCreate> = {
  name: Events.GuildCreate,
  execute: async (client: DiscordClient, guild: Guild) => {},
};

export default guildCreate;
