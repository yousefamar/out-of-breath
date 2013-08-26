OOB.Scene = function() {
	this.entityManager = new OOB.EntityManager(this);
};

OOB.Scene.prototype.add = function (entity) {
	this.entityManager.add(entity);
};

OOB.Scene.prototype.mouseDown = function (x, y, event) {
};

OOB.Scene.prototype.mouseMove = function (x, y) {
};

OOB.Scene.prototype.mouseUp = function (x, y, event) {
};

OOB.Scene.prototype.keyDown = function (code) {
};

OOB.Scene.prototype.keyUp = function (code) {
};

OOB.Scene.prototype.tick = function (delta) {
	this.entityManager.tick(delta);
};

OOB.Scene.prototype.render = function (ctx) {
	this.entityManager.render(ctx);
};

OOB.SceneMap = function(map, winFunc) {
	OOB.Scene.call(this);

	this.winFunc = winFunc;

	this.camera = {
		// NOTE: Hardcoded canvas dimensions here.
		x: 3600,
		y: 0,
		// NOTE: Hardcoded canvas dimensions here.
		limitX: OOB.Terrain.prototype.tileSize * map.width - 800,
		limitY: OOB.Terrain.prototype.tileSize * map.height - 450,
		moveTowards: function (entity, speed) {
			speed = speed || 0.05;
			// NOTE: Hardcoded canvas dimensions here.
			this.x += speed * (entity.x-400-this.x);
			this.y += speed * (entity.y-225-this.y);
			if (this.x < 0) this.x = 0;
			if (this.x > this.limitX) this.x = this.limitX;
			if (this.y < 0) this.y = 0;
			if (this.y > this.limitY) this.y = this.limitY;
		},
		applyTransform: function (ctx) {
			ctx.translate(-this.x, -this.y);
		}
	};

	this.add(this.terrain = new OOB.Terrain(this, map));
	// NOTE: Hardcoded canvas dimensions here.
	this.add(this.player = new OOB.Player(this, 4000, 0));

	// TODO: Make number of plants relative to the size of the map.
	for (var i = 0, weedCount = 500; i < weedCount; i++) {
		var randX = (Math.random()*this.terrain.tileSize*map.width)>>0, randY = (Math.random()*this.terrain.tileSize*map.height)>>0;
		while (this.terrain.tileAt(randX, randY + 31) === 1) {
			randY--;
			if (randY-32 < 0) {
				weedCount++;
				break;
			}
			if (this.terrain.tileAt(randX, randY + 31) === 2 && this.terrain.tileAt(randX, randY - 32) === 2) {
				this.add(new OOB.SeaWeed(this, randX, randY));
				break;
			}
		}
	}

	if ('chestCoords' in this.terrain)
		this.add(new OOB.Chest(this, this.terrain.chestCoords.x, this.terrain.chestCoords.y));
};

OOB.SceneMap.prototype = Object.create(OOB.Scene.prototype);
OOB.SceneMap.prototype.superClass = OOB.Scene.prototype;

OOB.SceneMap.prototype.keyDown = function (code) {
	if (code === 65 || code === 37)
		this.player.keys.a = true;
	else if (code === 68 || code === 39)
		this.player.keys.d = true;
	else if (code === 87 || code === 38)
		this.player.keys.w = true;
	else if (code === 83 || code === 40)
		this.player.keys.s = true;
};

OOB.SceneMap.prototype.keyUp = function (code) {
	if (code === 65 || code === 37)
		this.player.keys.a = false;
	else if (code === 68 || code === 39)
		this.player.keys.d = false;
	else if (code === 87 || code === 38)
		this.player.keys.w = false;
	else if (code === 83 || code === 40)
		this.player.keys.s = false;
};

OOB.SceneMap.prototype.tick = function (delta) {
	this.superClass.tick.call(this, delta);

	this.camera.moveTowards(this.player);
};

OOB.SceneMap.prototype.render = function (ctx) {
	ctx.save();

	this.camera.applyTransform(ctx);

	this.superClass.render.call(this, ctx);

	ctx.restore();
};