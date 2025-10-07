import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Events, StringSelectMenuBuilder } from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';

export function buildControls(state) {
  const isPaused = state.player.state.status === AudioPlayerStatus.Paused;
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('mp_prev').setLabel('⏮️').setStyle(ButtonStyle.Secondary).setDisabled(true),
    new ButtonBuilder().setCustomId('mp_pause').setLabel(isPaused ? '▶️' : '⏸️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mp_skip').setLabel('⏭️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('mp_stop').setLabel('⏹️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('mp_shuffle').setLabel('🔀').setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('mp_loop')
      .setPlaceholder('Loop: ' + state.loop)
      .addOptions(
        { label: 'Off', value: 'off' },
        { label: 'Track', value: 'track' },
        { label: 'Queue', value: 'queue' }
      )
  );
  return [row1, row2];
}

export function registerInteractionHandlers(client, music) {
  client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try { await command.execute(interaction, music); } catch (e) { console.error(e); }
      return;
    }

    if (interaction.isButton()) {
      const guildId = interaction.guildId;
      const state = music.getState(guildId);
      const ctrl = music.controls(guildId);
      switch (interaction.customId) {
        case 'mp_pause':
          state.player.state.status === AudioPlayerStatus.Paused ? ctrl.resume() : ctrl.pause();
          break;
        case 'mp_skip':
          ctrl.skip();
          break;
        case 'mp_stop':
          ctrl.stop();
          break;
        case 'mp_shuffle':
          ctrl.shuffle();
          break;
      }
      const embed = buildNowPlaying(state);
      return interaction.update({ embeds: [embed], components: buildControls(state) });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'mp_loop') {
      const guildId = interaction.guildId;
      const mode = interaction.values?.[0] ?? 'off';
      const ctrl = music.controls(guildId);
      ctrl.setLoop(mode);
      const state = music.getState(guildId);
      const embed = buildNowPlaying(state);
      return interaction.update({ embeds: [embed], components: buildControls(state) });
    }
  });
}

export function buildNowPlaying(state) {
  const np = state.nowPlaying;
  const embed = new EmbedBuilder().setColor(0x5865F2);
  if (!np) {
    embed.setTitle('Nothing playing');
    return embed;
  }
  const vd = np.info.video_details;
  embed.setTitle(vd.title).setURL(vd.url);
  if (vd.thumbnails?.length) embed.setThumbnail(vd.thumbnails.at(-1).url);
  embed.setDescription(`Requested by <@${np.requester}>`);
  return embed;
}
