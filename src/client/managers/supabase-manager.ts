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
    } catch (error) {
      throw error;
    }
  }
}
