var BufferedImage = function (image) {
	var canvas = document.createElement('canvas');
	this.width = canvas.width = image.width;
	this.height = canvas.height = image.height;
	canvas.getContext('2d').drawImage(image, 0, 0);
	this.imageData = canvas.getContext('2d').getImageData(0, 0, image.width, image.height);
};

BufferedImage.prototype.getPixel = function(x, y) {
	var index = (x + y * this.imageData.width) * 4;
	return Array.prototype.slice.call(this.imageData.data, index, index+4);
};

BufferedImage.prototype.setPixel = function(x, y, r, g, b, a) {
	var index = (x + y * this.imageData.width) * 4;
	this.imageData.data[index] = r;
	this.imageData.data[index+1] = g;
	this.imageData.data[index+2] = b;
	this.imageData.data[index+3] = a;
};


var GUIElement = function (x, y, width, height, parent) {
	//TODO: Think this through and check. Consider a method of identifying guiScreens.
	this.x = x || 0;
	this.y = y || 0;
	// NOTE: Hardcoded canvas dimensions here.
	this.width = width || 800;
	this.height = height || 450;
	this.parent = parent || null;
	this.children = [];
	this.mouseOver = false;
};

GUIElement.prototype.mouseDown = function (x, y, event) {
	for (var i = this.children.length - 1; i >= 0; i--) {
		var child = this.children[i];
		if(child.mouseOver)
			return child.mouseDown(x-this.x, y-this.y, event);
	}
	return false;
};

GUIElement.prototype.mouseMove = function (x, y) {
	this.mouseOver = this.contains(x, y);
	for (var i = 0, len = this.children.length; i < len; i++)
		this.children[i].mouseMove(x-this.x, y-this.y);
};

GUIElement.prototype.mouseUp = function (x, y, event) {
	for (var i = this.children.length - 1; i >= 0; i--) {
		var child = this.children[i];
		if(child.mouseOver)
			return child.mouseUp(x-this.x, y-this.y, event);
	}
	return false;
};

GUIElement.prototype.keyDown = function (code) {
	for (var i = this.children.length - 1; i >= 0; i--) {
		var child = this.children[i];
		if (child.keyDown(code))
			return true;
	}
	return false;
};

GUIElement.prototype.keyUp = function (code) {
	for (var i = this.children.length - 1; i >= 0; i--) {
		var child = this.children[i];
		if (child.keyUp(code))
			return true;
	}
	return false;
};
	
GUIElement.prototype.elementClicked = function (element) {}; // TODO: Make parent pass handling methods for other events too.

GUIElement.prototype.contains = function (x, y) {
	// TODO: Check accuracy.
	return (x >= this.x && x <= (this.x + this.width) && y >= this.y && y <= (this.y + this.height));
};

GUIElement.prototype.render = function (ctx) {
	for (var i = 0, len = this.children.length; i < len; i++) {
		var child = this.children[i];
		ctx.save();
		ctx.translate(child.x, child.y);
		child.render(ctx);
		ctx.restore();
	}
}