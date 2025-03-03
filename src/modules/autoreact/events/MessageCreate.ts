import { Events, Message } from 'discord.js';
import DiscordClient from '../../../client/DiscordClient';
import { IEvent } from '../../../client/managers/eventmanager';
import autoReactModule from '../module';

/**
 * Événement qui gère toutes les interactions entrantes, en particulier les commandes slash
 */
const MessageCreate: IEvent<Events.MessageCreate> = {
  name: Events.MessageCreate,
  once: false, // Cet événement doit être exécuté à chaque interaction
  execute: async (client: DiscordClient, message: Message) => {
    if (message.author.bot) return;

    const hellowords = autoReactModule.data.hellowords;

    if (hellowords.some((word: string) => message.content.includes(word))) {
      message.react('👋');
    }

    // obtenir le salon de
    const guilds = client.guilds.cache;
    if (!guilds) return;

    guilds.map((guild) => {
      console.log(guild.name + '_' + guild.publicUpdatesChannelId);
    });
  },
};

export default MessageCreate;
