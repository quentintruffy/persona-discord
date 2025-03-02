import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

export class DatabaseService {
  private supabase: SupabaseClient;
  private redis: Redis | null = null;
  private redisEnabled = false;
  private readonly cacheExpiration = 3600; // 1 heure en secondes
  private readonly keyPrefix = 'persona:';

  constructor() {
    // Initialisation de Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Les variables d'environnement SUPABASE_URL et SUPABASE_KEY sont requises",
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Initialisation de Redis (optionnel)
    this.redisEnabled = process.env.REDIS_ENABLED === 'true';

    if (this.redisEnabled) {
      try {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
          this.redis = new Redis(redisUrl);
        } else {
          // Configuration par défaut si REDIS_URL n'est pas fourni
          this.redis = new Redis({
            keyPrefix: this.keyPrefix,
          });
        }

        this.redis.on('connect', () => {
          console.log('Redis connecté avec succès');
        });

        this.redis.on('error', (err) => {
          console.error('Erreur Redis:', err);
          this.redisEnabled = false;
          this.redis = null;
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation de Redis:", error);
        this.redisEnabled = false;
        this.redis = null;
      }
    } else {
      console.log('Redis est désactivé, utilisation de Supabase uniquement');
    }
  }

  /**
   * Accès au client Supabase
   */
  getSupabase(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Vérifie si Redis est activé
   */
  isRedisEnabled(): boolean {
    return this.redisEnabled && this.redis !== null;
  }

  /**
   * Récupère une valeur du cache Redis
   */
  async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.isRedisEnabled() || !this.redis) return null;

    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de la clé ${key} depuis Redis:`,
        error,
      );
      return null;
    }
  }

  /**
   * Stocke une valeur dans le cache Redis
   */
  async setInCache<T>(
    key: string,
    value: T,
    expirationInSeconds?: number,
  ): Promise<boolean> {
    if (!this.isRedisEnabled() || !this.redis) return false;

    try {
      const expiration = expirationInSeconds || this.cacheExpiration;
      await this.redis.set(key, JSON.stringify(value), 'EX', expiration);
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la définition de la clé ${key} dans Redis:`,
        error,
      );
      return false;
    }
  }

  /**
   * Supprime une valeur du cache Redis
   */
  async deleteFromCache(key: string): Promise<boolean> {
    if (!this.isRedisEnabled() || !this.redis) return false;

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de la clé ${key} depuis Redis:`,
        error,
      );
      return false;
    }
  }

  /**
   * Supprime plusieurs valeurs du cache Redis
   */
  async deleteKeysWithPattern(pattern: string): Promise<boolean> {
    if (!this.isRedisEnabled() || !this.redis) return false;

    try {
      const fullPattern = `${this.keyPrefix}${pattern}`;
      const keys = await this.redis.keys(fullPattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression des clés avec le pattern ${pattern}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Récupère le préfixe des clés Redis
   */
  getKeyPrefix(): string {
    return this.keyPrefix;
  }

  /**
   * Récupère la durée d'expiration par défaut
   */
  getDefaultExpiration(): number {
    return this.cacheExpiration;
  }
}
