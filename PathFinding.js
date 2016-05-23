function findPath(x1, y1, x2, y2)
{
	var res = [];

	console.debug("path", x1, y1, x2, y2);

	var blocks = [];
	var current_wall = WallManager.get().wall_item;
	while (current_wall)
	{
		found = false;
		var blk1 = current_wall.square;
		for (var i in blocks)
		{
			var blk2 = blocks[i];
			if (blk1[0] == blk2[0] && blk1[1] == blk2[1])
			{
				//left & right match
				if (blk1[2] == blk2[3])
				{
					blocks[i][3] = blk1[3];
					found = true;
				}
				else if (blk1[3] == blk2[2])
				{
					blocks[i][2] = blk1[2];
					found = true;
				}
			}
			else if (blk1[2] == blk2[2] && blk1[3] == blk2[3])
			{
				//up && down match
				if (blk1[0] == blk2[1])
				{
					blocks[i][1] = blk1[1];
					found = true;
				}
				else if (blk1[1] == blk2[0])
				{
					blocks[i][0] = blk1[0];
					found = true;
				}
			}
		}

		if (!found)
		{
			blocks.push(blk1);
		}

		current_wall = current_wall.previous;
	}

	var lines = [];
	for (var i in blocks)
	{
		var blk = blocks[i];
		lines.push([blk[0], blk[2], blk[0], blk[3]]);
		lines.push([blk[0], blk[3], blk[1], blk[3]]);
		lines.push([blk[1], blk[3], blk[1], blk[2]]);
		lines.push([blk[1], blk[2], blk[0], blk[2]]);
	}

	var points = [];
	points.push([x1, y1, new GraphItem(x1, y1)]);
	points.push([x2, y2, new GraphItem(x2, y2)]);

	var insert_point = function(x, y)
	{
		if (x >= 0 && y >= 0)
		{
			var found = false;
			for (var i in points)
			{
				if (points[i][0] == x && points[i][1] == y)
				{
					found = true;
					break;
				}
			}
			if (!found)
			{
				points.push([x, y, new GraphItem(x, y)]);
			}
		}
	}

	var current_wall = WallManager.get().wall_item;
	var padding = 16;
	while (current_wall)
	{
		if (current_wall.state == WALL_N)
		{
			insert_point(current_wall.square[0] - padding, current_wall.square[3] + padding);
			insert_point(current_wall.square[1] + padding, current_wall.square[3] + padding);
		}
		else if (current_wall.state == WALL_S)
		{
			insert_point(current_wall.square[0] - padding, current_wall.square[2] - padding);
			insert_point(current_wall.square[1] + padding, current_wall.square[2] - padding);
		}
		else if (current_wall.state == WALL_E)
		{
			insert_point(current_wall.square[0] - padding, current_wall.square[2] - padding);
			insert_point(current_wall.square[0] - padding, current_wall.square[3] + padding);
		}
		else if (current_wall.state == WALL_W)
		{
			insert_point(current_wall.square[1] + padding, current_wall.square[2] - padding);
			insert_point(current_wall.square[1] + padding, current_wall.square[3] + padding);
		}
		else if (current_wall.state == (WALL_N | WALL_E))
		{
			insert_point(current_wall.square[0] - padding, current_wall.square[3] + padding);
		}
		else if (current_wall.state == (WALL_N | WALL_W))
		{
			insert_point(current_wall.square[1] + padding, current_wall.square[3] + padding);
		}
		else if (current_wall.state == (WALL_S | WALL_E))
		{
			insert_point(current_wall.square[0] - padding, current_wall.square[2] - padding);
		}
		else if (current_wall.state == (WALL_S | WALL_W))
		{
			insert_point(current_wall.square[1] + padding, current_wall.square[2] - padding);
		}
		current_wall = current_wall.previous;
	}

	var links = [];
	var graph = null;

	for (var i  = 0; i < points.length; ++i)
	{
		var pt1 = points[i];
		for (var j = i + 1; j < points.length; ++j)
		{
			var pt2 = points[j];
			var line1 = [pt1[0], pt1[1], pt2[0], pt2[1]];
			found = false;
			for (var k in lines)
			{
				var line2 = lines[k];
				if (detectSegmentIntersect(line1, line2))
				{
					found = true;
					break;
				}
			}
			if (!found)
			{
				links.push(line1);
				pt1[2].childs.push(pt2[2]);
				pt2[2].childs.push(pt1[2]);
			}
		}
	}

	printGraphItem(points[0][2]);

	Screen.get().debug_items = [];

	Screen.get().debug_items.push(function(ctx) {
		var colors = [
			"#FFFF00",
			"#FF00FF",
			"#FF0000",
			"#00FFFF",
			"#00FF00",
			"#0000FF"
		];
		for (var j in blocks)
		{
			var p_i = blocks[j];
			console.debug("block", p_i);
			ctx.fillStyle=colors[j % colors.length];
			ctx.fillRect(p_i[0], p_i[2], p_i[1] - p_i[0], p_i[3] - p_i[2]);
		}
	});

	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		ctx.strokeStyle="#0000FF";
		for (var j in lines)
		{
			var p_i = lines[j];
			console.debug("line", p_i);
			ctx.moveTo(p_i[0], p_i[1]);
			ctx.lineTo(p_i[2], p_i[3]);
		}
		ctx.closePath();
		ctx.stroke();
	});

	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		ctx.strokeStyle="#0000FF";
		size = 2
		for (var j in points)
		{
			var p_i = points[j];
			console.debug("point", p_i);
			ctx.moveTo(p_i[0] - size, p_i[1] - size);
			ctx.lineTo(p_i[0] + size, p_i[1] + size);
			ctx.moveTo(p_i[0] + size, p_i[1] - size);
			ctx.lineTo(p_i[0] - size, p_i[1] + size);
		}
		ctx.closePath();
		ctx.stroke();
	});

	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		ctx.strokeStyle="#FFFFFF";
		for (var j in links)
		{
			var p_i = links[j];
			console.debug("link", p_i);
			ctx.moveTo(p_i[0], p_i[1]);
			ctx.lineTo(p_i[2], p_i[3]);
		}
		ctx.closePath();
		ctx.stroke();
	});

	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		for (var j in res)
		{
			var p_i = res[j];
			ctx.lineTo(p_i[0], p_i[1]);
		}
		ctx.strokeStyle="#FF0000";
		ctx.closePath();
		ctx.stroke();
	});

	Screen.get().setUpdateNeeded(true);

	return res;
}

function printGraphItem(graph_item, level, parents)
{
	if (!level)
	{
		level = 1
	}
	if (!parents)
	{
		parents = [];
	}
	parents2 = parents.slice(0);
	parents2.push(graph_item);
	console.debug("  ".repeat(level), graph_item.x, graph_item.y, level);
	if (graph_item.x != 288 || graph_item.y != 160)
	{
		for (var i in graph_item.childs)
		{
			var found = false;
			for (var j in parents2)
			{
				if (graph_item.childs[i] == parents2[j])
				{
					found = true;
					break;
				}
			}
			if (!found)
			{
				printGraphItem(graph_item.childs[i], level + 1, parents2);
			}
		}
	}
}

function GraphItem(x, y)
{
	this.x = x;
	this.y = y;
	this.childs = [];
}

function detectSegmentIntersect(line1, line2)
{
	var res = false

	var x1 = line1[0];
	var y1 = line1[1];
	var x2 = line1[2];
	var y2 = line1[3];

	var x3 = line2[0];
	var y3 = line2[1];
	var x4 = line2[2];
	var y4 = line2[3];

	var d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	if (d != 0)
	{
		var xi = ((x3 - x4) * (x1 * y2 - y1 * x2) - (x1 - x2) * (x3 * y4 - y3 * x4)) / d;
		var yi = ((y3 - y4) * (x1 * y2 - y1 * x2) - (y1 - y2) * (x3 * y4 - y3 * x4)) / d;

		if (!(xi < Math.min(x1, x2) || xi > Math.max(x1, x2) ||
			  xi < Math.min(x3, x4) || xi > Math.max(x3, x4) ||
			  yi < Math.min(y1, y2) || yi > Math.max(y1, y2) ||
			  yi < Math.min(y3, y4) || yi > Math.max(y3, y4)))
		{
			//point = xi, yi
			res = true;
		}
	}
	return res;
}
