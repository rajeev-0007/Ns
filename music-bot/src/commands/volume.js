import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set playback volume (0-200)')
    .addIntegerOption(o => o.setName('value').setDescription('Volume percent').setRequired(true)),
  async execute(interaction, music) {
    const value = interaction.options.getInteger('value', true);
    const ctrl = music.controls(interaction.guildId);
    ctrl.setVolume(value / 100);
    return interaction.reply({ content: `Volume set to ${value}%`, ephemeral: true });
  }
};
