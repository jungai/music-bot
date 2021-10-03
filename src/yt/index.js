import { createAudioResource, StreamType } from "@discordjs/voice";
import { raw as ytdl } from "youtube-dl-exec";
import ytdlNative from "ytdl-core";

export async function getYtInfo(url) {
	const info = await ytdlNative.getInfo(url);
	return info;
}

export function getAudio(url) {
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

	return resource;
}
