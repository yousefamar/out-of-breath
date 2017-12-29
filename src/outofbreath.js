var OOB = {
	DEBUG: false,

	main: function () {
		OOB.textures = { loadedCount: 0, total: 2 };

		function onTexLoad () {
			game.currentGUI = new OOB.GUIMainMenu(game);
		};

		OOB.textures.mapImg = new Image();
		OOB.textures.mapImg.src = 'res/textures/map.png';
		OOB.textures.mapImg.onload = function () {
			if (++OOB.textures.loadedCount >= OOB.textures.total)
				onTexLoad();
		};

		OOB.textures.spritesheet = new Image();
		OOB.textures.spritesheet.src = 'res/textures/spritesheet.png';
		OOB.textures.spritesheet.onload = function () {
			if (++OOB.textures.loadedCount >= OOB.textures.total)
				onTexLoad();
		};

		/*
		var audio = new Audio();
		audio.src = 'res/audio/deepwaters.ogg';
		audio.loop = true;
		document.body.appendChild(audio);
		audio.play();
		*/

		OOB.GUIMainMenu.prototype.titleImage = { sheet: OOB.textures.spritesheet, x: 0, y: 224, w: 512, h: 64 };

		OOB.Player.prototype.sprites = [
			[ { sheet: OOB.textures.spritesheet, x: 0, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 0, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 0, y: 64, w: 32, h: 32 } ],
			[ { sheet: OOB.textures.spritesheet, x: 32, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 32, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 32, y: 64, w: 32, h: 32 } ],
			[ { sheet: OOB.textures.spritesheet, x: 64, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 64, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 64, y: 64, w: 32, h: 32 } ],
			[ { sheet: OOB.textures.spritesheet, x: 96, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 96, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 96, y: 64, w: 32, h: 32 } ],
			[ { sheet: OOB.textures.spritesheet, x: 128, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 128, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 128, y: 64, w: 32, h: 32 } ],
			[ { sheet: OOB.textures.spritesheet, x: 160, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 160, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 160, y: 64, w: 32, h: 32 } ],
			[ { sheet: OOB.textures.spritesheet, x: 192, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 192, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 192, y: 64, w: 32, h: 32 } ],
			[ { sheet: OOB.textures.spritesheet, x: 224, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 224, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 224, y: 64, w: 32, h: 32 } ],
			[ { sheet: OOB.textures.spritesheet, x: 256, y: 0, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 256, y: 32, w: 32, h: 32 }, { sheet: OOB.textures.spritesheet, x: 256, y: 64, w: 32, h: 32 } ]
		];
		OOB.Player.prototype.sprite = OOB.Player.prototype.sprites[4][1];

		OOB.SeaWeed.prototype.sprites = [
			{ sheet: OOB.textures.spritesheet, x: 0, y: 96, w: 64, h: 64 },
			{ sheet: OOB.textures.spritesheet, x: 64, y: 96, w: 64, h: 64 },
			{ sheet: OOB.textures.spritesheet, x: 126, y: 96, w: 64, h: 64 },
			{ sheet: OOB.textures.spritesheet, x: 192, y: 96, w: 64, h: 64 }
		];
		OOB.SeaWeed.prototype.sprite = OOB.SeaWeed.prototype.sprites[0];

		OOB.Bubble.prototype.sprites = [
			{ sheet: OOB.textures.spritesheet, x: 0, y: 160, w: 32, h: 32 },
			{ sheet: OOB.textures.spritesheet, x: 32, y: 160, w: 32, h: 32 },
			{ sheet: OOB.textures.spritesheet, x: 64, y: 160, w: 32, h: 32 },
			{ sheet: OOB.textures.spritesheet, x: 96, y: 160, w: 32, h: 32 }
		];
		OOB.Bubble.prototype.sprite = OOB.Bubble.prototype.sprites[0];

		OOB.Chest.prototype.sprite = { sheet: OOB.textures.spritesheet, x: 128, y: 160, w: 64, h: 64 };


		var game = {};

		game.currentScene = new OOB.Scene();
		game.currentGUI = new OOB.GUIText('Loading...');

		var canvas = document.getElementById('canvas');

		if ((() => {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		})()) {
			canvas.style.marginTop = 0;
		}

		canvas.addEventListener('mousedown', function (event) {
			game.currentGUI.mouseDown(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event) ||
				game.currentScene.mouseDown(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event);
		}, false);
		canvas.addEventListener('mousemove', function (event) {
			game.currentGUI.mouseMove(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event) ||
				game.currentScene.mouseMove(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event);
		}, false);
		canvas.addEventListener('mouseup', function (event) {
			game.currentGUI.mouseUp(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event) ||
				game.currentScene.mouseUp(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event);
		}, false);
		document.body.addEventListener('keydown', function (event) {
			game.currentGUI.keyDown(event.keyCode) ||
				game.currentScene.keyDown(event.keyCode);
		});
		document.body.addEventListener('keyup', function (event) {
			game.currentGUI.keyUp(event.keyCode) ||
				game.currentScene.keyUp(event.keyCode);
		});


		const TICK_INTERVAL_MS = 1000.0/60.0;

		var lastTick = Date.now();
		function tick () {
			// FIXME: Chrome throttles the interval down to 1s on inactive tabs.
			setTimeout(tick, TICK_INTERVAL_MS);
			
			var now = Date.now();
			game.currentScene.tick(now - lastTick);
			lastTick = now;
		}

		var ctx = canvas.getContext('2d');
		ctx.font = '20pt Tahoma';

		function render () {
			requestAnimFrame(render);

			ctx.fillStyle = 'black';
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			game.currentScene.render(ctx);
			game.currentGUI.render(ctx);
		}

		setTimeout(tick, TICK_INTERVAL_MS);

		window.requestAnimFrame = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function(callback){
					window.setTimeout(callback, 1000/60);
				};
		requestAnimFrame(render);
	}
};
