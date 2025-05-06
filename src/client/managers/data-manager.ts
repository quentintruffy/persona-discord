import DiscordClient from '../discord-client';
import { RedisManager } from './redis-manager';
import { SupabaseManager } from './supabase-manager';

/**
 * Gestionnaire central pour la synchronisation des données entre Redis et Supabase
 */
export class DataManager {
  private readonly client: DiscordClient;
  private readonly redis: RedisManager;
  private readonly supabase: SupabaseManager;

  constructor(client: DiscordClient) {
    this.client = client;
    this.redis = client.redis_manager;
    this.supabase = client.supabase_manager;
  }

  /**
   * Récupère une donnée, en priorité depuis Redis puis Supabase si non trouvée
   * @param key - Clé de la donnée à récupérer
   * @param table - Table Supabase correspondante
   * @param column - Colonne d'identification dans Supabase
   * @returns Donnée récupérée ou null si inexistante
   */
  public async getData<T>(
    key: string,
    table: string,
    column: string,
  ): Promise<T | null> {
    try {
      // 1. Tenter de récupérer depuis Redis (plus rapide)
      const cachedData = await this.redis.get(key);

      if (cachedData) {
        return JSON.parse(cachedData) as T;
      }

      // 2. Si non trouvé, récupérer depuis Supabase
      const { data, error } = await this.supabase.getByKey(table, column, key);

      if (error || !data || data.length === 0) {
        return null;
      }

      const result = data[0];

      // 3. Mettre en cache dans Redis pour les prochaines requêtes
      await this.redis.set(key, JSON.stringify(result));

      return result as T;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des données pour ${key}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Enregistre une donnée à la fois dans Redis et Supabase
   * @param key - Clé pour l'enregistrement Redis
   * @param data - Données à enregistrer
   * @param table - Table Supabase correspondante
   * @param upsertOptions - Options pour l'upsert Supabase
   * @returns Succès de l'opération
   */
  public async setData<T>(
    key: string,
    data: T,
    table: string,
    upsertOptions: any = {},
  ): Promise<boolean> {
    try {
      // 1. Enregistrement dans Supabase (source de vérité)
      const supabaseResult = await this.supabase.upsert(table, {
        ...data,
        ...upsertOptions,
      });

      if (supabaseResult.error) {
        throw new Error(`Erreur Supabase: ${supabaseResult.error.message}`);
      }

      // 2. Mise en cache dans Redis
      await this.redis.set(key, JSON.stringify(data));

      return true;
    } catch (error) {
      console.error(
        `Erreur lors de l'enregistrement des données pour ${key}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Supprime une donnée à la fois de Redis et Supabase
   * @param key - Clé Redis à supprimer
   * @param table - Table Supabase correspondante
   * @param column - Colonne d'identification dans Supabase
   * @returns Succès de l'opération
   */
  public async deleteData(
    key: string,
    table: string,
    column: string,
  ): Promise<boolean> {
    try {
      // 1. Suppression dans Supabase
      const supabaseResult = await this.supabase.delete(table, column, key);

      if (supabaseResult.error) {
        throw new Error(`Erreur Supabase: ${supabaseResult.error.message}`);
      }

      // 2. Suppression dans Redis
      await this.redis.delete(key);

      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression des données pour ${key}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Invalide le cache Redis pour forcer une relecture depuis Supabase
   * @param pattern - Motif de clés à invalider (ex: "user:*")
   */
  public async invalidateCache(pattern: string): Promise<void> {
    await this.redis.deletePattern(pattern);
  }

  /**
   * Resynchronise le cache Redis depuis Supabase pour un ensemble de données
   * @param table - Table Supabase à synchroniser
   * @param keyGenerator - Fonction pour générer les clés Redis
   */
  public async resyncFromSupabase(
    table: string,
    keyGenerator: (item: any) => string,
  ): Promise<void> {
    // 1. Récupérer toutes les données de Supabase
    const { data, error } = await this.supabase.getAll(table);

    if (error || !data) {
      throw new Error(
        `Erreur lors de la récupération des données depuis Supabase: ${error?.message}`,
      );
    }

    // 2. Pour chaque élément, mettre à jour Redis
    for (const item of data) {
      const key = keyGenerator(item);
      await this.redis.set(key, JSON.stringify(item));
    }
  }
}
