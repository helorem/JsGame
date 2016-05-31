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

function chooseWallIndex(tile)
{
	var state = 0;
	if (tile.left && (tile.left.type & TYPE_WALL))
	{
		state |= WALL_W;
	}
	if (tile.right && (tile.right.type & TYPE_WALL))
	{
		state |= WALL_E;
	}
	if (tile.up && (tile.up.type & TYPE_WALL))
	{
		state |= WALL_N;
	}
	if (tile.down && (tile.down.type & TYPE_WALL))
	{
		state |= WALL_S;
	}
	var indexes = WALL_MAPPING[state];
	var i = Math.floor((Math.random() * indexes.length));
	return indexes[i];
}

function WallManager()
{
	this.size = World.get().tile_size;
	this.wall_items = [];
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
	var item = World.get().getTile(x, y);
	item.setType(TYPE_WALL);
	item.setIndex(index);
	this.wall_items.push(item);
	return item;
}

WallManager.prototype.addWall = function(index, x1, y1, x2, y2)
{
	x1 -= this.size / 2;
	y1 -= this.size / 2;
	x2 -= this.size / 2;
	y2 -= this.size / 2;

	x1 -= x1 % this.size;
	y1 -= y1 % this.size;
	x2 -= x2 % this.size;
	y2 -= y2 % this.size;

	x1 += this.size / 2;
	y1 += this.size / 2;
	x2 += this.size / 2;
	y2 += this.size / 2;

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
	PathFinder.get().update();
}

