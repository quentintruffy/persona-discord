import Redis from 'ioredis';
import DiscordClient from '../discord-client';

/**
 * Service de base de données qui gère les connexions et les requêtes à Redis
 */
export class RedisManager {
  /** Instance du client Discord */
  private readonly client: DiscordClient;

  /** Instance Redis */
  private readonly redis: Redis;

  constructor(client: DiscordClient) {
    try {
      this.client = client;

      // Initialisation du client Supabase
      if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
        throw new Error(
          "Les variables d'environnement REDIS_HOST et REDIS_PORT sont requises",
        );
      }
      this.redis = new Redis({
        host: process.env.REDIS_HOST as string,
        port: parseInt(process.env.REDIS_PORT as string),
        password: process.env.REDIS_PASSWORD as string,
        db: 0,
        retryStrategy: (times: number) => {
          if (times > 3) {
            console.error('Redis connection failed and retried 3 times');
            return null;
          }
          return Math.min(times * 100, 2000);
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
