function Sprite(img_file)
{
	var img = g_images[img_file];

	this.screen = null;
	this.x = 0;
	this.y = 0;
	this.w = img["w"];
	this.h = img["h"];
	this.frames = img["frames"];
	this.index = 0;
	this.animation = null;
	this.animation_index = 0;
}

Sprite.prototype.setUpdateNeeded = function(update_needed)
{
	if (this.screen != null)
	{
		this.screen.setUpdateNeeded(update_needed);
	}
}
Sprite.prototype.setPosition = function(x, y)
{
	var new_x = x - (this.w / 2);
	var new_y = y - (this.h / 2);
	var vec_x = new_x - this.x;
	var vec_y = new_y - this.y;
	x -= vec_x;
	y -= vec_y;

	this.x += vec_x;
	this.y += vec_y;
	this.setUpdateNeeded(true);
	return [x + vec_x, y + vec_y];
}

Sprite.prototype.draw = function(ctx)
{
	ctx.drawImage(this.getFrame(), this.x, this.y);
}

Sprite.prototype.setIndex = function(index)
{
	this.index = index;
	this.setUpdateNeeded(true);
}

Sprite.prototype.getFrame = function()
{
	var frame = this.frames[this.index][this.animation_index];
	return frame;
}

Sprite.prototype.update = function(timestamp)
{
	if (this.animation != null)
	{
		if (timestamp >= this.animation["next_ts"])
		{
			this.animation_index = this.animation["anim"][this.animation["index"]];
			this.animation["index"] += 1;
			if (this.animation["index"] >= this.animation["anim"].length)
			{
				this.animation["index"] = 0;
			}
			this.animation["next_ts"] = timestamp + this.animation["interval"];
			this.setUpdateNeeded(true);
		}
	}
}

Sprite.prototype.startAnimation = function(anim, interval)
{
	this.animation = {"anim" : anim, "index" : 0, "next_ts" : 0, "interval" : interval};
}

Sprite.prototype.setAnimationInterval = function(interval)
{
	if (this.animation)
	{
		this.animation["interval"] = interval;
	}
}

Sprite.prototype.stopAnimation = function()
{
	this.animation = null;
	this.animation_index = 0;
}

