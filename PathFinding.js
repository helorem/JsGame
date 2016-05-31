LEFT = 0;
RIGHT = 1;
UP = 2;
DOWN = 3;


function PathFinder()
{
	this.blocks = null;
	this.lines = null;
	this.points = null;
	this.current_path_id = 0;
}

PathFinder.get = function()
{
	if (!arguments.callee.instance)
	{
		arguments.callee.instance = new PathFinder();
	}
	return arguments.callee.instance
}

PathFinder.prototype.createPathId = function()
{
	this.current_path_id += 1;
	return this.current_path_id;
}

PathFinder.prototype.findPath = function(x1, y1, x2, y2)
{
	Screen.get().debug_items = []; // TODO debug only
	var res = [];

	console.debug("path to", x1, x2, y1, y2);

	var start_tile = World.get().getTile(x1, y1);
	start_tile.current_path_parent = null;
	var end_tile = World.get().getTile(x2, y2);

	var tile_list = [start_tile];
	var path_id = PathFinder.get().createPathId();

	var nodes = []; // TODO remove
	while (tile_list.length > 0)
	{
		var tile = tile_list.shift();
		if (tile == end_tile)
		{
			// the tile is the end
			tile.setBestPath(null);
			break;
		}
		else
		{
			tile.current_path_id = path_id;

			nodes.push(tile); // TODO remove

			var childs = [tile.left, tile.right, tile.up, tile.down];

			for (var i in childs)
			{
				var child = childs[i];
				if (child)
				{
					if ((child.type & TYPE_WATER) | (child.type & TYPE_WALL))
					{
						// we cannot walk on the tile
					}
					else if (child.current_path_id != path_id)
					{
						child.current_path_id = path_id;
						child.current_path_parent = tile;
						child.current_path_val = tile.current_path_val + tile.ground_speed;
						tile_list.push(child);
					}
				}
			}
		}
	}

	console.debug("nb tile analysed", nodes.length);
	nodes.shift();

	var res = [];
	var tile = start_tile;
	while (tile)
	{
		res.push(tile);
		tile = tile.current_path_best;
	}

	res = this.simplifyPath(res);

	/*
	// TODO debug only --------------------
	Screen.get().debug_items.push(function(ctx) {
		colors = chroma.interpolate.bezier(["blue", "red"]);
		cs = chroma.scale(colors).mode('lab').correctLightness(true);
		cols = [];
		var steps = nodes[nodes.length - 1].current_path_val;
		for (var i = 0; i < steps; ++i)
		{
			var t = i / (steps - 1);
			cols.push(cs(t).hex());
		}

		for (var i in nodes)
		{
			ctx.fillStyle = cols[nodes[i].current_path_val];
			ctx.fillRect(nodes[i].x + 1 - 16, nodes[i].y + 1 - 16, 30, 30);
		}
	});

	Screen.get().setUpdateNeeded(true);
	//-------------
	*/

	// TODO debug only --------------------
	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		ctx.strokeStyle="#00FF00";
		ctx.moveTo(x1, y1);
		for (var i in res)
		{
			ctx.lineTo(res[i].x, res[i].y);
			ctx.moveTo(res[i].x, res[i].y);
		}
		ctx.closePath();
		ctx.stroke();
	});

	Screen.get().setUpdateNeeded(true);
	//-------------
}

PathFinder.prototype.update = function()
{
	blocks = [];
	var step = World.get().tile_size;
	var padding = World.get().tile_size / 2;

	for (var x = padding; x < World.get().w; x += step)
	{
		var y = padding;
		var tile = World.get().getTile(x, y);
		var start_block = null;
		var last_tile = tile;
		while (tile)
		{
			if (tile.type & (TYPE_WALL | TYPE_WATER))
			{
				if (!start_block)
				{
					start_block = tile;
				}
			}
			else
			{
				if (start_block)
				{
					if (start_block != last_tile || (last_tile.up == null && last_tile.down == null))
					{
						blocks.push([start_block.x - padding, last_tile.x + padding, start_block.y - padding, last_tile.y + padding]);
					}
					start_block = null;
				}
			}
			last_tile = tile;
			tile = tile.down;
		}
		if (start_block)
		{
			blocks.push([start_block.x - padding, last_tile.x + padding, start_block.y - padding, last_tile.y + padding]);
			start_block = null;
		}
	}

	for (var y = padding; y < World.get().h; y += step)
	{
		var x = padding;
		var tile = World.get().getTile(x, y);
		var start_block = null;
		var last_tile = null;
		while (tile)
		{
			if (tile.type & (TYPE_WALL | TYPE_WATER))
			{
				if (!start_block)
				{
					start_block = tile;
				}
			}
			else
			{
				if (start_block)
				{
					if (start_block != last_tile || (last_tile.up == null && last_tile.down == null))
					{
						blocks.push([start_block.x - padding, last_tile.x + padding, start_block.y - padding, last_tile.y + padding]);
					}
					start_block = null;
				}
			}
			last_tile = tile;
			tile = tile.right;
		}
		if (start_block)
		{
			blocks.push([start_block.x - padding, last_tile.x + padding, start_block.y - padding, last_tile.y + padding]);
			start_block = null;
		}
	}

	/*
	// TODO debug only --------------------
	Screen.get().debug_items.push(function(ctx) {
		//ctx.fillStyle="#FFFF00";
		ctx.strokeStyle="#FFFF00";
		ctx.beginPath();
		for (var i in blocks)
		{
			ctx.moveTo(blocks[i][LEFT], blocks[i][UP]);
			ctx.lineTo(blocks[i][LEFT], blocks[i][DOWN]);
			ctx.lineTo(blocks[i][RIGHT], blocks[i][DOWN]);
			ctx.lineTo(blocks[i][RIGHT], blocks[i][UP]);
			ctx.lineTo(blocks[i][LEFT], blocks[i][UP]);
			ctx.lineTo(blocks[i][RIGHT], blocks[i][DOWN]);
			ctx.moveTo(blocks[i][RIGHT], blocks[i][UP]);
			ctx.lineTo(blocks[i][LEFT], blocks[i][DOWN]);
		}
		ctx.closePath();
		ctx.stroke();
	});
	Screen.get().setUpdateNeeded(true);
	//-------------
	*/

	this.block_lines= [];
	for (var i in blocks)
	{
		var blk = blocks[i];
		this.block_lines.push(new Line(blk[LEFT], blk[UP], blk[RIGHT], blk[UP]));
		this.block_lines.push(new Line(blk[RIGHT], blk[UP], blk[RIGHT], blk[DOWN]));
		this.block_lines.push(new Line(blk[RIGHT], blk[DOWN], blk[LEFT], blk[DOWN]));
		this.block_lines.push(new Line(blk[LEFT], blk[DOWN], blk[LEFT], blk[UP]));
	}
}

PathFinder.prototype.simplifyPath = function(tiles)
{
	var res = [tiles[0]];
	var line_to_test;
	for (var i  = 0; i < tiles.length - 1;)
	{
		for (var j = tiles.length - 1; j > i; --j)
		{
			line_to_test = new Line(tiles[i].x, tiles[i].y, tiles[j].x, tiles[j].y);
			found = false;
			for (var k in this.block_lines)
			{
				if (this.block_lines[k].intersect(line_to_test))
				{
					found = true;
					break;
				}
			}
			if (!found)
			{
				res.push(tiles[j]);
				i = j;
				break;
			}
		}
	}

	return res;
}

function Line(x1, y1, x2, y2)
{
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
}

Line.prototype.intersect = function(line)
{
	var v1 = this.x1 - this.x2;
	var v2 = this.y1 - this.y2;
	var v3 = line.x1 - line.x2;
	var v4 = line.y1 - line.y2;

	var d = v1 * v4 - v2 * v3;
	if (d == 0) return false;

	var v5 = this.x1 * this.y2 - this.y1 * this.x2;
	var v6 = line.x1 * line.y2 - line.y1 * line.x2;

	var xi = (v3 * v5 - v1 * v6) / d;
	var yi = (v4 * v5 - v2 * v6) / d;

	     if (xi < Math.min(this.x1, this.x2)) return false;
	else if (xi > Math.max(this.x1, this.x2)) return false;
	else if (xi < Math.min(line.x1, line.x2)) return false;
	else if (xi > Math.max(line.x1, line.x2)) return false;
	else if (yi < Math.min(this.y1, this.y2)) return false;
	else if (yi > Math.max(this.y1, this.y2)) return false;
	else if (yi < Math.min(line.y1, line.y2)) return false;
	else if (yi > Math.max(line.y1, line.y2)) return false;
	else return true;
	//point = xi, yi
}

