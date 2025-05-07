import {
  Channel,
  ChannelType,
  ForumChannel,
  ForumThreadChannel,
  GuildForumThreadMessageCreateOptions,
  MediaChannel,
  Message,
  PrivateThreadChannel,
  PublicThreadChannel,
  TextChannel,
  ThreadAutoArchiveDuration,
} from 'discord.js';
import DiscordClient from '../../client/discord-client';

/**
 * Gestionnaire central pour la synchronisation des données entre Redis et Supabase
 */
export class ChannelManager {
  private readonly client: DiscordClient;
  private readonly guildId: string;
  private readonly channelId: string;
  private channel: Channel | null = null;

  constructor(client: DiscordClient, guildId: string, channelId: string) {
    this.client = client;
    this.guildId = guildId;
    this.channelId = channelId;
  }

  /**
   * Obtient le canal à partir de son ID dans la guilde spécifiée
   * Cette méthode est générique et peut retourner n'importe quel type de canal
   * @private
   */
  public async getChannel<T extends Channel = Channel>(): Promise<T> {
    if (this.channel) {
      return this.channel as T;
    }

    const guild = await this.client.guilds.fetch(this.guildId);
    if (!guild) {
      throw new Error(`Guilde avec l'ID ${this.guildId} non trouvée`);
    }

    const channel = await guild.channels.fetch(this.channelId);

    if (!channel) {
      throw new Error(
        `Canal avec l'ID ${this.channelId} non trouvé dans la guilde ${this.guildId}`,
      );
    }

    this.channel = channel;
    return this.channel as T;
  }

  /**
   * Vérifie si le canal est du type spécifié pour la création de thread
   * @private
   */
  private async getThreadSupportedChannel<
    T extends ThreadSupportedChannel,
  >(): Promise<T> {
    const channel = await this.getChannel();

    // Vérifier si le canal est d'un type supporté pour la création de thread
    if (
      !(
        channel.type === ChannelType.GuildText ||
        channel.type === ChannelType.GuildForum ||
        channel.type === ChannelType.GuildMedia
      )
    ) {
      throw new Error(
        `Ce canal ne supporte pas la création de threads. Type de canal: ${channel.type}`,
      );
    }

    return channel as T;
  }

  /**
   * Crée un nouveau thread dans le canal
   * Cette méthode est spécifiquement typée pour les canaux supportant les threads
   */
  // public async createThread<
  //   T extends ThreadSupportedChannel = ThreadSupportedChannel,
  // >(options: ThreadCreateOptions<T>): Promise<ThreadReturnType<T>> {
  //   const channel = await this.getThreadSupportedChannel<T>();
  //   const thread = await channel.threads.create(options);

  //   return thread as ThreadReturnType<T>;
  // }

  public async createThread<
    T extends ThreadSupportedChannel = ThreadSupportedChannel,
  >(options: ThreadCreateOptions<T>): Promise<ThreadReturnType<T>> {
    const channel = await this.getThreadSupportedChannel<T>();

    let thread;

    // Gérer les différents types de canaux
    if (channel.type === ChannelType.GuildText) {
      thread = await (channel as TextChannel).threads.create(
        options as ThreadCreateOptions<TextChannel>,
      );
    } else if (channel.type === ChannelType.GuildForum) {
      thread = await (channel as ForumChannel).threads.create(
        options as ThreadCreateOptions<ForumChannel>,
      );
    } else if (channel.type === ChannelType.GuildMedia) {
      thread = await (channel as MediaChannel).threads.create(
        options as ThreadCreateOptions<MediaChannel>,
      );
    } else {
      const channelTypeString = String((channel as any).type);
      throw new Error(`Type de canal non supporté: ${channelTypeString}`);
    }

    return thread as ThreadReturnType<T>;
  }

  /**
   * Obtient l'URL du thread
   */
  public async getURL(): Promise<string> {
    const channel = await this.getChannel();
    return channel.url;
  }
}

// Types spécifiques pour la création de thread
type ThreadSupportedChannel = TextChannel | ForumChannel | MediaChannel;

// Définition des types de retour en fonction du type de canal
type ThreadReturnType<T> = T extends TextChannel
  ? PublicThreadChannel<false> | PrivateThreadChannel
  : T extends ForumChannel
    ? ForumThreadChannel
    : T extends MediaChannel
      ? ForumThreadChannel
      : never;

// Définition des types d'options en fonction du type de canal
type ThreadCreateOptions<T> = T extends TextChannel
  ? {
      name: string;
      startMessage?: Message | string;
      invitable?: boolean;
      autoArchiveDuration?: ThreadAutoArchiveDuration;
      reason?: string;
      type?: ChannelType.PrivateThread | ChannelType.PublicThread;
      rateLimitPerUser?: number;
    }
  : T extends ForumChannel
    ? {
        name: string;
        message: GuildForumThreadMessageCreateOptions;
        // Options spécifiques aux ForumChannel
      }
    : T extends MediaChannel
      ? {
          name: string;
          message: { content: string };
          // Options spécifiques aux MediaChannel
        }
      : never;
