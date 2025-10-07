import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

async function getCommands() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const commandsPath = join(__dirname, 'commands');
  const dirents = await readdir(commandsPath, { withFileTypes: true });
  const commands = [];
  for (const d of dirents) {
    if (!d.isFile() || !d.name.endsWith('.js')) continue;
    const mod = await import('file://' + join(commandsPath, d.name));
    if (mod.default?.data) commands.push(mod.default.data.toJSON());
  }
  return commands;
}

async function main() {
  const commands = await getCommands();
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const appId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!appId) throw new Error('Missing DISCORD_CLIENT_ID');

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(appId, guildId), { body: commands });
    console.log(`Registered ${commands.length} guild command(s) to ${guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(appId), { body: commands });
    console.log(`Registered ${commands.length} global command(s)`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
