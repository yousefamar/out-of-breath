OOB.EntityManager = function (scene) {
	this.scene = scene;

	this.tickQueue = new List();
	this.renderQueue = new List();
	this.tangibleList = new List();
};

OOB.EntityManager.prototype.add = function (entity) {
	('tick' in entity) && this.tickQueue.add(entity);
	('render' in entity) && this.renderQueue.add(entity);
	entity.radius && this.tangibleList.add(entity);
};

OOB.EntityManager.prototype.tick = function (delta) {
	for (var i = 0, size = this.tickQueue.size; i < size; i++) {
		var entity = this.tickQueue.poll();
		entity.tick(delta) && this.tickQueue.add(entity);
	}
};

OOB.EntityManager.prototype.render = function (ctx) {
	for (var i = 0, size = this.renderQueue.size; i < size; i++) {
		var entity = this.renderQueue.poll();
		entity.render(ctx) && this.renderQueue.add(entity);
	}
};


OOB.EntityManager.prototype.entityAt = function (x, y) {
	for (var node = this.tangibleList.head; node; node = node.next) {
		//if node.e.contains(x, y);
	}
};


OOB.Entity = function (scene, x, y, w, h) {
	this.scene = scene;
	this.x = x;
	this.y = y;
	this.w = w || 32;
	this.h = h || 32;
};

/*
OOB.Entity.prototype.tick = function(delta) {

};
*/

OOB.Entity.prototype.render = function(ctx) {
	if (OOB.DEBUG && this.radius) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.strokeStyle = 'red';
		ctx.stroke();
		ctx.restore();
	}
	if (this.sprite) {
		ctx.drawImage(this.sprite.sheet, this.sprite.x, this.sprite.y, this.sprite.w, this.sprite.h, this.x-(this.w>>1), this.y-(this.h>>1), this.w, this.h);
		return true;
	}
	return false;
};

OOB.Entity.prototype.collidesWith = function(x, y, r) {
	if (!('radius' in this))
		return false;

	var xd = Math.abs(this.x - x);
	var yd = Math.abs(this.y - y);
	var rs = this.radius + r;
	if (xd >= rs || yd >= rs)
		return false;

	return xd*xd + yd*yd < rs*rs;
};


OOB.Terrain = function (scene, map) {
	OOB.Entity.call(this, scene);

	this.map = map;
	this.tiles = [];
	for (var x = 0, cols = map.width; x < cols; x++) {
		this.tiles[x] = [];
		for (var y = 0, rows = map.height; y < rows; y++) {
			var pixel = map.getPixel(x, y);

			if ((pixel[0] === 255 && pixel[1] === 255 && pixel[2] === 0)) {
				this.tiles[x][y] = 1;
				this.chestCoords = { x: x*this.tileSize, y: y*this.tileSize };
			} else {
				/*
				 * Tile IDs:
				 * 0: Air
				 * 1: Earth
				 * 2: Water
				 *
				 */
				this.tiles[x][y] = (pixel[3] === 0)?0:
						(pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0)?1:
						(pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 255)?2:
						0;
			}
		}
	}

	this.seaLevel = map.height;
	seaLevelSearch:
	for (var y = 0, rows = map.height; y < rows; y++) {
		for (var x = 0, cols = map.width; x < cols; x++) {
			if (this.tiles[x][y] === 2) {
				this.seaLevel = y;
				break seaLevelSearch;
			}
		}
	}

	/*
	for (var x = 0, cols = map.width; x < cols; x++) {
		this.tiles[x] = [];
		for (var y = 0, rows = map.height; y < rows; y++) {
			var pixel = map.getPixel(x, y);
			this.tiles = (pixel[0] === 255 && pixel[1] === 255 && pixel[2] === 255 && pixel[3] === 255);
		}
	}
	*/
};

OOB.Terrain.prototype = Object.create(OOB.Entity.prototype);

OOB.Terrain.prototype.tileSize = 8;

OOB.Terrain.prototype.tileAt = function (x, y) {
	x = (x/this.tileSize)>>0;
	y = (y/this.tileSize)>>0;
	return this.tiles[x][y];
};

OOB.Terrain.prototype.colAt = function (x, y) {
	x = (x/this.tileSize)>>0;
	y = (y/this.tileSize)>>0;
	return this.colMap[x][y];
};

/*
OOB.Terrain.prototype.tick = function (delta) {

};
*/

OOB.Terrain.prototype.render = function (ctx) {
	ctx.save();
	// NOTE: Canvas dimensions hardcoded here.
	var viewportLeft = (this.scene.camera.x/this.tileSize)>>0;
	var viewportRight = ((this.scene.camera.x+800+this.tileSize)/this.tileSize)>>0;
	var viewportTop = (this.scene.camera.y/this.tileSize)>>0;
	var viewportBottom = ((this.scene.camera.y+450+this.tileSize)/this.tileSize)>>0;
	for (var x = Math.max(viewportLeft, 0), cols = Math.min(viewportRight, this.tiles.length); x < cols; x++) {
		for (var y = Math.max(viewportTop, 0), rows = Math.min(viewportBottom, this.tiles[x].length); y < rows; y++) {			
			switch (this.tiles[x][y]) {
			/* Earth */
			case 1:
				ctx.fillStyle = '#3E2A08';
				break;
			/* Water */
			case 2:
				ctx.fillStyle = '#140080';
				break;
			/* Air */
			default:
				ctx.fillStyle = y<this.seaLevel?'#CBE9FF':'#553500';
				break;
			}
			ctx.fillRect(x*this.tileSize, y*this.tileSize, this.tileSize+1, this.tileSize+1);
		}
	}
	ctx.restore();
	return true;
};


OOB.Player = function (scene, x, y) {
	OOB.Entity.call(this, scene, x, y);

	this.spawnPosX = x;
	this.spawnPosY = y;

	this.radius = 16;

	this.keys = {
		w: false,
		a: false,
		s: false,
		d: false
	};

	this.animFrame = 1;
	this.animTimer = 0;

	this.breath = 10;
	this.breathTimer = 0;
};

OOB.Player.prototype = Object.create(OOB.Entity.prototype);

OOB.Player.prototype.respawn = function() {
	this.keys.w = false;
	this.keys.a = false;
	this.keys.s = false;
	this.keys.d = false;

	this.x = this.spawnPosX;
	this.y = this.spawnPosY;

	this.animFrame = 1;
	this.animTimer = 0;

	this.breath = 10;
	this.breathTimer = 0;
};

OOB.Player.prototype.tick = function(delta) {
	var dir = 4;
	var swimSpeed = 4; // Pixels per tick.
	if (this.keys.w) {
		dir -= 3;
		this.y -= swimSpeed;
	}
	if (this.keys.a) {
		dir--;
		this.x -= swimSpeed;
	}
	if (this.keys.s) {
		dir += 3;
		this.y += swimSpeed;
	}
	if (this.keys.d) {
		dir++;
		this.x += swimSpeed;
	}

	var terrain = this.scene.terrain;
	
	while (terrain.tileAt(this.x, this.y) !== 2) {
		this.y++;
		if (terrain.tileAt(this.x, this.y + this.radius) === 1 || terrain.tileAt(this.x, this.y + this.radius) === undefined) {
			// TODO: Respawn.
			//console.log('Stranded!');
			break;
		}
	}

	// TODO: Tile types as constant variables.
	while (terrain.tileAt(this.x + this.radius, this.y) === 1) this.x--;
	while (terrain.tileAt(this.x - this.radius, this.y) === 1) this.x++;
	while (terrain.tileAt(this.x, this.y + this.radius) === 1) this.y--;
	while (terrain.tileAt(this.x, this.y - this.radius) === 1) this.y++;
	// TODO: Scale to a spherical shape.
	while (terrain.tileAt(this.x - this.radius, this.y - this.radius) === 1) {
		this.x++;
		this.y++;
	}
	while (terrain.tileAt(this.x + this.radius, this.y - this.radius) === 1) {
		this.x--;
		this.y++;
	}
	while (terrain.tileAt(this.x - this.radius, this.y + this.radius) === 1) {
		this.x++;
		this.y--;
	}
	while (terrain.tileAt(this.x + this.radius, this.y + this.radius) === 1) {
		this.x--;
		this.y--;
	}

	this.animTimer += delta * (dir!==4?8:1);
	if (this.animTimer >= 1000) {
		this.animFrame = ((this.animFrame+1)%3)>>0;
		this.animTimer = this.animTimer%1000;
	}

	if (terrain.tileAt(this.x, this.y - this.radius) === 0) {
		this.breath = 10;
		this.breathTimer = 0;
	} else {
		this.breathTimer += delta;
		if (this.breathTimer >= 1000) {
			if(--this.breath <= 0)
				this.respawn();
			this.breathTimer = this.breathTimer%1000;
		}
	}

	this.sprite = OOB.Player.prototype.sprites[dir][this.animFrame];

	return true;
};


OOB.SeaWeed = function (scene, x, y) {
	OOB.Entity.call(this, scene, x, y, 64, 64);

	this.animFrame = ((Math.random()*4)>>0)%4;
	this.animTimer = 0;

	this.bubbleTimer = ((Math.random()*10000)>>0)%10000;
};

OOB.SeaWeed.prototype = Object.create(OOB.Entity.prototype);

OOB.SeaWeed.prototype.tick = function(delta) {
	this.animTimer += delta;
	if (this.animTimer >= 1000) {
		this.animFrame = ((this.animFrame+1)%4)>>0;
		this.animTimer = this.animTimer%1000;
	}

	this.bubbleTimer += delta;
	if (this.bubbleTimer >= 10000) {
		this.scene.add(new OOB.Bubble(this.scene, this.x, this.y));
		this.bubbleTimer = this.bubbleTimer%10000;
	}

	this.sprite = OOB.SeaWeed.prototype.sprites[this.animFrame];

	return true;
};

OOB.Bubble = function (scene, x, y) {
	OOB.Entity.call(this, scene, x, y, 32, 32);

	this.radius = 16;

	this.animFrame = ((Math.random()*4)>>0)%4;
	this.animTimer = 0;
};

OOB.Bubble.prototype = Object.create(OOB.Entity.prototype);

OOB.Bubble.prototype.tick = function(delta) {
	this.y--;

	var player = this.scene.player;
	if (this.collidesWith(player.x, player.y, player.radius)) {
		player.breath = 10;
		player.breathTimer = 0;
		this.sprite = null;
		return false;
	}

	if (this.scene.terrain.tileAt(this.x, this.y - this.radius) !== 2) {
		this.sprite = null;
		return false;
	}

	this.animTimer += delta;
	if (this.animTimer >= 200) {
		this.animFrame = ((this.animFrame+1)%4)>>0;
		this.animTimer = this.animTimer%200;
	}

	this.sprite = OOB.Bubble.prototype.sprites[this.animFrame];

	return true;
};

OOB.Chest = function (scene, x, y) {
	OOB.Entity.call(this, scene, x, y, 64, 64);

	this.radius = 32;
};

OOB.Chest.prototype = Object.create(OOB.Entity.prototype);

OOB.Chest.prototype.tick = function(delta) {
	var player = this.scene.player;
	if (this.collidesWith(player.x, player.y, player.radius)) {
		this.scene.winFunc();
		return false;
	}
	return true;
};