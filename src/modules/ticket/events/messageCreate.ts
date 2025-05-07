import {
  ChannelType,
  Events,
  ForumChannel,
  Message,
  TextChannel,
  ThreadChannel,
} from 'discord.js';
import DiscordClient from '../../../client/discord-client';
import { IEvent } from '../../../client/handlers/event-handler';

/**
 * Événement qui gère toutes les interactions entrantes, en particulier les commandes slash
 */
const MessageCreate: IEvent<Events.MessageCreate> = {
  name: Events.MessageCreate,
  once: false, // Cet événement doit être exécuté à chaque interaction
  execute: async (client: DiscordClient, message: Message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (message.channel.id === '1369490727670648883') {
      sendMessageToThread(client, '1369490724093038592', message.content);
    }

    if (message.channel.id === '1369490724093038592') {
      // const channel = new ChannelManager(
      //   client,
      //   message.guild?.id,
      //   '1369490727670648883',
      // );

      // const chan = await channel.getChannel<TextChannel>();
      // await chan.send({
      //   flags: MessageFlags.IsComponentsV2,
      //   components: [
      //     MessageTicketContainer({
      //       message: message.content,
      //       author: message.author,
      //     }),
      //   ],
      // });

      sendEphemeralWebhookMessage(
        client,
        '1369490727670648883',
        message.content,
        message.author.displayName,
        message.author.avatarURL() || '',
      );
    }
  },
};

export default MessageCreate;

// Fonction pour envoyer un message dans un thread via webhook
async function sendMessageToThread(
  client: DiscordClient,
  threadId: string,
  message: string,
) {
  try {
    // Récupérer le thread par son ID
    const thread = await client.channels.fetch(threadId);

    if (
      !thread ||
      (thread.type !== ChannelType.PublicThread &&
        thread.type !== ChannelType.PrivateThread)
    ) {
      throw new Error("Canal non trouvé ou n'est pas un thread");
    }

    const threadChannel = thread as ThreadChannel;

    // Récupérer le canal parent (nécessaire pour créer un webhook)
    const parentChannel = threadChannel.parent;

    if (!parentChannel || !(parentChannel instanceof TextChannel)) {
      throw new Error("Canal parent non trouvé ou n'est pas un canal de texte");
    }

    // Récupérer les webhooks existants du canal parent
    const webhooks = await parentChannel.fetchWebhooks();
    let webhook = webhooks.find((wh) => wh.name === 'Persona Support');

    // Créer un webhook si nécessaire
    if (!webhook) {
      webhook = await parentChannel.createWebhook({
        name: 'Persona Support',
        avatar: 'https://i.imgur.com/AfFp7pu.png',
        reason: 'Webhook pour threads',
      });
      console.log('Nouveau webhook créé');
    } else {
      console.log('Webhook existant trouvé');
    }

    // Envoyer le message au thread en utilisant le webhook
    // Notez le paramètre thread_id qui est crucial pour cibler un thread spécifique
    await webhook.send({
      content: message,
      username: 'Persona Support',
      avatarURL: client.user?.avatarURL() || '',
      threadId: threadChannel.id, // Ceci est la clé pour envoyer dans un thread spécifique
    });

    console.log('Message envoyé dans le thread avec succès');
  } catch (error) {
    console.error("Erreur lors de l'envoi du message au thread:", error);
    throw error;
  }
}

// Fonction pour envoyer un message unique avec un webhook éphémère
async function sendEphemeralWebhookMessage(
  client: DiscordClient,
  threadId: string,
  message: string,
  webhookName: string = 'Message Éphémère',
  avatarURL: string = 'https://i.imgur.com/AfFp7pu.png',
) {
  try {
    // Récupérer le thread
    const thread = await client.channels.fetch(threadId);

    if (
      !thread ||
      (thread.type !== ChannelType.PublicThread &&
        thread.type !== ChannelType.PrivateThread)
    ) {
      throw new Error("Canal non trouvé ou n'est pas un thread");
    }

    const threadChannel = thread as ThreadChannel;

    // Récupérer le canal parent
    const parentChannel = threadChannel.parent;

    if (!parentChannel || !(parentChannel instanceof ForumChannel)) {
      throw new Error("Canal parent non trouvé ou n'est pas un canal de texte");
    }

    // Créer un webhook temporaire
    const tempWebhook = await parentChannel.createWebhook({
      name: webhookName,
      avatar: avatarURL,
      reason: 'Webhook éphémère pour message unique',
    });

    console.log('Webhook éphémère créé');

    try {
      // Envoyer le message au thread
      await tempWebhook.send({
        content: "Message de l'utilisateur <@268280907453038593> :\n" + message,
        username: webhookName,
        avatarURL: avatarURL,
        threadId: threadChannel.id,
      });

      console.log('Message envoyé dans le thread avec succès');
    } finally {
      // Supprimer le webhook dans tous les cas, même en cas d'erreur lors de l'envoi
      await tempWebhook.delete('Webhook éphémère supprimé après utilisation');
      console.log('Webhook éphémère supprimé');
    }
  } catch (error) {
    console.error("Erreur lors de l'utilisation du webhook éphémère:", error);
    throw error;
  }
}
