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

      // Écouter les événements de connexion/déconnexion
      this.setupEventListeners();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Configure les écouteurs d'événements pour Redis
   */
  private setupEventListeners(): void {
    this.redis.on('connect', () => {
      console.log('✓ Connexion à Redis établie');
    });

    this.redis.on('error', (err) => {
      console.error('Erreur Redis:', err);
    });

    this.redis.on('reconnecting', () => {
      console.log('Tentative de reconnexion à Redis...');
    });
  }

  /**
   * Récupère une valeur depuis Redis
   * @param key - Clé à récupérer
   * @returns Valeur associée à la clé ou null si inexistante
   */
  public async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de ${key} depuis Redis:`,
        error,
      );
      return null;
    }
  }

  /**
   * Enregistre une valeur dans Redis
   * @param key - Clé à enregistrer
   * @param value - Valeur à associer à la clé
   * @param ttl - Durée de vie en secondes (optionnel)
   */
  public async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redis.set(key, value, 'EX', ttl);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement de ${key} dans Redis:`,
        error,
      );
    }
  }

  /**
   * Supprime une clé de Redis
   * @param key - Clé à supprimer
   */
  public async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de ${key} depuis Redis:`,
        error,
      );
    }
  }

  /**
   * Supprime toutes les clés correspondant à un motif
   * @param pattern - Motif de recherche (ex: "user:*")
   */
  public async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(
        `Erreur lors de la suppression des clés correspondant à ${pattern}:`,
        error,
      );
    }
  }

  /**
   * Publie un message sur un canal Redis pour la communication entre services
   * @param channel - Canal de publication
   * @param message - Message à publier
   */
  public async publish(channel: string, message: string): Promise<void> {
    try {
      await this.redis.publish(channel, message);
    } catch (error) {
      console.error(
        `Erreur lors de la publication sur le canal ${channel}:`,
        error,
      );
    }
  }

  /**
   * S'abonne à un canal Redis
   * @param channel - Canal d'abonnement
   * @param callback - Fonction à exécuter lors de la réception d'un message
   */
  public subscribe(channel: string, callback: (message: string) => void): void {
    const subscriber = this.redis.duplicate();

    subscriber.subscribe(channel, (err, count) => {
      if (err) {
        console.error(`Erreur lors de l'abonnement au canal ${channel}:`, err);
        return;
      }
      console.log(`Abonné à ${count} canaux, dont ${channel}`);
    });

    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }
}
