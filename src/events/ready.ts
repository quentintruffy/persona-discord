import { Events } from 'discord.js';
import DiscordClient from '../client/DiscordClient';
import { IEvent } from '../client/managers/eventmanager';

const ready: IEvent<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true, // L'événement ready ne doit être exécuté qu'une seule fois
  execute: async (client: DiscordClient) => {
    const shardId = client.shard?.ids[0] ?? 0;
    const totalShards = client.shard?.count ?? 1;

    console.log(`[Shard ${shardId}] ✓ ${client.user?.tag} est connecté !`);
    console.log(
      `[Shard ${shardId}] Ce bot est présent sur ${client.guilds.cache.size} serveurs`,
    );

    // Déploiement des commandes
    if (shardId === 0) {
      // Ne déployer les commandes globales que depuis le premier shard
      console.log(
        `[Shard ${shardId}] Déploiement des commandes (shard primaire)...`,
      );
      await client.command_manager.deployCommandsGlobally();
    }
  },
};

export default ready;
