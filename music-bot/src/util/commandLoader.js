import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function loadCommands(client) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const commandsPath = join(__dirname, '..', 'commands');
  let files = [];
  try {
    files = await readdir(commandsPath, { withFileTypes: true });
  } catch {
    return;
  }
  for (const dirent of files) {
    if (!dirent.isFile() || !dirent.name.endsWith('.js')) continue;
    const filePath = join(commandsPath, dirent.name);
    const mod = await import('file://' + filePath);
    const command = mod.default;
    if (!command?.data?.name || !command?.execute) continue;
    client.commands.set(command.data.name, command);
  }
}
