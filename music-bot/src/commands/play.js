import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { buildNowPlaying } from '../music/interactions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist')
    .addStringOption(o => o.setName('query').setDescription('URL or search query').setRequired(true)),
  async execute(interaction, music) {
    const member = interaction.member;
    const voice = member.voice?.channel;
    if (!voice) return interaction.reply({ content: 'Join a voice channel first.', ephemeral: true });

    await interaction.deferReply();
    const query = interaction.options.getString('query', true);
    const results = await music.resolve(query);
    if (!results.length) return interaction.editReply('No results found.');

    await music.connectTo(member.voice, interaction.channelId);
    await music.enqueue(interaction.guildId, results, interaction.user.id);

    const state = music.getState(interaction.guildId);
    const embed = buildNowPlaying(state);
    const { buildControls } = await import('../music/interactions.js');
    return interaction.editReply({ embeds: [embed], components: buildControls(state) });
  }
};
