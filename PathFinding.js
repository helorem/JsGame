LEFT = 0;
RIGHT = 1;
TOP = 2;
BOTTOM = 3;

function GraphLink(item1, item2, weight)
{
	this.item1 = item1;
	this.item2 = item2;
	this.weight = weight;
}

function GraphItem(x, y, is_end)
{
	this.x = x;
	this.y = y;
	this.is_end = is_end;
	this.best_weight = -1;
	if (this.is_end)
	{
		this.best_weight = 0;
	}
	this.next = null;
	this.links = [];
	this.temp_links = [];
}

GraphItem.prototype.clear = function()
{
	this.next = null;
	this.best_weight = -1;
	this.temp_links = [];
}

GraphItem.prototype.calcBestPath = function()
{
	var link;
	var target;
	var target_weight;
	if (!this.is_end)
	{
		if (this.best_weight == -1)
		{
			this.best_weight = -2; //used to avoid node cycling
			for (var i in this.temp_links)
			{
				link = this.temp_links[i];
				target = link.item2;
				if (target == this)
				{
					target = link.item1;
				}
				target.calcBestPath();
				if (target.best_weight > -1)
				{
					target_weight = target.best_weight + link.weight;
					if (target_weight < this.best_weight || this.best_weight < 0)
					{
						this.best_weight = target_weight;
						this.next = target;
					}
				}
			}
			for (var i in this.links)
			{
				link = this.links[i];
				target = link.item2;
				if (target == this)
				{
					target = link.item1;
				}
				target.calcBestPath();
				if (target.best_weight > -1)
				{
					target_weight = target.best_weight + link.weight;
					if (target_weight < this.best_weight || this.best_weight < 0)
					{
						this.best_weight = target_weight;
						this.next = target;
					}
				}
			}
		}
	}
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

function PathFinder()
{
	this.blocks = null;
	this.lines = null;
	this.points = null;
}

PathFinder.get = function()
{
	if (!arguments.callee.instance)
	{
		arguments.callee.instance = new PathFinder();
	}
	return arguments.callee.instance
}

PathFinder.prototype.update = function()
{
	this.calcBlocks();
	this.calcLines();
	this.calcPoints();
	this.calcLinks();
}

PathFinder.prototype.calcBlocks = function()
{
	this.blocks = [];
	var current_wall = WallManager.get().wall_item;
	while (current_wall)
	{
		found = false;
		var blk1 = current_wall.square;
		for (var i in this.blocks)
		{
			var blk2 = this.blocks[i];
			if (blk1[LEFT] == blk2[LEFT] && blk1[RIGHT] == blk2[RIGHT])
			{
				//left & right match
				if (blk1[TOP] == blk2[BOTTOM])
				{
					this.blocks[i][BOTTOM] = blk1[BOTTOM];
					found = true;
				}
				else if (blk1[BOTTOM] == blk2[TOP])
				{
					this.blocks[i][TOP] = blk1[TOP];
					found = true;
				}
			}
			else if (blk1[TOP] == blk2[TOP] && blk1[BOTTOM] == blk2[BOTTOM])
			{
				//up && down match
				if (blk1[LEFT] == blk2[RIGHT])
				{
					this.blocks[i][RIGHT] = blk1[RIGHT];
					found = true;
				}
				else if (blk1[RIGHT] == blk2[LEFT])
				{
					this.blocks[i][LEFT] = blk1[LEFT];
					found = true;
				}
			}
		}

		if (!found)
		{
			this.blocks.push(blk1);
		}

		current_wall = current_wall.previous;
	}
}

PathFinder.prototype.calcLines = function()
{
	this.lines= [];
	for (var i in this.blocks)
	{
		var blk = this.blocks[i];
		this.lines.push(new Line(blk[LEFT], blk[TOP], blk[LEFT], blk[BOTTOM]));
		this.lines.push(new Line(blk[LEFT], blk[BOTTOM], blk[RIGHT], blk[BOTTOM]));
		this.lines.push(new Line(blk[RIGHT], blk[BOTTOM], blk[RIGHT], blk[TOP]));
		this.lines.push(new Line(blk[RIGHT], blk[TOP], blk[LEFT], blk[TOP]));
	}
}

PathFinder.prototype._insertPointIfNotExists = function(x, y)
{
	if (x >= 0 && y >= 0)
	{
		var found = false;
		for (var i in this.points)
		{
			if (this.points[i].x == x && this.points[i].y == y)
			{
				found = true;
				break;
			}
		}
		if (!found)
		{
			this.points.push(new GraphItem(x, y));
		}
	}
}

PathFinder.prototype.calcPoints = function()
{
	this.points = [];

	var current_wall = WallManager.get().wall_item;
	var padding = 16; // TODO var
	while (current_wall)
	{
		if (current_wall.state == WALL_N)
		{
			this._insertPointIfNotExists(current_wall.square[LEFT] - padding, current_wall.square[BOTTOM] + padding);
			this._insertPointIfNotExists(current_wall.square[RIGHT] + padding, current_wall.square[BOTTOM] + padding);
		}
		else if (current_wall.state == WALL_S)
		{
			this._insertPointIfNotExists(current_wall.square[LEFT] - padding, current_wall.square[TOP] - padding);
			this._insertPointIfNotExists(current_wall.square[RIGHT] + padding, current_wall.square[TOP] - padding);
		}
		else if (current_wall.state == WALL_E)
		{
			this._insertPointIfNotExists(current_wall.square[LEFT] - padding, current_wall.square[TOP] - padding);
			this._insertPointIfNotExists(current_wall.square[LEFT] - padding, current_wall.square[BOTTOM] + padding);
		}
		else if (current_wall.state == WALL_W)
		{
			this._insertPointIfNotExists(current_wall.square[RIGHT] + padding, current_wall.square[TOP] - padding);
			this._insertPointIfNotExists(current_wall.square[RIGHT] + padding, current_wall.square[BOTTOM] + padding);
		}
		else if (current_wall.state == (WALL_N | WALL_E))
		{
			this._insertPointIfNotExists(current_wall.square[LEFT] - padding, current_wall.square[BOTTOM] + padding);
		}
		else if (current_wall.state == (WALL_N | WALL_W))
		{
			this._insertPointIfNotExists(current_wall.square[RIGHT] + padding, current_wall.square[BOTTOM] + padding);
		}
		else if (current_wall.state == (WALL_S | WALL_E))
		{
			this._insertPointIfNotExists(current_wall.square[LEFT] - padding, current_wall.square[TOP] - padding);
		}
		else if (current_wall.state == (WALL_S | WALL_W))
		{
			this._insertPointIfNotExists(current_wall.square[RIGHT] + padding, current_wall.square[TOP] - padding);
		}
		current_wall = current_wall.previous;
	}
}

PathFinder.prototype.calcLinks = function()
{
	var link;
	var weight;
	var vec_x;
	var vec_y;
	var pt1;
	var pt2;
	var line = new Line(0, 0, 0, 0);

	for (var i  = 0; i < this.points.length; ++i)
	{
		pt1 = this.points[i];
		for (var j = i + 1; j < this.points.length; ++j)
		{
			pt2 = this.points[j];
			line.x1 = pt1.x;
			line.y1 = pt1.y;
			line.x2 = pt2.x;
			line.y2 = pt2.y;
			this.testLine(pt1, pt2, line);
		}
	}
}

PathFinder.prototype.testLine = function(pt1, pt2, line, is_temp)
{
	var link;
	var weight;
	var vec_x;
	var vec_y;

	found = false;
	for (var k in this.lines)
	{
		if (line.intersect(this.lines[k]))
		{
			found = true;
			break;
		}
	}
	if (!found)
	{
		vec_x = pt2.x - pt1.x;
		vec_y = pt2.y - pt1.y;
		weight = (vec_x * vec_x) + (vec_y * vec_y);
		link = new GraphLink(pt1, pt2, weight);
		if (is_temp)
		{
			pt1.temp_links.push(link);
			pt2.temp_links.push(link);
		}
		else
		{
			pt1.links.push(link);
			pt2.links.push(link);
		}
		return true;
	}
	return false;
}

PathFinder.prototype.findPath = function(x1, y1, x2, y2)
{
	Screen.get().debug_items = []; // TODO debug only

	console.debug("find path", x1, y1, x2, y2);

	var begin = new GraphItem(x1, y1);
	var end = new GraphItem(x2, y2, true);

	var pt;
	var line = new Line(begin.x, begin.y, end.x, end.y);

	// test if direct path exists
	if (!this.testLine(begin, end, line, true))
	{
		// else, create missings links
		for (var i in this.points)
		{
			pt = this.points[i];
			pt.clear();
			line.x1 = begin.x;
			line.y1 = begin.y;
			line.x2 = pt.x;
			line.y2 = pt.y;
			this.testLine(begin, pt, line, true);
			line.x1 = end.x;
			line.y1 = end.y;
			this.testLine(end, pt, line, true);
		}
	}

	begin.calcBestPath();

	var res = [];
	var c_item = begin.next;
	while (c_item)
	{
		res.push(c_item);
		c_item = c_item.next;
	}

	// TODO debug only --------------------
	var me = this;
	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		ctx.strokeStyle="#FFFFFF";
		for (var i in me.points)
		{
			var pt = me.points[i];
			for (var j in pt.temp_links)
			{
				var link = pt.temp_links[j];
				var pt1 = link.item1;
				var pt2 = link.item2;
				ctx.moveTo(pt1.x, pt1.y);
				ctx.lineTo(pt2.x, pt2.y);
			}
			for (var j in pt.links)
			{
				var link = pt.links[j];
				var pt1 = link.item1;
				var pt2 = link.item2;
				ctx.moveTo(pt1.x, pt1.y);
				ctx.lineTo(pt2.x, pt2.y);
			}
		}
		ctx.closePath();
		ctx.stroke();
	});

	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		ctx.strokeStyle="#FF0000";
		ctx.moveTo(x1, y1);
		for (var i in res)
		{
			console.debug(res[i].x, res[i].y);
			ctx.lineTo(res[i].x, res[i].y);
			ctx.moveTo(res[i].x, res[i].y);
		}
		ctx.closePath();
		ctx.stroke();
	});

	Screen.get().setUpdateNeeded(true);
	//-------------
}
