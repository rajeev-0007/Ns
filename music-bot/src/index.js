import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Events, Collection } from 'discord.js';
import { createMusicManager } from './music/manager.js';
import { registerInteractionHandlers } from './music/interactions.js';
import { loadCommands } from './util/commandLoader.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();
const music = createMusicManager(client);

await loadCommands(client);
registerInteractionHandlers(client, music);

client.once(Events.ClientReady, c => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
