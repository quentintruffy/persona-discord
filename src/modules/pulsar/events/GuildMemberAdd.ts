import { Events, GuildMember } from 'discord.js';
import DiscordClient from '../../../client/DiscordClient';
import { IEvent } from '../../../client/managers/eventmanager';

/**
 * Événement qui gère toutes les interactions entrantes, en particulier les commandes slash
 */
const GuildMemberAdd: IEvent<Events.GuildMemberAdd> = {
  name: Events.GuildMemberAdd,
  once: false, // Cet événement doit être exécuté à chaque interaction
  execute: async (client: DiscordClient, member: GuildMember) => {
    console.log('GuildMemberAdd');
    // const checkIfBan =
    //   await client.pulsar_punishment_service.getPulsarPunishment(member.id);
    // if (checkIfBan) {
    //   await member.kick('Bannissement Pulsar');
    //   await member.send(
    //     `Vous avez reçu un bannissement de Pulsar, cela signifie que vous avez été de tous les serveur discord utilisant le bot Persona.`,
    //   );
    // }
  },
};

export default GuildMemberAdd;
