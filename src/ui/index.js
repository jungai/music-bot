import { MessageEmbed } from "discord.js";
import { getYtInfo } from "../yt/index.js";

export function playerEmb(song, author) {
	return new MessageEmbed()
		.setTitle(`🎵 Playing`)
		.setThumbnail(
			"https://media1.giphy.com/media/lqSDx8SI1916ysr4eq/giphy.gif?cid=ecf05e47k7iw9sl5jco6l83l9sexhny315kbxgrnn3thjoup&rid=giphy.gif&ct=g"
		)
		.setColor("#2ecc71")
		.addFields(
			{ name: "**Song**", value: song },
			{ name: "**Request By**", value: author }
		)
		.setTimestamp();
}

export function queueEmb(queue) {
	return new MessageEmbed()
		.setTitle(`🎵 Queue`)
		.setThumbnail(
			"https://media1.giphy.com/media/lqSDx8SI1916ysr4eq/giphy.gif?cid=ecf05e47k7iw9sl5jco6l83l9sexhny315kbxgrnn3thjoup&rid=giphy.gif&ct=g"
		)
		.setColor("#2ecc71")
		.addFields([
			...queue.map((item, i) => ({
				name: "\u200B",
				value: `**${i === 0 ? "**Now:**" : i === 1 ? "**Next:**" : "🎵"}** ${
					item.song
				} (${item.author})`,
			})),
		])
		.setTimestamp();
}

export function helpEmb() {
	return new MessageEmbed()
		.setTitle(`Help`)
		.setThumbnail(
			"https://media1.giphy.com/media/lqSDx8SI1916ysr4eq/giphy.gif?cid=ecf05e47k7iw9sl5jco6l83l9sexhny315kbxgrnn3thjoup&rid=giphy.gif&ct=g"
		)
		.setColor("#2ecc71")
		.addFields([
			{
				name: "**!play <youtube full url>**",
				value:
					"play audio from url, you can stack your song by press !play <new url>",
			},
			{
				name: "**!queue**",
				value: "show all queue & current song",
			},
			{
				name: "**!skip**",
				value: "skip current song (play next song in queue)",
			},
			{
				name: "**!clear**",
				value: "clear everything (queue, connection)",
			},
			{
				name: "**Note**",
				value: `when use **!play** command (for queuing song) please wait until playing ui is showing`,
			},
		])
		.setTimestamp();
}
