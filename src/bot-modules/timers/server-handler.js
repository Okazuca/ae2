/**
 * Server Handler: Timers
 */

'use strict';

const Path = require('path');
const Text = Tools('text');
const Template = Tools('html-template');

const mainTemplate = new Template(Path.resolve(__dirname, 'template.html'));

exports.setup = function (App) {
	/* Permissions */
	App.server.setPermission('timers', 'Permission for accesing timers/repeats');

	/* Menu Options */
	App.server.setMenuOption('timers', 'Timers', '/timers/', 'timers', -2);

	/* Handlers */
	App.server.setHandler('timers', (context, parts) => {
		if (!context.user || !context.user.can('timers')) {
			context.endWith403();
			return;
		}

		const Mod = App.modules.timers.system;

		let ok = null, error = null;
		if (context.post.cleartimer) {
			let room = Text.toRoomid(context.post.room);
			Mod.stopTimer(room);
			App.logServerAction(context.user.id, "Clear timer: " + room);
			ok = "Timer cleared.";
		} else if (context.post.clearrepeat) {
			let room = Text.toRoomid(context.post.room);
			let ri = parseInt(context.post.ri);
			Mod.cancelRepeatIndex(room, ri);
			App.logServerAction(context.user.id, "Cancel repeat: " + room);
			ok = "Repeat canceled.";
		}

		let htmlVars = Object.create(null);

		htmlVars.timers = "";

		for (let timer of Object.values(Mod.timers)) {
			htmlVars.timers += '<tr><td class="bold">' + Text.escapeHTML(timer.room) +
				'</td><td>' + Text.escapeHTML(Mod.getDiff(timer)) +
				'</td><td><form action="" method="post" style="margin-block-end: 0;">' +
				'<input name="room" type="hidden" value="' + Text.escapeHTML(timer.room) + '" />' +
				'<input type="submit" name="cleartimer" value="Clear timer" />' +
				'</form></td></tr>';
		}

		htmlVars.repeats = "";

		for (let repeat of Object.values(Mod.repeats)) {
			if (repeat.active) {
				let i = 0;
				for (let activeRepeat of repeat.active) {
					htmlVars.repeats += '<tr><td class="bold">' + Text.escapeHTML(repeat.room) + '</td><td>' +
						Text.escapeHTML(Mod.getRepeatTime(activeRepeat.interval, repeat.room)) + '</td><td>' +
						Text.escapeHTML(activeRepeat.text) +
						'</td><td><form action="" method="post" style="margin-block-end: 0;">' +
						'<input name="room" type="hidden" value="' + Text.escapeHTML(repeat.room) + '" />' +
						'<input name="ri" type="hidden" value="' + i + '" />' +
						'<input type="submit" name="clearrepeat" value="Cancel repeat" />' +
						'</form></td></tr>';
					i++;
				}
			}
		}

		htmlVars.request_result = (ok ? 'ok-msg' : (error ? 'error-msg' : ''));
		htmlVars.request_msg = (ok ? ok : (error || ""));

		context.endWithWebPage(mainTemplate.make(htmlVars), { title: "Timers and Repeats - Showdown ChatBot" });
	});
};
