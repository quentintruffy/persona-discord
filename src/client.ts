import 'dotenv/config';
import DiscordClient from './client/discord-client';

const client = new DiscordClient();

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Erreur lors de la connexion au Discord =>', err);
    process.exit(1);
  }
})();
