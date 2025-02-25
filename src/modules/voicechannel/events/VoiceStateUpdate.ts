import {
  ChannelType,
  Events,
  PermissionFlagsBits,
  VoiceState,
} from "discord.js";
import DiscordClient from "../../../client/DiscordClient";
import { IEvent } from "../../../manager/EventManager";
import voiceChannelModule from "../../voicechannel/module";
import config from "../config";

const VoiceStateUpdate: IEvent<Events.VoiceStateUpdate> = {
  name: Events.VoiceStateUpdate,
  once: false, // Cet événement doit être exécuté à chaque interaction

  execute: async (
    client: DiscordClient,
    oldState: VoiceState,
    newState: VoiceState
  ) => {
    const { lobbyChannelId } = config;

    // 1. Utilisateur rejoint le salon lobby
    if (newState.channelId === lobbyChannelId) {
      await handleJoinLobby(client, newState);
      return;
    }

    // 2. Utilisateur quitte un salon
    if (
      oldState.channelId &&
      (!newState.channelId || oldState.channelId !== newState.channelId)
    ) {
      await handleLeaveChannel(client, oldState);
      return;
    }
  },
};

export default VoiceStateUpdate;

/**
 * Gère l'événement quand un utilisateur rejoint le salon lobby
 */
async function handleJoinLobby(client: DiscordClient, state: VoiceState) {
  const member = state.member;
  if (!member) {
    console.error("Membre non trouvé dans state");
    return;
  }

  const guild = state.guild;
  console.log(`Création d'un salon privé pour ${member.displayName}...`);

  // Créer un nom personnalisé pour le salon
  const channelName = `${config.channelNamePrefix}${member.displayName}`;

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildVoice,
    parent: config.privateChannelCategoryId,
    userLimit: config.defaultUserLimit,
    permissionOverwrites: [
      {
        id: guild.id, // @everyone
        deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.Connect,
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.MuteMembers,
          PermissionFlagsBits.DeafenMembers,
          PermissionFlagsBits.MoveMembers,
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

  try {
    // Déplacer le membre dans son salon privé
    await member.voice.setChannel(channel);

    // Enregistrer l'association membre -> salon
    voiceChannelModule.data.privateChannels.set(member.id, channel.id);

    console.log(
      `✓ Salon privé créé pour ${member.displayName} (${channel.id})`
    );

    // Envoyer un message éphémère au membre pour lui expliquer les commandes
    try {
      // On ne peut pas envoyer de message éphémère ici directement car ce n'est pas une interaction
      // On pourrait utiliser un salon textuel temporaire ou DM, mais ce n'est pas idéal
      // Une solution plus élégante serait d'avoir un salon textuel d'info
      await channel.send({
        content: `# Bienvenue dans votre salon privé, ${member} ! 🎉\n\nCe canal textuel est associé à votre salon vocal privé. Tous les membres qui rejoignent votre salon vocal peuvent voir ce canal.\n\nCommandes disponibles:\n- \`/voicechannel invite @membre\` pour inviter un membre\n- \`/voicechannel kick @membre\` pour expulser un membre\n- \`/voicechannel rename nom\` pour renommer le salon\n- \`/voicechannel limit nombre\` pour définir une limite d'utilisateurs\n- \`/voicechannel lock true/false\` pour verrouiller/déverrouiller le salon\n\nLe salon sera supprimé automatiquement lorsque tout le monde l'aura quitté.`,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message de bienvenue:", error);
    }
  } catch (error) {
    console.error("Erreur lors du déplacement du membre:", error);
    // Si on ne peut pas déplacer le membre, supprimer le salon pour éviter les salons orphelins
    try {
      await channel.delete("Impossible de déplacer le membre");
    } catch (deleteError) {
      console.error("Erreur lors de la suppression du salon:", deleteError);
    }
  }
}

/**
 * Gère l'événement quand un utilisateur quitte un salon
 */
async function handleLeaveChannel(client: DiscordClient, state: VoiceState) {
  const memberId = state.member?.id || "";
  const channelId = voiceChannelModule.data.privateChannels.get(memberId);

  // Si ce n'est pas un salon privé que cette personne a créé, on ne fait rien
  if (!channelId) {
    return;
  }

  // Récupérer le salon
  const channel = state.guild.channels.cache.get(channelId);
  if (!channel || !channel.isVoiceBased()) {
    // Si le salon n'existe plus, nettoyer nos données
    voiceChannelModule.data.privateChannels.delete(memberId);
    return;
  }

  // Vérifier si le salon est vide
  if (channel.members.size === 0) {
    console.log(`Nettoyage du salon privé ${channelId}...`);

    try {
      await channel.delete(
        `Salon privé de ${state.member?.displayName} supprimé automatiquement (vide)`
      );

      // Supprimer l'association membre -> salon et les données d'activité
      voiceChannelModule.data.privateChannels.delete(memberId);

      console.log(
        `✓ Salon privé de ${state.member?.displayName} supprimé (vide)`
      );
    } catch (error) {
      console.error("Erreur lors de la suppression du salon:", error);
    }
  } else {
    // Le salon n'est pas vide, donc on le conserve
    // On pourrait implémenter ici une logique pour transférer la propriété à quelqu'un d'autre
    console.log(`Salon privé ${channelId} conservé car il n'est pas vide`);
  }
}
