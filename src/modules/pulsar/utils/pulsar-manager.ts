import { Message, MessageFlags, User } from 'discord.js';
import DiscordClient from '../../../client/discord-client';
import { LaunchContainer } from '../containers/launch';

/**
 * Gestionnaire central pour la synchronisation des données entre Redis et Supabase
 */
export class PulsarManager {
  private readonly client: DiscordClient;

  constructor(client: DiscordClient) {
    this.client = client;
  }

  public async launchPulsarBan(
    client: DiscordClient,
    user: User,
    userId: string,
  ): Promise<Message<false> | null> {
    const sendContainer = await user.send({
      flags: MessageFlags.IsComponentsV2,
      components: [LaunchContainer({})],
    });
    if (!sendContainer) {
      return null;
    }
    return sendContainer;
  }
}
