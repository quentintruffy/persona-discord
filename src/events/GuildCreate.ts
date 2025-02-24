import { Events, Guild } from "discord.js";
import DiscordClient from "../client/DiscordClient";
import { IEvent } from "../manager/EventManager";

const GuildCreate: IEvent<Events.GuildCreate> = {
  name: Events.GuildCreate,
  execute: async (client: DiscordClient, newGuild: Guild) => {
    await client.addGuild(newGuild);
  },
};

export default GuildCreate;
