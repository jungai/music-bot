import { NonnMusic } from "./src/bot/index.js";

(() => {
	const bot = new NonnMusic();

	bot.login();
	bot.start();
})();
