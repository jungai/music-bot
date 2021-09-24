import "dotenv/config";
import { Client, Intents, MessageEmbed } from "discord.js";
import { raw as ytdl } from "youtube-dl-exec";
import ytdlNative from "ytdl-core";

import {
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} from "@discordjs/voice";

const state = {
  prefix: "!",
  voiceConnection: undefined,
  subscription: undefined,
};

function getPrefix() {
  return state.prefix;
}

function checkPrefix(command) {
  return command.startsWith(getPrefix());
}

function createVoiceConnection({ chId, guId, adapterCreator = undefined }) {
  state.voiceConnection = joinVoiceChannel({
    channelId: chId,
    guildId: guId,
    adapterCreator: adapterCreator,
  });

  return state.voiceConnection;
}

const player = createAudioPlayer();

function checkVoiceConnection() {
  return !!state.voiceConnection;
}

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

// When the client is ready, run this code (only once)
client.once("ready", async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  client.user.setStatus("online");
});

client.on("messageCreate", async (message) => {
  const [command, url] = message.content.split(" ");
  // check prefix
  if (!checkPrefix(command)) return;

  // check member is in voice channel ??
  if (!message.member.voice.channel) {
    message.channel.send(
      `${message.author} Join a voice channel and then try that again!`
    );

    return;
  }

  if (command === "!play") {
    const channel = message.member.voice.channel;

    if (!checkVoiceConnection()) {
      createVoiceConnection({
        chId: channel.id,
        guId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      await entersState(
        state.voiceConnection,
        VoiceConnectionStatus.Connecting
      );
    }

    const info = await ytdlNative.getInfo(url);

    const stream = ytdl(
      url,
      {
        o: "-",
        q: "",
        f: "bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio",
        r: "100K",
      },
      { stdio: ["ignore", "pipe", "ignore"] }
    );

    const resource = createAudioResource(stream.stdout, {
      inputType: StreamType.Arbitrary,
    });

    const emb = new MessageEmbed()
      .setTitle(`🎵 Playing`)
      .setThumbnail(
        "https://media1.giphy.com/media/lqSDx8SI1916ysr4eq/giphy.gif?cid=ecf05e47k7iw9sl5jco6l83l9sexhny315kbxgrnn3thjoup&rid=giphy.gif&ct=g"
      )
      .setColor("#2ecc71")
      .addFields(
        { name: "Song", value: info.videoDetails.title },
        { name: "Request By", value: `${message.author}` }
      )
      .setTimestamp();

    message.channel.send({ embeds: [emb] });

    player.play(resource);
    state.subscription = state.voiceConnection.subscribe(player);

    player.on("error", (err) => {
      console.log("on error", err);
      state.subscription.unsubscribe();
    });

    player.on(AudioPlayerStatus.Idle, () => {
      state.subscription.unsubscribe();
    });

    return;
  }

  if (command === "!stop") {
    player.stop();
    state.subscription.unsubscribe();

    return;
  }

  if (command === "!bye") {
    player.stop();
    state.subscription.unsubscribe();
    state.voiceConnection.destroy();
    state.voiceConnection = undefined;

    return;
  }
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);
