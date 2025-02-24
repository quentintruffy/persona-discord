import { Events, Guild } from "discord.js";
import DiscordClient from "../client/DiscordClient";
import { IEvent } from "../manager/EventManager";

const GuildDelete: IEvent<Events.GuildDelete> = {
  name: Events.GuildDelete,
  execute: async (client: DiscordClient, guild: Guild) => {
    await client.removeGuild(guild);
  },
};

export default GuildDelete;
