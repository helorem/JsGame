TYPE_NORMAL = 0x0;
TYPE_WATER  = 0x1;
TYPE_WALL   = 0x2;
TYPE_ROAD   = 0x4;

function WorldTile(x, y, img_file, index, sub_index, ground_speed)
{
	GraphicItem.call(this, x, y, img_file);
	this.x = x;
	this.y = y;
	this.sprite.setIndex(index);
	this.sprite.animation_index = sub_index;
	this.left = null;
	this.right = null;
	this.up = null;
	this.down = null;
	this.ground_speed = ground_speed;

	this.type = TYPE_NORMAL;
}
extend(GraphicItem, WorldTile);

WorldTile.prototype.setType = function(type)
{
	if ((type & this.type) == 0)
	{
		this.type = type;
		this._updated();
		this._updateNeightboors();
	}
}

WorldTile.prototype.setIndex = function(index)
{
	if (index != this.sprite.index)
	{
		this.sprite.setIndex(index);
		this._updated();
	}
}

WorldTile.prototype.setSubIndex = function(sub_index)
{
	if (sub_index != this.sprite.animation_index)
	{
		this.sprite.animation_index = sub_index;
		this._updated();
	}
}

WorldTile.prototype._updateNeightboors = function()
{
	if (this.left)
	{
		this.left._updated();
	}
	if (this.right)
	{
		this.right._updated();
	}
	if (this.up)
	{
		this.up._updated();
	}
	if (this.down)
	{
		this.down._updated();
	}
}

WorldTile.prototype._updated = function()
{
	if (this.type & TYPE_WALL)
	{
		this.setSubIndex(chooseWallIndex(this));
	}
	// TODO do not update if not displayed
	Screen.get().setUpdateNeeded(true);
}

WorldTile.prototype.linkLeft = function(o_tile)
{
	this.left = o_tile;
	if (o_tile.right != this)
	{
		o_tile.linkRight(this);
	}
	this._updated();
}

WorldTile.prototype.linkRight = function(o_tile)
{
	this.right = o_tile;
	if (o_tile.left != this)
	{
		o_tile.linkLeft(this);
	}
	this._updated();
}

WorldTile.prototype.linkUp = function(o_tile)
{
	this.up = o_tile;
	if (o_tile.down != this)
	{
		o_tile.linkDown(this);
	}
	this._updated();
}

WorldTile.prototype.linkDown = function(o_tile)
{
	this.down = o_tile;
	if (o_tile.up != this)
	{
		o_tile.linkUp(this);
	}
	this._updated();
}

function World()
{
}

World.get = function()
{
	if (!arguments.callee.instance)
	{
		arguments.callee.instance = new World();
	}
	return arguments.callee.instance
}


World.prototype.init = function(json)
{
	this.image_file = json.land.image_file;
	var img = g_images[this.image_file];

	this.tile_size = img.w;

	this.w = json.land.w;
	this.h = json.land.h;
	this.tiles = [];

	this.start_x = this.tile_size / 2;
	this.start_y = this.tile_size / 2;
	var x = this.start_x;
	var y = this.start_y;
	for (var i in json.land.tiles)
	{
		var tile_data = json.land.tiles[i];
		var tile = new WorldTile(x, y, this.image_file, tile_data[0], tile_data[1], tile_data[2]);
		this.tiles.push(tile);

		if (x > this.start_x)
		{
			tile.linkLeft(this.tiles[i - 1]);
		}
		if (y > this.start_y)
		{
			tile.linkUp(this.tiles[i - (this.w / this.tile_size)]);
		}

		x += this.tile_size;
		if (x >= this.w)
		{
			x = this.start_x;
			y += this.tile_size;
		}
	}
}

World.prototype.getTile = function(x, y)
{
	// TODO improve
	var x2 = (x - this.start_x) / this.tile_size;
	var y2 = (y - this.start_y) / this.tile_size;
	var i = y2 * (this.w / this.tile_size) + x2;
	return this.tiles[i];
}
