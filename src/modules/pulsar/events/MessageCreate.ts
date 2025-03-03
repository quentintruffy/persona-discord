import { Events, Message } from 'discord.js';
import DiscordClient from '../../../client/DiscordClient';
import { IEvent } from '../../../client/managers/eventmanager';

/**
 * Événement qui gère toutes les interactions entrantes, en particulier les commandes slash
 */
const MessageCreate: IEvent<Events.MessageCreate> = {
  name: Events.MessageCreate,
  once: false, // Cet événement doit être exécuté à chaque interaction
  execute: async (client: DiscordClient, message: Message) => {
    // if (message.author.bot) return;
    // const checkIfBan =
    //   await client.pulsar_punishment_service.getPulsarPunishment(
    //     message.author.id,
    //   );
    // if (checkIfBan && message.guild) {
    //   const member = message.member;
    //   if (!member) return;
    //   const guilds = client.guilds.cache;
    //   if (!guilds) return;
    //   await member.send(
    //     `Vous avez reçu un bannissement de Pulsar, cela signifie que vous avez été de tous les serveur discord utilisant le bot Persona.`,
    //   );
    //   await message.delete();
    //   const id = message.member.id;
    //   const members = message.member;
    //   if (!member) return;
    //   // Récupérer toutes les guildes où le bot est présent
    //   const botGuilds = client.guilds.cache;
    //   // Initialiser un tableau pour les guildes communes
    //   const commonGuilds = [];
    //   console.log('Bannissement Pulsar, member:', member.id, 'guild:', id);
    //   // Parcourir chaque guilde pour vérifier si l'utilisateur y est présent
    //   for (const [guildId, guild] of botGuilds) {
    //     try {
    //       // Tenter de récupérer le membre dans cette guilde
    //       const member = await guild.members
    //         .fetch(members.id)
    //         .catch(() => null);
    //       // Si le membre est trouvé, ajouter la guilde à la liste
    //       if (member) {
    //         await guild.members.ban(member.id, {
    //           reason: 'Bannissement Pulsar. ID: ' + member.id,
    //         });
    //         await guild.members.kick(member.id, 'Bannissement Pulsar');
    //       }
    //     } catch (error) {
    //       console.error(
    //         `Erreur lors de la vérification du membre dans la guilde ${guild.name}:`,
    //         error,
    //       );
    //     }
    //   }
    //   return;
    // }
  },
};

export default MessageCreate;
