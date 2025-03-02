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
  },
};

export default MessageCreate;
