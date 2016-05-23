function findPath(x1, y1, x2, y2)
{
	var res = [];

	console.debug("draw path from", x1, y1);
	console.debug("to", x2, y2);
	res.push([x2, y2]);


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
					break;
				}
				else if (blk1[3] == blk2[2])
				{
					blocks[i][2] = blk1[2];
					found = true;
					break;
				}
			}
			else if (blk1[2] == blk2[2] && blk1[3] == blk2[3])
			{
				//up && down match
				if (blk1[0] == blk2[1])
				{
					blocks[i][1] = blk1[1];
					found = true;
					break;
				}
				else if (blk1[1] == blk2[0])
				{
					blocks[i][0] = blk1[0];
					found = true;
					break;
				}
			}
		}

		if (!found)
		{
			blocks.push(blk1);
		}

		current_wall = current_wall.previous;
	}

	var points = [];

	var item;
	var items = Screen.get().background_items;

	var insert_point = function(x, y)
	{
		var found = false;
		for (var i in points)
		{
			if (points[i][0] == x && points[i][1] == y)
			{
				points[i][2] += 1
				found = true;
				break;
			}
		}
		if (!found)
		{
			points.push([x, y, 1]);
		}

	}

	for (var i in items)
	{
		item = items[i];
		insert_point(item.square[0], item.square[2]);
		insert_point(item.square[0], item.square[3]);
		insert_point(item.square[1], item.square[2]);
		insert_point(item.square[1], item.square[3]);
	}

	var links = [];

	for (var i  = 0; i < points.length; ++i)
	{
		var pt1 = points[i];
		if (pt1[2] == 1)
		{
			for (var j = i + 1; j < points.length; ++j)
			{
				var pt2 = points[j];
				if (pt2[2] == 1)
				{
					links.push([pt1[0], pt1[1], pt2[0], pt2[1]]);
				}
			}
		}
	}


	Screen.get().debug_items = [];

	Screen.get().debug_items.push(function(ctx) {
		ctx.fillStyle="#FF00FF";
		for (var j in blocks)
		{
			var p_i = blocks[j];
			console.debug(p_i);
			ctx.fillRect(p_i[0], p_i[2], p_i[1] - p_i[0], p_i[3] - p_i[2]);
		}
	});
/*
	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		for (var j in links)
		{
			var p_i = links[j];
			ctx.moveTo(p_i[0], p_i[1]);
			ctx.lineTo(p_i[2], p_i[3]);
		}
		ctx.strokeStyle="#FFFFFF";
		ctx.closePath();
		ctx.stroke();
	});

	Screen.get().debug_items.push(function(ctx) {
		ctx.beginPath();
		for (var j in points)
		{
			var p_i = points[j];
			if (p_i[2] == 1)
			{
				ctx.rect(p_i[0], p_i[1], 1, 1);
			}
		}
		ctx.strokeStyle="#0000FF";
		ctx.closePath();
		ctx.stroke();
	});
*/
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
