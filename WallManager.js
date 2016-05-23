WALL_H = 1;
WALL_V = 2;
WALL_N = 0b0001;
WALL_S = 0b0010;
WALL_E = 0b0100;
WALL_W = 0b1000;
WALL_MAPPING = {
	0b0000 : [0],
	0b0001 : [4],
	0b0010 : [1],
	0b0011 : [5, 6],
	0b0100 : [2],
	0b0101 : [7],
	0b0110 : [3],
	0b0111 : [8],
	0b1000 : [9],
	0b1001 : [14],
	0b1010 : [10],
	0b1011 : [15],
	0b1100 : [11, 12],
	0b1101 : [16],
	0b1110 : [13],
	0b1111 : [17],
};

function WallItem(x, y, index)
{
	PhysicItem.call(this, x, y, Screen.get().background_file);
	this.sprite.setIndex(index);
	this.size = this.sprite.w;
	this.previous = null;
	this.next = null;

	this.left = null;
	this.right = null;
	this.up = null;
	this.down = null;

	this.state = 0b0000;
	this.updateAnimationIndex();
}
extend(PhysicItem, WallItem);

WallItem.prototype.updateAnimationIndex = function()
{
	var indexes = WALL_MAPPING[this.state];
	var i = Math.floor((Math.random() * indexes.length));
	this.sprite.animation_index = indexes[i];
}

WallItem.prototype.setNext = function(item)
{
	this.next = item;
	item.previous = this;

	this.linkIfPossible(item);
}

WallItem.prototype.search = function(x, y, not_recursive)
{
	var res = null;
	if (this.x == x && this.y == y)
	{
		res = this;
	}
	else if (!not_recursive && this.previous)
	{
		res = this.previous.search(x, y, not_recursive);
	}
	return res;
}

WallItem.prototype.linkIfPossible = function(item, not_recursive)
{
	if (this.y == item.y)
	{
		if (this.x == item.x + item.size)
		{
			this.left = item;
			this.state |= WALL_W;
			this.updateAnimationIndex();
			item.right = this;
			item.state |= WALL_E;
			item.updateAnimationIndex();
		}
		else if (item.x == this.x + this.size)
		{
			item.left = this;
			item.state |= WALL_W;
			item.updateAnimationIndex();
			this.right = item;
			this.state |= WALL_E;
			this.updateAnimationIndex();
		}
	}
	else if (this.x == item.x)
	{
		if (this.y == item.y + item.size)
		{
			this.up = item;
			this.state |= WALL_N;
			this.updateAnimationIndex();
			item.down = this;
			item.state |= WALL_S;
			item.updateAnimationIndex();
		}
		else if (item.y == this.y + this.size)
		{
			item.up = this;
			item.state |= WALL_N;
			item.updateAnimationIndex();
			this.down = item;
			this.state |= WALL_S;
			this.updateAnimationIndex();
		}
	}

	if (!not_recursive && this.previous)
	{
		this.previous.linkIfPossible(item, not_recursive);
	}
}

WallItem.prototype.draw = function(ctx)
{
	this.sprite.draw(ctx);
}

function WallManager()
{
	this.size = 32; //TODO var
	this.wall_item = null;
}

WallManager.get = function()
{
	if (!arguments.callee.instance)
	{
		arguments.callee.instance = new WallManager();
	}
	return arguments.callee.instance
}

WallManager.prototype.createWallItem = function(x, y, index)
{
	var item = null;
	if (this.wall_item)
	{
		item = this.wall_item.search(x, y);
	}
	if (!item)
	{
		item = new WallItem(x, y, index);
		if (this.wall_item)
		{
			this.wall_item.setNext(item)
		}
		this.wall_item = item;
		Screen.get().addItem(item, true);
	}
	return item;
}

WallManager.prototype.addWall = function(index, x1, y1, x2, y2)
{
	x1 -= x1 % this.size;
	y1 -= y1 % this.size;
	x2 -= x2 % this.size;
	y2 -= y2 % this.size;

	var tmp;
	if (x1 > x2)
	{
		tmp = x1;
		x1 = x2;
		x2 = tmp;
	}

	if (y1 > y2)
	{
		tmp = y1;
		y1 = y2;
		y2 = tmp;
	}

	var x = x1;
	var y = y1;
	while (x < x2 || y < y2)
	{
		this.createWallItem(x, y, index);
		if (x < x2)
		{
			x += this.size;
		}

		if (y < y2)
		{
			y += this.size;
		}
	}
	this.createWallItem(x, y, index);
}

