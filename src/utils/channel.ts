import {
  ChannelType,
  Guild,
  GuildChannelCreateOptions,
  VoiceChannel,
} from "discord.js";
import DiscordClient from "../client/DiscordClient";

export const createVoiceChannel = async (
  client: DiscordClient,
  guild: Guild,
  options: GuildChannelCreateOptions & {
    type: ChannelType.GuildVoice;
  }
): Promise<VoiceChannel | null> => {
  try {
    return await guild.channels.create({
      ...options,
      type: ChannelType.GuildVoice,
    });
  } catch (error) {
    console.error("Erreur lors de la création d'un salon privé:", error);
    return null;
  }
};
