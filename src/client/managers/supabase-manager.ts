import { createClient, SupabaseClient } from '@supabase/supabase-js';
import DiscordClient from '../discord-client';

/**
 * Service de base de données qui gère les connexions et les requêtes à Supabase
 */
export class SupabaseManager {
  /** Instance du client Discord */
  private readonly client: DiscordClient;

  /** Instance Supabase */
  private readonly supabase: SupabaseClient;

  constructor(client: DiscordClient) {
    try {
      this.client = client;

      // Initialisation du client Supabase
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        throw new Error(
          "Les variables d'environnement SUPABASE_URL et SUPABASE_KEY sont requises",
        );
      }
      this.supabase = createClient(
        process.env.SUPABASE_URL as string,
        process.env.SUPABASE_KEY as string,
      );

      // Tester la connexion immédiatement
      this.testConnection();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Teste la connexion à Supabase
   */
  private async testConnection(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('health_check')
        .select('*')
        .limit(1);

      if (error) {
        console.warn(
          'Erreur lors du test de connexion à Supabase:',
          error.message,
        );
      } else {
        console.log('✓ Connexion à Supabase établie');
      }
    } catch (error) {
      console.warn('Erreur lors du test de connexion à Supabase:', error);
    }
  }

  /**
   * Récupère toutes les entrées d'une table
   * @param table - Nom de la table
   * @returns Données et erreur éventuelle
   */
  public async getAll(
    table: string,
  ): Promise<{ data: any[] | null; error: any }> {
    return await this.supabase.from(table).select('*');
  }

  /**
   * Récupère des entrées par une clé spécifique
   * @param table - Nom de la table
   * @param column - Colonne à filtrer
   * @param value - Valeur recherchée
   * @returns Données et erreur éventuelle
   */
  public async getByKey(
    table: string,
    column: string,
    value: any,
  ): Promise<{ data: any[] | null; error: any }> {
    return await this.supabase.from(table).select('*').eq(column, value);
  }

  /**
   * Insère ou met à jour des données dans une table
   * @param table - Nom de la table
   * @param data - Données à insérer/mettre à jour
   * @returns Données insérées et erreur éventuelle
   */
  public async upsert(
    table: string,
    data: any,
  ): Promise<{ data: any | null; error: any }> {
    return await this.supabase.from(table).upsert(data, {
      onConflict: 'id', // Assurez-vous que cette colonne correspond à votre schéma
    });
  }

  /**
   * Supprime des entrées d'une table
   * @param table - Nom de la table
   * @param column - Colonne à filtrer
   * @param value - Valeur à supprimer
   * @returns Statut de suppression et erreur éventuelle
   */
  public async delete(
    table: string,
    column: string,
    value: any,
  ): Promise<{ data: any | null; error: any }> {
    return await this.supabase.from(table).delete().eq(column, value);
  }

  /**
   * Configure un écouteur de changements en temps réel sur une table
   * @param table - Nom de la table à surveiller
   * @param callback - Fonction à exécuter lors d'un changement
   */
  public subscribeToChanges(
    table: string,
    callback: (payload: any) => void,
  ): () => void {
    const subscription = this.supabase
      .channel(`table-changes-${table}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les types d'événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: table,
        },
        (payload) => {
          callback(payload);
        },
      )
      .subscribe();

    // Retourner une fonction pour se désabonner plus tard
    return () => {
      subscription.unsubscribe();
    };
  }
}
