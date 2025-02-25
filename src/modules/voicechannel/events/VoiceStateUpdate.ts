import {
  ChannelType,
  Events,
  PermissionFlagsBits,
  VoiceState,
} from "discord.js";
import DiscordClient from "../../../client/DiscordClient";
import { IEvent } from "../../../manager/EventManager";
import { createVoiceChannel } from "../../../utils/channel";
import config from "../config";
import voiceChannelModule from "../module";

const VoiceStateUpdate: IEvent<Events.VoiceStateUpdate> = {
  name: Events.VoiceStateUpdate,
  once: false, // Cet événement doit être exécuté à chaque interaction

  execute: async (
    client: DiscordClient,
    oldState: VoiceState,
    newState: VoiceState
  ) => {
    // Si l'utilisateur rejoint le salon "lobby"
    if (newState.channelId === config.lobbyChannelId) {
      const member = newState.member;
      if (!member) {
        console.error("Membre non trouvé dans state");
        return;
      }

      const guild = newState.guild;
      console.log(`Création d'un salon privé pour ${member.displayName}...`);

      const channel = await createVoiceChannel(client, guild, {
        name: `${config.channelNamePrefix}${member.displayName}`,
        type: ChannelType.GuildVoice,
        parent: config.privateChannelCategoryId,
        permissionOverwrites: [
          {
            id: guild.id, // @everyone
            deny: [
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.ViewChannel,
            ],
          },
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers,
            ],
          },
          {
            id: client.user?.id || "",
            allow: [
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ManageChannels,
            ],
          },
        ],
      });

      if (!channel) {
        console.error("Erreur lors de la création d'un salon privé");
        return;
      }

      // Déplacer le membre dans son salon privé
      await member.voice.setChannel(channel);

      // Enregistrer l'association membre -> salon
      voiceChannelModule.data.privateChannels.set(member.id, channel.id);

      console.log(
        `✓ Salon privé créé pour ${member.displayName} (${channel.id})`
      );
    }
    if (oldState.channelId && !newState.channelId) {
      const memberId = newState.member?.id || "";
      const channelId = voiceChannelModule.data.privateChannels.get(memberId);

      if (!channelId) {
        return;
      }

      console.log(`Nettoyage du salon privé ${channelId}...`);

      const channel = newState.guild.channels.cache.get(channelId);

      // Vérifier si le salon existe et est vide
      if (channel && channel.isVoiceBased() && channel.members.size === 0) {
        await channel.delete(
          `Salon privé de ${newState.member?.displayName} supprimé automatiquement`
        );
        console.log(
          `✓ Salon privé de ${newState.member?.displayName} supprimé`
        );
      }

      // Supprimer l'association membre -> salon
      voiceChannelModule.data.privateChannels.delete(memberId);
    }
  },
};

export default VoiceStateUpdate;
