import { SlashCommandBuilder } from 'discord.js';
import { buildNowPlaying } from '../music/interactions.js';

export default {
  data: new SlashCommandBuilder().setName('skip').setDescription('Skip the current track'),
  async execute(interaction, music) {
    const ctrl = music.controls(interaction.guildId);
    ctrl.skip();
    const state = music.getState(interaction.guildId);
    return interaction.reply({ embeds: [buildNowPlaying(state)] });
  }
};
