var TWO_PI = 2 * Math.PI;

function GraphicItem(x, y, img_file)
{
	this.x = x;
	this.y = y;
	this.sprite = new Sprite(img_file);
	this.sprite.setPosition(this.x, this.y);

	var img = g_images[img_file];
	this.selection_size = img["selection_size"];
	this.selected = false;
}

GraphicItem.prototype.update = function(timestamp)
{
	this.sprite.update(timestamp);
}

GraphicItem.prototype.draw = function(ctx)
{
	if (this.selected)
	{
		ctx.beginPath();
		ctx.rect(this.x - this.selection_size, this.y - this.selection_size, this.selection_size * 2, this.selection_size * 2);
		//ctx.arc(this.x, this.y, this.selection_size, 0, TWO_PI);
		ctx.strokeStyle="#00FF00"; //TODO var
		ctx.closePath();
		ctx.stroke();
	}
	this.sprite.draw(ctx);
}

GraphicItem.prototype.contains = function(x, y)
{
	var left = this.x - this.selection_size;
	var right = this.x + this.selection_size;
	var up = this.y - this.selection_size;
	var down = this.y + this.selection_size;

	var res = !(x < left || x > right || y < up || y > down);

	return res;
}

GraphicItem.prototype.containedIn = function(x1, y1, x2, y2)
{
	var left;
	var right;
	var up;
	var down;
	
	if (x1 < x2)
	{
		left = x1;
		right = x2;
	}
	else
	{
		left = x2;
		right = x1;
	}

	if (y1 < y2)
	{
		up = y1;
		down = y2;
	}
	else
	{
		up = y2;
		down = y1;
	}

	var m_left = this.x - this.selection_size;
	var m_right = this.x + this.selection_size;
	var m_up = this.y - this.selection_size;
	var m_down = this.y + this.selection_size;

	var res = !(m_right < left || m_left > right || m_down < up || m_up > down);

	return res;
}

GraphicItem.prototype.select = function(selected)
{
	if (selected != this.selected)
	{
		this.selected = selected;
		this.sprite.setUpdateNeeded(true);
	}
}
