import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { z } from 'zod';
import { Database } from '../../schemas/database.types';

/**
 * Service de base de données qui gère les requêtes Supabase avec cache Redis
 */
export class DatabaseManager {
  private supabase: SupabaseClient;
  private redis: Redis | null = null;
  private cacheEnabled: boolean;
  private defaultCacheTtl: number = 3600;

  constructor() {
    // Initialisation du client Supabase
    this.supabase = createClient<Database>(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_KEY as string,
    );

    // Initialisation de Redis si activé
    this.cacheEnabled = process.env.REDIS_ENABLED === 'true';
    if (this.cacheEnabled) {
      try {
        this.redis = new Redis({
          host: process.env.REDIS_HOST as string,
          port: parseInt(process.env.REDIS_PORT as string),
          password: process.env.REDIS_PASSWORD as string,
          retryStrategy: (times: number) => {
            if (times > 3) {
              console.error('Redis connection failed and retried 3 times');
              this.cacheEnabled = false;
              return null;
            }
            return Math.min(times * 100, 2000);
          },
        });

        this.redis.on('error', (err) => {
          console.error('Redis error:', err);
          this.cacheEnabled = false;
        });

        this.redis.on('ready', () => {
          console.log('Redis is ready');
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation de Redis:", error);
        this.cacheEnabled = false;
      }
    }
  }

  /**
   * Récupère une valeur du cache Redis
   * @param key Clé de cache
   * @returns Valeur en cache ou null si pas trouvée
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.cacheEnabled || !this.redis) return null;

    try {
      const cachedData = await this.redis.get(key);
      if (cachedData) {
        return JSON.parse(cachedData) as T;
      }
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du cache pour ${key}:`,
        error,
      );
    }

    return null;
  }

  /**
   * Définit une valeur dans le cache Redis
   * @param key Clé de cache
   * @param value Valeur à mettre en cache
   * @param ttl Durée de vie en secondes (par défaut 1 heure)
   */
  private async setCache<T>(
    key: string,
    value: T,
    ttl: number = this.defaultCacheTtl,
  ): Promise<void> {
    if (!this.cacheEnabled || !this.redis) return;

    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      console.error(`Erreur lors de la mise en cache pour ${key}:`, error);
    }
  }

  /**
   * Supprime une valeur du cache Redis
   * @param key Clé de cache ou motif avec caractère générique (*)
   */
  public async invalidateCache(key: string): Promise<void> {
    if (!this.cacheEnabled || !this.redis) return;

    try {
      if (key.includes('*')) {
        // Suppression par motif
        const keys = await this.redis.keys(key);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // Suppression directe
        await this.redis.del(key);
      }
    } catch (error) {
      console.error(
        `Erreur lors de l'invalidation du cache pour ${key}:`,
        error,
      );
    }
  }

  /**
   * Récupère des données avec validation de type et mise en cache
   * @param options Options de requête
   * @returns Données validées selon le schéma Zod
   */
  public async query<T>({
    queryFn,
    schema,
    cacheKey,
    ttl,
    skipCache = false,
  }: {
    queryFn: () => Promise<any>;
    schema: z.ZodType<T>;
    cacheKey?: string;
    ttl?: number;
    skipCache?: boolean;
  }): Promise<T> {
    // Essayer de récupérer depuis le cache si une clé est fournie
    if (cacheKey && !skipCache) {
      const cachedData = await this.getFromCache<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Exécuter la requête
    const data = await queryFn();

    // Valider avec Zod
    const validatedData = schema.parse(data);

    // Mettre en cache si nécessaire
    if (cacheKey && !skipCache) {
      await this.setCache(cacheKey, validatedData, ttl);
    }

    return validatedData;
  }

  /**
   * Récupère le client Supabase
   */
  public getSupabase() {
    return this.supabase;
  }

  /**
   * Ferme les connexions
   */
  public async close() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

export const dbService = new DatabaseManager();
