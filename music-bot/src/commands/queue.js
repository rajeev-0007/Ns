import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('queue').setDescription('Show the queue'),
  async execute(interaction, music) {
    const state = music.getState(interaction.guildId);
    const embed = new EmbedBuilder().setTitle('Queue').setColor(0x5865F2);
    if (!state.queue.length && !state.nowPlaying) {
      embed.setDescription('Queue is empty.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    if (state.nowPlaying) {
      embed.addFields({ name: 'Now Playing', value: state.nowPlaying.info.video_details.title });
    }
    const list = state.queue.slice(0, 10).map((q, i) => `${i + 1}. ${q.info.video_details.title}`).join('\n');
    if (list) embed.addFields({ name: 'Up Next', value: list });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
