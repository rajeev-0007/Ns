import { SlashCommandBuilder } from 'discord.js';
import { buildNowPlaying } from '../music/interactions.js';

export default {
  data: new SlashCommandBuilder().setName('resume').setDescription('Resume playback'),
  async execute(interaction, music) {
    const ctrl = music.controls(interaction.guildId);
    ctrl.resume();
    const state = music.getState(interaction.guildId);
    return interaction.reply({ embeds: [buildNowPlaying(state)], ephemeral: true });
  }
};
