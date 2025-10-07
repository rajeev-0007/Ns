import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle the queue'),
  async execute(interaction, music) {
    const ctrl = music.controls(interaction.guildId);
    ctrl.shuffle();
    return interaction.reply({ content: 'Queue shuffled.', ephemeral: true });
  }
};
