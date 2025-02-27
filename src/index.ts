import DiscordClient from './client/DiscordClient';

const client = new DiscordClient();

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.log('Failed to connect to the Discord bot :', err);
  }
})();
