function Screen()
{
}

Screen.get = function()
{
	if (!arguments.callee.instance)
	{
		arguments.callee.instance = new Screen();
	}
	return arguments.callee.instance
}

Screen.prototype.init = function(ctx, w, h)
{
	this.need_update = false;
	this.looping = false;
	this.w = w;
	this.h = h;
	this.ctx = ctx;
	this.items = [];
	this.background_items = [];
	this.selected_items = [];

	this.debug_items = {}; //TODO for debug

	this.setUpdateNeeded(true);
}

Screen.prototype.addItem = function(item, is_background)
{
	item.sprite.screen = this;
	if (is_background)
	{
		this.background_items.push(item);
	}
	else
	{
		this.items.push(item);
	}
	this.setUpdateNeeded(true);
}

Screen.prototype.setUpdateNeeded = function(need_update)
{
	this.need_update = need_update;
}

Screen.prototype.draw = function(timestamp)
{
	var item;
	for (var i in this.items)
	{
		item = this.items[i];
		item.update(timestamp);
	}
	if (this.need_update)
	{
		var tiles = World.get().tiles;

		for (var i in tiles)
		{
			item = tiles[i];
			item.draw(this.ctx);
		}

		for (var i in this.background_items)
		{
			item = this.background_items[i];
			item.draw(this.ctx);
		}

		for (var i in this.items)
		{
			item = this.items[i];
			item.draw(this.ctx);
		}

		// TODO only for debug -------
		for (var i in this.debug_items)
		{
			this.debug_items[i](this.ctx);
		}
		// -------------------------

		if (this.selection_square)
		{
			this.drawSelectionSquare(this.selection_square[1], this.selection_square[2], this.selection_square[3], this.selection_square[4]);
		}

		this.need_update = false;
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

Screen.prototype.drawSelectionSquare = function(x1, y1, x2, y2)
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

	this.ctx.beginPath();
	this.ctx.rect(left, up, right - left, down - up);
	this.ctx.strokeStyle="#0000FF"; //TODO var
	this.ctx.closePath();
	this.ctx.stroke();
}

Screen.prototype.getItemAt = function(x, y)
{
	res = null;
	var item;
	var len = this.items.length - 1;
	for (var i in this.items)
	{
		item = this.items[len - i];
		if (item.contains(x, y))
		{
			res = item;
			break;
		}
	}
	return res;
}

Screen.prototype.getItemsIn = function(x1, y1, x2, y2)
{
	res = [];
	var item;
	for (var i in this.items)
	{
		item = this.items[i];
		if (item.containedIn(x1, y1, x2, y2))
		{
			res.push(item);
		}
	}
	return res;
}

Screen.prototype.select = function(item)
{
	item.select(true);
	this.selected_items.push(item);
}

Screen.prototype.unselectAll = function()
{
	for (var i in this.selected_items)
	{
		this.selected_items[i].select(false);
	}
	this.selected_items = [];
}

Screen.prototype.getSelected = function()
{
	return this.selected_items;
}

Screen.prototype.beginSelectionSquare = function(cursor)
{
	this.selection_square = [cursor[0], cursor[1], cursor[2], cursor[1], cursor[2]];
}

Screen.prototype.updateSelectionSquare = function(cursor)
{
	if (this.selection_square)
	{
		this.selection_square[3] = cursor[1];
		this.selection_square[4] = cursor[2];
		this.setUpdateNeeded(true);
	}
}

Screen.prototype.endSelectionSquare = function(cursor)
{
	this.selection_square = null;
	this.setUpdateNeeded(true);
}
