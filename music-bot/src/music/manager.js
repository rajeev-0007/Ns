import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, entersState, demuxProbe } from '@discordjs/voice';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import play from 'play-dl';

function createGuildState() {
  return {
    connection: null,
    player: createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } }),
    queue: [],
    volume: 0.5,
    nowPlaying: null,
    textChannelId: null,
    loop: 'off' // off | track | queue
  };
}

async function createResource(stream, type) {
  const probe = await demuxProbe(stream.stream ?? stream);
  return createAudioResource(probe.stream, {
    inputType: probe.type,
    inlineVolume: true
  });
}

export function createMusicManager(client) {
  const states = new Map();

  function getState(guildId) {
    if (!states.has(guildId)) states.set(guildId, createGuildState());
    return states.get(guildId);
  }

  async function connectTo(voiceState, textChannelId) {
    const state = getState(voiceState.guild.id);
    const connection = joinVoiceChannel({
      channelId: voiceState.channel.id,
      guildId: voiceState.guild.id,
      adapterCreator: voiceState.guild.voiceAdapterCreator,
      selfDeaf: true
    });
    state.textChannelId = textChannelId;
    state.connection = connection;
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        connection.destroy();
        state.connection = null;
      }
    });
    return connection;
  }

  async function resolve(query) {
    if (play.yt_validate(query) === 'video' || play.sp_validate(query) === 'track') {
      return [await play.video_info(query)];
    }
    if (play.yt_validate(query) === 'playlist') {
      const plist = await play.playlist_info(query, { incomplete: true });
      await plist.fetch();
      return plist.videos.map(v => ({ video_details: v }));
    }
    const res = await play.search(query, { limit: 1, source: { youtube: 'video' } });
    if (!res.length) return [];
    const info = await play.video_info(res[0].url);
    return [info];
  }

  async function enqueue(guildId, entries, requester) {
    const state = getState(guildId);
    for (const info of entries) {
      state.queue.push({ info, requester });
    }
    if (!state.nowPlaying) await playNext(guildId);
    return state;
  }

  async function playNext(guildId) {
    const state = getState(guildId);
    const next = state.queue.shift();
    if (!next) {
      state.nowPlaying = null;
      return;
    }
    const stream = await play.stream(next.info.video_details.url, { quality: 2 });
    const resource = await createResource(stream, stream.type);
    resource.volume?.setVolume(state.volume);
    state.player.play(resource);
    state.nowPlaying = next;
    const connection = state.connection;
    if (connection && connection.state.subscription == null) {
      connection.subscribe(state.player);
    }

    state.player.once(AudioPlayerStatus.Idle, () => {
      if (state.loop === 'track' && state.nowPlaying) {
        state.queue.unshift(state.nowPlaying);
      } else if (state.loop === 'queue' && state.nowPlaying) {
        state.queue.push(state.nowPlaying);
      }
      state.nowPlaying = null;
      playNext(guildId).catch(() => {});
    });
  }

  function controls(guildId) {
    const state = getState(guildId);
    return {
      pause: () => state.player.pause(true),
      resume: () => state.player.unpause(),
      skip: () => state.player.stop(true),
      stop: () => {
        state.queue = [];
        state.player.stop(true);
      },
      setVolume: (v) => {
        state.volume = Math.max(0, Math.min(2, v));
        state.player.state.resource?.volume?.setVolume(state.volume);
      },
      shuffle: () => {
        for (let i = state.queue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]];
        }
      },
      setLoop: (mode) => { state.loop = mode; },
      getState: () => state,
      ensureConnected: connectTo
    };
  }

  return { getState, connectTo, resolve, enqueue, playNext, controls };
}
