TYPE_NORMAL = 0x00;
TYPE_WATER  = 0x01;
TYPE_WALL1  = 0x02;
TYPE_WALL2  = 0x04;
TYPE_ROAD1  = 0x08;
TYPE_ROAD2  = 0x10;

GROUND_SPEEDS = {
	0x00 : 1,
	0x08 : 0.65,
	0x10 : 0.45
};

N = 0x1;
S = 0x2;
E = 0x4;
W = 0x8;
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
	0b1111 : [17]
};

ROAD_MAPPING = {
	0b0000 : [0, 1],
	0b0001 : [5],
	0b0010 : [4],
	0b0011 : [0, 1],
	0b0100 : [2],
	0b0101 : [0, 1],
	0b0110 : [0, 1],
	0b0111 : [0, 1],
	0b1000 : [3],
	0b1001 : [0, 1],
	0b1010 : [0, 1],
	0b1011 : [0, 1],
	0b1100 : [0, 1],
	0b1101 : [0, 1],
	0b1110 : [0, 1],
	0b1111 : [0, 1]
};

function WorldTile(x, y, img_file, index, sub_index, type)
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
	this.type = null;
	this.ground_speed = 0;

	this.wall_sprite = new Sprite(img_file);
	this.wall_sprite.x = this.sprite.x;
	this.wall_sprite.y = this.sprite.y;

	this.road_sprite = new Sprite("images/roads.png");
	this.road_sprite.x = this.sprite.x;
	this.road_sprite.y = this.sprite.y;

	this.current_path_parent = null;
	this.current_path_id = 0;
	this.current_path_best = null;
	this.current_path_val = 0;

	// TODO debug only ------
	var me = this;
	Screen.get().debug_items["tile" + this.x + "x" + this.y] = function(ctx) {
		if (document.getElementById("chk_grid").checked)
		{
			ctx.globalAlpha = 0.5;
			ctx.beginPath();
			ctx.strokeStyle="#FFFFFF";
			ctx.moveTo(me.sprite.x, me.sprite.y);
			ctx.lineTo(me.sprite.x + World.get().tile_size, me.sprite.y);
			ctx.moveTo(me.sprite.x, me.sprite.y);
			ctx.lineTo(me.sprite.x, me.sprite.y + World.get().tile_size);
			ctx.closePath();
			ctx.stroke();
			ctx.globalAlpha = 1;
		}
	};
	//-----------------------

	this.setType(type);
}
extend(GraphicItem, WorldTile);

WorldTile.prototype.setType = function(type)
{
	if (type != this.type)
	{
		this.type = type;
		this.ground_speed = GROUND_SPEEDS[this.type];

		if (this.type == TYPE_WALL1)
		{
			this.wall_sprite.setIndex(10);
		}
		else if (this.type == TYPE_WALL2)
		{
			this.wall_sprite.setIndex(11);
		}
		else if (this.type == TYPE_ROAD1)
		{
			this.road_sprite.setIndex(0);
		}
		else if (this.type == TYPE_ROAD2)
		{
			this.road_sprite.setIndex(1);
		}

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

WorldTile.prototype.setBestPath = function(tile)
{
	this.current_path_best = tile;
	if (this.current_path_parent)
	{
		this.current_path_parent.setBestPath(this);
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

WorldTile.prototype.chooseIndex = function()
{
	var state = 0;
	if (this.left && (this.left.type == this.type))
	{
		state |= W;
	}
	if (this.right && (this.right.type == this.type))
	{
		state |= E;
	}
	if (this.up && (this.up.type == this.type))
	{
		state |= N;
	}
	if (this.down && (this.down.type == this.type))
	{
		state |= S;
	}
	var indexes;
	if (this.type == TYPE_WALL1 || this.type == TYPE_WALL2)
	{
		indexes = WALL_MAPPING[state];
	}
	else if (this.type == TYPE_ROAD1 || this.type == TYPE_ROAD2)
	{
		indexes = ROAD_MAPPING[state];
	}
	var i = Math.floor((Math.random() * indexes.length));
	return indexes[i];
}

WorldTile.prototype._updated = function()
{
	if (this.type == TYPE_WALL1 || this.type == TYPE_WALL2)
	{
		this.wall_sprite.animation_index = this.chooseIndex();
	}
	else if (this.type == TYPE_ROAD1 || this.type == TYPE_ROAD2)
	{
		this.road_sprite.animation_index = this.chooseIndex();
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

WorldTile.prototype.draw = function(ctx)
{

	if (this.type == TYPE_WALL1 || this.type == TYPE_WALL2)
	{
		this.wall_sprite.draw(ctx);
	}
	else
	{
		GraphicItem.prototype.draw.call(this, ctx);
		if (this.type == TYPE_ROAD1 || this.type == TYPE_ROAD2)
		{
			this.road_sprite.draw(ctx);
		}
	}
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
	var x2 = Math.round((x - this.start_x) / this.tile_size);
	var y2 = Math.round((y - this.start_y) / this.tile_size);
	var i = y2 * (this.w / this.tile_size) + x2;
	return this.tiles[i];
}
