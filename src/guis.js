OOB.GUIText = function (text) {
	GUIElement.call(this);
	var x = (this.width - 150)/2;

	this.lines = text.split('\n');
};

OOB.GUIText.prototype = Object.create(GUIElement.prototype);

OOB.GUIText.prototype.render = function (ctx) {
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#FFFFAA';
	ctx.font = '12pt Tahoma';
	for (var i = 0, len = this.lines.length; i < len; i++)
		ctx.fillText(this.lines[i], this.width/2, this.height/2-(len*25)/2+25*i);
	ctx.font = '20pt Tahoma';
};

OOB.GUIMainMenu = function (game) {
	GUIElement.call(this);

	this.game = game;

	var x = (this.width - 200)/2;
	this.children.push(new OOB.GUIButton(x, 200, 200, 40, this, 0, 'Play'));
	this.children.push(new OOB.GUIButton(x, 250, 200, 40, this, 1, 'Custom Map'));
	this.children.push(new OOB.GUIButton(x, 300, 200, 40, this, 2, 'About'));
};

OOB.GUIMainMenu.prototype = Object.create(GUIElement.prototype);

OOB.GUIMainMenu.prototype.elementClicked = function (element) {
	switch (element.id) {
	case 0:
		var game = this.game;
		game.currentScene = new OOB.SceneMap(new BufferedImage(OOB.textures.mapImg), function () {
			game.currentScene = new OOB.Scene();
			game.currentGUI = new OOB.GUIText('For it is my newfound reverence for time that will better my life, and not this gold.\nI shall leave it here for other wayfarers to share my wisdom.');
			setTimeout(function () {
				game.currentGUI = new OOB.GUIMainMenu(game);
			}, 10000);
		});
		game.currentGUI = new OOB.GUIBubbles(this.game.currentScene.player);
		break;
	case 1:
		window.alert('Custom maps are not yet implemented but they will be in the near future!\n\nIf you\'re clever you can load custom maps already by modifying the source code.\n\nHint: outofbreath.js, line 12.');
		break;
	case 2:
		window.open('http://www.ludumdare.com/compo/ludum-dare-27/?action=preview&uid=21239', '_blank');
		break;
	default:
		break;
	}
};

OOB.GUIMainMenu.prototype.render = function (ctx) {
	ctx.drawImage(this.titleImage.sheet, this.titleImage.x, this.titleImage.y, this.titleImage.w, this.titleImage.h, (this.width-512)/2, 64, 512, 64);

	GUIElement.prototype.render.call(this, ctx);

	ctx.textAlign = 'center';
	ctx.textBaseline = 'bottom';
	ctx.fillStyle = '#FFFFAA';
	ctx.font = '12pt Tahoma';
	ctx.fillText('But can the gold ever match an extra second in value?', this.width/2, this.height - 32);
	ctx.font = '20pt Tahoma';
};


OOB.GUIButton = function (x, y, width, height, parent, id, text) {
	GUIElement.call(this, x, y, width, height, parent);
	this.id = id;
	this.text = text;
};

OOB.GUIButton.prototype = Object.create(GUIElement.prototype);


OOB.GUIButton.prototype.mouseDown = function (button, x, y) {
	this.parent.elementClicked(this);
	return true;
};

OOB.GUIButton.prototype.render = function (ctx) {
	ctx.fillStyle = this.mouseOver?'#986714':'#3E2A08';
	ctx.fillRect(0, 0, this.width, this.height);

	ctx.strokeStyle = '#553500';
	ctx.strokeRect(0, 0, this.width, this.height);

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#CBE9FF';
	ctx.fillText(this.text, this.width/2, this.height/2);
};


OOB.GUIBubbles = function (player) {
	GUIElement.call(this);

	this.player = player;

	//this.children.push(new OOB.GUIMinimap(0, this.height-80, 99, 79, this, scene));
	//this.children.push(new OOB.GUIBuildBar(99, this.height-80, this.width-100, 79, this, scene));
};

OOB.GUIBubbles.prototype = Object.create(GUIElement.prototype);

OOB.GUIBubbles.prototype.render = function (ctx) {
	ctx.beginPath();
	ctx.globalAlpha = 0.8;
	ctx.arc(25, 25, 20, 0, 2*Math.PI);
	ctx.fillStyle = '#FFFFFF';
	ctx.fill();
	ctx.strokeStyle = '#000033';
	ctx.stroke();
	ctx.globalAlpha = 1;
	var sprite = OOB.Bubble.prototype.sprite;
	ctx.drawImage(sprite.sheet, sprite.x, sprite.y, sprite.w, sprite.h, 5, 5, 40, 40);

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = '#000000';
	ctx.fillText(this.player.breath, 25, 25);
};