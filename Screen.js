function Screen(ctx, background_file, w, h)
{
	this.need_update = false;
	this.looping = false;
	this.w = w;
	this.h = h;
	this.ctx = ctx;
	this.items = []

	this.background = document.createElement("canvas").getContext("2d");
	this.background.canvas.width = this.w;
	this.background.canvas.height = this.h;
	var sprite = new Sprite(background_file);
	sprite.setIndex(19); //TODO variable
	var nb_frames = sprite.frames[sprite.index].length;
	for (var y = 0; y < this.h; y += sprite.h)
	{
		for (var x = 0; x < this.w; x += sprite.w)
		{
			sprite.x = x;
			sprite.y = y;
			sprite.animation_index = Math.floor((Math.random() * nb_frames));
			sprite.draw(this.background);
			sprite.draw(this.ctx);
		}
	}
}

Screen.prototype.addItem = function(item)
{
	item.sprite.screen = this;
	this.items.push(item);
	this.setUpdateNeeded(true);
}

Screen.prototype.setUpdateNeeded = function(need_update)
{
	this.need_update = need_update;
}

Screen.prototype.draw = function(timestamp)
{
	for (var i in this.items)
	{
		var item = this.items[i];
		item.update(timestamp);
	}
	if (this.need_update)
	{
		this.ctx.drawImage(this.background.canvas, 0, 0);
		for (var i in this.items)
		{
			var item = this.items[i];
			item.sprite.draw(this.ctx);
		}
		this.need_update = false
	}
}

Screen.prototype.loop = function(timestamp)
{
	this.draw(timestamp);
	if (this.looping)
	{
		window.requestAnimationFrame(this.loop.bind(this));
	}
}


