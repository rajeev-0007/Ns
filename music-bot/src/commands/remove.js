import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove an item from the queue')
    .addIntegerOption(o => o.setName('index').setDescription('Index in queue (1-based)').setRequired(true)),
  async execute(interaction, music) {
    const idx = interaction.options.getInteger('index', true) - 1;
    const state = music.getState(interaction.guildId);
    if (idx < 0 || idx >= state.queue.length) return interaction.reply({ content: 'Invalid index.', ephemeral: true });
    const [removed] = state.queue.splice(idx, 1);
    return interaction.reply({ content: `Removed: ${removed.info.video_details.title}`, ephemeral: true });
  }
};
