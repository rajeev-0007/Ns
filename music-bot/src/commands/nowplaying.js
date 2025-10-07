import { SlashCommandBuilder } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';
import { buildNowPlaying, buildControls } from '../music/interactions.js';

export default {
  data: new SlashCommandBuilder().setName('nowplaying').setDescription('Show the current track and controls'),
  async execute(interaction, music) {
    const state = music.getState(interaction.guildId);
    const embed = buildNowPlaying(state);
    return interaction.reply({ embeds: [embed], components: buildControls(state) });
  }
};
