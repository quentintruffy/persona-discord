import { GuildSchema, GuildType } from '../../schemas/types/bases/guild.schema';
import {
  GuildConfigSchema,
  GuildConfigType,
} from '../../schemas/types/bases/guildconfig.schema';
import { dbService } from '../managers/databasemanager';

export class GuildService {
  /**
   * Crée ou met à jour une guilde dans la base de données
   */
  public async upsertGuild(guildData: GuildType): Promise<GuildType> {
    const validatedData = GuildSchema.parse(guildData);

    const { data, error } = await dbService
      .getSupabase()
      .from('guilds')
      .upsert(validatedData, { onConflict: 'id' })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'upsert de la guilde: ${error.message}`);
    }

    await dbService.invalidateCache(`guild:${validatedData.id}`);
    await dbService.invalidateCache(`guild:*`);

    return GuildSchema.parse(data);
  }

  /**
   * Récupère une guilde par son ID
   */
  public async getGuild(guildId: string): Promise<GuildType | null> {
    return dbService.query({
      queryFn: async () => {
        const { data, error } = await dbService
          .getSupabase()
          .from('guilds')
          .select('*')
          .eq('id', guildId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // PGRST116 = Not found
            return null;
          }
          throw new Error(
            `Erreur lors de la récupération de la guilde: ${error.message}`,
          );
        }

        return data;
      },
      schema: GuildSchema.nullable(),
      cacheKey: `guild:${guildId}`,
      ttl: 3600,
    });
  }

  /**
   * Vérifie si une guilde existe
   */
  public async guildExists(guildId: string): Promise<boolean> {
    const guild = await this.getGuild(guildId);
    return guild !== null;
  }

  /**
   * Récupère ou crée une guilde
   * @param guildId ID de la guilde
   * @returns La guilde
   */
  public async getOrCreateGuild(guildId: string): Promise<GuildType> {
    const guild = await this.getGuild(guildId);
    if (guild) {
      return guild;
    }

    return this.upsertGuild({
      id: guildId,
      name: 'Guilde Inconnue',
      icon: null,
      owner_id: guildId,
      joined_at: new Date(),
    });
  }

  /**
   * Récupère la configuration d'une guilde
   */
  public async getGuildConfig(
    guildId: string,
  ): Promise<GuildConfigType | null> {
    return dbService.query({
      queryFn: async () => {
        const { data, error } = await dbService
          .getSupabase()
          .from('guild_configs')
          .select('*')
          .eq('guild_id', guildId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Pas de config trouvée, retourner null
            return null;
          }
          throw new Error(
            `Erreur lors de la récupération de la config: ${error.message}`,
          );
        }

        return data;
      },
      schema: GuildConfigSchema.nullable(),
      cacheKey: `guild_config:${guildId}`,
      // ttl: 900,
      ttl: 10,
    });
  }

  /**
   * Crée ou met à jour la configuration d'une guilde
   */
  public async upsertGuildConfig(
    configData: GuildConfigType,
  ): Promise<GuildConfigType> {
    // Valider les données avec Zod
    const validatedData = GuildConfigSchema.parse(configData);

    // Insérer ou mettre à jour la configuration
    const { data, error } = await dbService
      .getSupabase()
      .from('guild_configs')
      .upsert(validatedData, { onConflict: 'guild_id' })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Erreur lors de l'upsert de la config: ${error.message}`);
    }

    // Invalider le cache
    await dbService.invalidateCache(`guild_config:${validatedData.guild_id}`);

    return GuildConfigSchema.parse(data);
  }

  /**
   * Récupère ou crée la configuration d'une guilde
   * @param guildId ID de la guilde
   * @returns La configuration de la guilde
   */
  public async getOrCreateGuildConfig(
    guildId: string,
  ): Promise<GuildConfigType> {
    const guild = await this.getOrCreateGuild(guildId);

    const guildConfig = await this.getGuildConfig(guild.id);
    if (guildConfig) {
      return guildConfig;
    }

    return this.upsertGuildConfig({
      guild_id: guildId,
      prefix: '!',
      welcome_channel_id: null,
      enabled_modules: [],
    });
  }
}
