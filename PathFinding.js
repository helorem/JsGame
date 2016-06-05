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

	var path_id = PathFinder.get().createPathId();

	var start_tile = World.get().getTile(x1, y1);
	start_tile.current_path_parent = null;
	start_tile.current_path_id = path_id;
	start_tile.current_path_val = 0;
	var end_tile = World.get().getTile(x2, y2);

	var tile_list = [start_tile];

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
			// TODO remove
			if (nodes.indexOf(tile) == -1)
			{
				nodes.push(tile);
			}

			var childs = [tile.left, tile.right, tile.up, tile.down];
			var child_path_val = tile.current_path_val + tile.ground_speed;

			for (var i in childs)
			{
				var child = childs[i];
				if (child)
				{
					if (child.type == TYPE_WATER || child.type == TYPE_WALL1 || child.type == TYPE_WALL2)
					{
						// we cannot walk on the tile
					}
					else if (child.current_path_id != path_id || child_path_val < child.current_path_val)
					{
						child.current_path_id = path_id;
						child.current_path_parent = tile;
						child.current_path_val = child_path_val;

						//insert sorted
						var inserted = false;
						for (var j in tile_list)
						{
							if (tile_list[j].current_path_val > child.current_path_val)
							{
								tile_list.splice(j, 0, child);
								inserted = true;
								break;
							}
						}
						if (!inserted)
						{
							tile_list.push(child);
						}
					}
				}
			}
		}
	}

	//console.debug("nb tile analysed", nodes.length);
	nodes.shift();

	var res = [];
	var tile = start_tile;
	while (tile)
	{
		res.push(tile);
		tile = tile.current_path_best;
	}

	// TODO debug only --------------------
	Screen.get().debug_items.push(function(ctx) {
		if (document.getElementById("chk_path_analysis").checked)
		{
			var colors = chroma.interpolate.bezier(["blue", "red"]);
			var cs = chroma.scale(colors).mode('lab').correctLightness(true);
			var cols = [];
			var steps = nodes[nodes.length - 1].current_path_val;
			for (var i = 0; i < steps; ++i)
			{
				var t = i / (steps - 1);
				cols.push(cs(t).hex());
			}

			ctx.globalAlpha = 0.60;
			for (var i in nodes)
			{
				ctx.fillStyle = cols[nodes[i].current_path_val];
				ctx.fillRect(nodes[i].x - 16, nodes[i].y - 16, 32, 32);
			}
			ctx.globalAlpha = 1;
		}
	});

	Screen.get().setUpdateNeeded(true);
	//-------------

	// TODO debug only --------------------
	Screen.get().debug_items.push(function(ctx) {
		if (document.getElementById("chk_path").checked)
		{
			if (res.length > 1)
			{
				ctx.beginPath();
				ctx.strokeStyle="#00FFFF";
				ctx.moveTo(res[0].x, res[0].y);
				for (var i = 1; i < res.length; ++i)
				{
					ctx.lineTo(res[i].x, res[i].y);
					ctx.moveTo(res[i].x, res[i].y);
				}
				ctx.closePath();
				ctx.stroke();
			}
		}
	});

	Screen.get().setUpdateNeeded(true);
	//-------------
	return res;
}

PathFinder.prototype.update = function()
{
}

/*
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
			if (tile.type == TYPE_WALL1 || tile.type == TYPE_WALL2 || tile.type == TYPE_WATER)
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
			if (tile.type == TYPE_WALL1 || tile.type == TYPE_WALL2 || tile.type == TYPE_WATER)
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

	this.block_lines= [];
	for (var i in blocks)
	{
		var blk = blocks[i];
		this.block_lines.push(new Line(blk[LEFT], blk[UP], blk[RIGHT], blk[UP]));
		this.block_lines.push(new Line(blk[RIGHT], blk[UP], blk[RIGHT], blk[DOWN]));
		this.block_lines.push(new Line(blk[RIGHT], blk[DOWN], blk[LEFT], blk[DOWN]));
		this.block_lines.push(new Line(blk[LEFT], blk[DOWN], blk[LEFT], blk[UP]));
	}
	//
	// TODO debug only --------------------
	Screen.get().debug_items.push(function(ctx) {
		if (document.getElementById("chk_blocks").checked)
		{
			ctx.fillStyle="#FFFF00";
			for (var i in blocks)
			{
				ctx.globalAlpha = 0.25;
				var x1 = Math.min(blocks[i][LEFT], blocks[i][RIGHT]);
				var x2 = Math.max(blocks[i][LEFT], blocks[i][RIGHT]);
				var y1 = Math.min(blocks[i][UP], blocks[i][DOWN]);
				var y2 = Math.max(blocks[i][UP], blocks[i][DOWN]);
				ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
				ctx.globalAlpha = 1;
			}
		}
	});

	Screen.get().setUpdateNeeded(true);
	//-------------

}

function getLineCost(line)
{
	var res = [];

	var tile_contains = function(tile, x, y)
	{
		var padding =  World.get().tile_size / 2;
		if (x < tile.x - padding || x > tile.x + padding || y < tile.y - padding || y > tile.y + padding)
		{
			return false;
		}
		return true;
	}

	var tile_intersect = function(tile, line)
	{
		var padding =  World.get().tile_size / 2;
		var tile_lines = [];
		tile_lines.push(new Line(tile.x - padding, tile.y - padding, tile.x + padding, tile.y - padding));
		tile_lines.push(new Line(tile.x + padding, tile.y - padding, tile.x + padding, tile.y + padding));
		tile_lines.push(new Line(tile.x + padding, tile.y + padding, tile.x - padding, tile.y + padding));
		tile_lines.push(new Line(tile.x + padding, tile.y + padding, tile.x - padding, tile.y - padding));

		var points = [];
		for (var i in tile_lines)
		{
			var pt = tile_lines[i].intersect(line);
			if (pt)
			{
				points.push(pt);
			}
		}
		if (points.length == 0)
		{
			return false;
		}
		else if (points.length < 2)
		{
			//the segment end in the tile
			if (tile_contains(tile, line.x1, line.y1))
			{
				points.push([line.x1, line.y1]);
			}
			else
			{
				points.push([line.x2, line.y2]);
			}
		}

		var A = points[1][0] - points[0][0];
		var B = points[1][1] - points[0][1];
		var res = Math.sqrt(A * A + B * B);
		return res;
	}

	x1 = Math.min(line.x1, line.x2);
	x2 = Math.max(line.x1, line.x2);
	y1 = Math.min(line.y1, line.y2);
	y2 = Math.max(line.y1, line.y2);

	var tile_list = [World.get().getTile(x1, y1)];
	var total_cost = 0;
	while (tile_list.length > 0)
	{
		var tile = tile_list.shift();
		var line_length = tile_intersect(tile, line);
		if (line_length)
		{
			console.debug(tile.x, tile.y, tile.type);
			if (tile.type == TYPE_WATER || tile.type == TYPE_WALL1 || tile.type == TYPE_WALL2)
			{
				console.debug("wrong");
				return -1;
			}

			total_cost += (line_length * tile.ground_speed) / World.get().tile_size;
			if (tile.right)
			{
				tile_list.push(tile.right);
			}
			if (tile.down)
			{
				tile_list.push(tile.down);
			}
		}
	}
	return Math.round(total_cost);
}

PathFinder.prototype.simplifyPath = function(tiles)
{
	this.update(); //TODO debug only (to display debug colors)

	var res = [tiles[0]];
	var line_to_test;
	for (var i  = 0; i < tiles.length - 1;)
	{
		var found = false;
		for (var j = tiles.length - 1; j > i; --j)
		{
			line_to_test = new Line(tiles[i].x, tiles[i].y, tiles[j].x, tiles[j].y);
			var cost = getLineCost(line_to_test);
			if (cost > -1)
			{
				if (tiles[i].current_path_val + cost <= tiles[j].current_path_val)
				{
					console.debug(tiles[j].x, tiles[j].x);
					res.push(tiles[j]);
					found = true;
					i = j;
					break;
				}
			}
		}
		if (!found)
		{
			i += 1;
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
	else return [xi, yi];
	//point = xi, yi
}
*/
