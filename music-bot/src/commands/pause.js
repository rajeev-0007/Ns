import { SlashCommandBuilder } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { buildNowPlaying } from '../music/interactions.js';

export default {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pause or resume playback'),
  async execute(interaction, music) {
    const state = music.getState(interaction.guildId);
    const ctrl = music.controls(interaction.guildId);
    if (state.player.state.status === AudioPlayerStatus.Paused) ctrl.resume(); else ctrl.pause();
    return interaction.reply({ embeds: [buildNowPlaying(state)], ephemeral: true });
  }
};
