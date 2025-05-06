import { Events } from 'discord.js';
import DiscordClient from '../client/discord-client';
import { IEvent } from '../handlers/event-handler';

const ready: IEvent<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true, // L'événement ready ne doit être exécuté qu'une seule fois
  execute: async (client: DiscordClient) => {
    console.log(`${client.user?.tag} est prêt et opérationnel`);
  },
};

export default ready;
