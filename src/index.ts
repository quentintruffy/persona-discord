import { ShardingManager } from 'discord.js';
import 'dotenv/config';

if (!process.env.CLIENT_TOKEN) {
  throw new Error(
    "CLIENT_TOKEN est manquant dans les variables d'environnement",
  );
}

// Configuration du Sharding Manager
const manager = new ShardingManager('./dist/client.js', {
  // Pointe vers le fichier compilé
  token: process.env.CLIENT_TOKEN,
  totalShards: 'auto', // Discord calcule automatiquement le nombre optimal
  respawn: true, // Redémarrage automatique en cas de crash
  mode: 'process', // Utilise des processus séparés pour une meilleure isolation
});

// Événements du Sharding Manager
manager.on('shardCreate', (shard) => {
  console.log(`[SHARD MANAGER] Lancement du Shard ${shard.id}`);

  // Surveillance des shards
  shard.on('ready', () => {
    console.log(`[SHARD ${shard.id}] Prêt et opérationnel`);
  });

  shard.on('disconnect', () => {
    console.warn(`[SHARD ${shard.id}] Déconnecté de Discord`);
  });
});

// Démarrage de tous les shards
manager.spawn();
