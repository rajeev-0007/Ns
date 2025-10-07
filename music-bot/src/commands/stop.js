import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop playback and clear queue'),
  async execute(interaction, music) {
    const ctrl = music.controls(interaction.guildId);
    ctrl.stop();
    return interaction.reply('Stopped and cleared the queue.');
  }
};
