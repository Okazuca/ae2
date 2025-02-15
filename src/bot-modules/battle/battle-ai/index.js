/**
 * Battle manager
 */

'use strict';

const Text = Tools('text');
const Path = require('path');

exports.setup = function (App) {
	const CustomModules = Object.create(null);

	const Battle = require(Path.resolve(__dirname, 'battle.js')).setup(App, CustomModules);

	App.bot.on("line", (room, line, spl, isIntro) => {
		if (spl[0] === "updatesearch" && !App.config.modules.battle.ignoreAbandonedbattles) {
			let searchData = spl.slice(1);
			try {
				searchData = JSON.parse(searchData);
				if (searchData !== null && typeof searchData === "object" && searchData.games !== null && typeof searchData.games === "object") {
					App.bot.joinRooms(Object.keys(searchData.games));
				}
			} catch (err) {
				console.log("Error: " + err.message + "\n" + err.stack);
			}
		}
	});

	return {
		battles: {},
		battlesCount: 0,
		interval: null,
		customModules: CustomModules,

		init: function () {
			for (let room in this.battles) {
				try {
					this.battles[room].destroy();
				} catch (e) {}
				delete this.battles[room];
			}
			this.battlesCount = 0;

			if (this.interval) {
				clearInterval(this.interval);
				this.interval = null;
			}

			this.interval = setInterval(this.tick.bind(this), 3000);
		},

		tick: function () {
			for (let room in this.battles) {
				try {
					this.battles[room].tick();
				} catch (e) {}
			}
		},

		receive: function (room, data, isIntro) {
			if (data.charAt(0) === ">") return;
			let spl = data.substr(1).split("|");
			if (spl[0] === 'init') {
				if (this.battles[room]) {
					try {
						this.battles[room].destroy();
					} catch (e) {}
				}
				this.battles[room] = new Battle(room);
				this.battlesCount++;
			}
			if (this.battles[room]) {
				this.battles[room].add(data, isIntro);
			}
			if (spl[0] === 'deinit' || spl[0] === 'expire') {
				if (this.battles[room]) {
					try {
						this.battles[room].destroy();
					} catch (e) {}
					delete this.battles[room];
					this.battlesCount--;
				}
			} else if (spl[0] === 'noinit' && spl[1] === 'rename') {
				if (this.battles[room]) {
					const newID = Text.toRoomid(spl[2]);
					this.battles[newID] = this.battles[room];
					delete this.battles[room];

					this.battles[newID].id = newID;
					this.battles[newID].title = spl[3] || "";
				}
			}
		},

		addCustomModule: function (id, formats, setupFunc) {
			this.customModules[id] = {
				formats: formats,
				setupFunc: setupFunc,
				module: null,
			};
		},

		removeCustomModule: function (id) {
			delete this.customModules[id];
		},

		destroy: function () {
			for (let room in this.battles) {
				try {
					this.battles[room].destroy();
				} catch (e) {}
				delete this.battles[room];
				this.battlesCount--;
			}
			if (this.interval) {
				clearInterval(this.interval);
				this.interval = null;
			}
		},
	};
};
