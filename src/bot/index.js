import "dotenv/config";
import { Client, Intents } from "discord.js";
import {
	createAudioPlayer,
	joinVoiceChannel,
	entersState,
	VoiceConnectionStatus,
	AudioPlayerStatus,
} from "@discordjs/voice";
import { getToken } from "../utils/env/index.js";
import { Queue } from "../queue/index.js";
import { getAudio, getYtInfo } from "../yt/index.js";
import { playerEmb, queueEmb, helpEmb } from "../ui/index.js";

export class NonnMusic {
	constructor() {
		this.client = new Client({
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_VOICE_STATES,
			],
		});
		this.player = createAudioPlayer(); // when create player audio state is idle
		this.queue = new Queue();
	}

	login() {
		this.client.login(getToken());
	}

	async changeBotState(status) {
		if (!this.voice) {
			throw Error("no voice connection");
		}

		await entersState(this.voice, status);
	}

	async changeAudioState(state) {
		if (!this.player) {
			throw Error("no audio player");
		}

		this.player = await entersState(this.player, AudioPlayerStatus.Idle);
	}

	subscribe() {
		this.voice.subscribe(this.player);
	}

	unsubscribe() {
		if (!this.play) return;

		this.voice.subscribe(this.player).unsubscribe();
	}

	destroy() {
		if (!this.voice) return;

		this.voice.destroy();
		this.voice = undefined;
	}

	async start() {
		this.client.once("ready", (c) => {
			console.log(`Ready! Logged in as ${c.user.tag}`);
			this.client.user.setStatus("online");
			this.client.user.setActivity("!help | Hometown Cha-Cha-Cha", {
				type: "WATCHING",
			});
		});

		this.client.on("messageCreate", async (msg) => {
			const channel = msg.member.voice.channel;
			const [command, url] = msg.content.split(" ");

			// TODO: custom prefix
			if (!command.startsWith("!")) return;

			// check member is in voice channel ??
			if (!msg.member.voice.channel) {
				msg.channel.send(
					`${msg.author} Join a voice channel and then try that again!`
				);

				return;
			}

			if (command === "!help") {
				msg.channel.send({ embeds: [helpEmb()] });
				return;
			}

			if (command === "!play") {
				if (!this.voice) {
					this.voice = joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator,
					});

					await this.changeBotState(VoiceConnectionStatus.Connecting);
				}

				// if player is playable meanwhile queue is empty btw
				try {
					if (!this.player.checkPlayable() || this.queue.isEmpty()) {
						const ytInfo = await getYtInfo(url);
						this.queue.enqueue({
							url,
							author: msg.author,
							song: ytInfo.videoDetails.title,
						});
						this.player.play(getAudio(url));
						this.subscribe();

						await msg.channel.send({
							embeds: [playerEmb(ytInfo.videoDetails.title, `${msg.author}`)],
						});

						return;
					} else {
						const ytInfo = await getYtInfo(url);
						this.queue.enqueue({
							url,
							author: msg.author,
							song: ytInfo.videoDetails.title,
						});
						await msg.channel.send(
							`**add** ${ytInfo.videoDetails.title}(**request by** ${msg.author})  to queue`
						);
					}
				} catch (error) {
					msg.channel.send(`❌ ${error.message}`);
				}

				this.player.once(AudioPlayerStatus.Idle, async () => {
					this.queue.dequeue();
					if (!this.queue.isEmpty()) {
						const next = this.queue.front();
						await msg.channel.send({
							embeds: [playerEmb(next.song, `${next.author}`)],
						});
						this.player.play(getAudio(next.url));
					} else {
						await msg.channel.send("🎵 queue is empty");
						this.unsubscribe();
					}
				});

				this.player.once("error", (err) => {
					console.log(`Error -> ${err.message}`);
				});
			}

			if (command === "!queue") {
				await msg.channel.send({ embeds: [queueEmb(this.queue.current())] });

				return;
			}

			if (command === "!clear") {
				this.queue.clear();
				this.unsubscribe();
				this.player.removeAllListeners();
				this.destroy();

				return;
			}

			if (command === "!skip") {
				this.player.stop();

				return;
			}
		});
	}
}
