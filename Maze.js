function MazeCase(x, y)
{
	this.x = x;
	this.y = y;
	this.opened = false;
	this.left = null;
	this.right = null;
	this.up = null;
	this.down = null;

	this.left_open = false;
	this.right_open = false;
	this.up_open = false;
	this.down_open = false;
}

function generateMaze(x, y, w, h)
{
	var blk_w = 32;
	var blk_h = 32;
	var array = [];
	var nb_cols = w / blk_w;
	var nb_rows = h / blk_h;
	var maze = [];
	for (var row = 0; row < nb_rows; ++row)
	{
		for (var col = 0; col < nb_cols; ++col)
		{
			if (col % 2 == 0 || row % 2 == 0)
			{
				array.push(1);
			}
			else
			{
				array.push(0);
				var m_c = new MazeCase(col, row);
				maze.push(m_c);
				var m_x = (col - 1) / 2;
				var m_y = (row - 1) / 2;
				if (m_x > 0)
				{
					//link left
					var i = m_y * Math.floor(nb_cols / 2) + m_x - 1;
					m_c.left = maze[i];
					maze[i].right = m_c;
				}
				if (m_y > 0)
				{
					var i = (m_y - 1) * Math.floor(nb_cols / 2) + m_x;
					m_c.up = maze[i];
					maze[i].down = m_c;
				}
			}
		}
	}

	var shuffleArray = function(arr) {
		for (var i = arr.length - 1; i > 0; i--)
		{
			var j = Math.floor(Math.random() * (i + 1));
			var temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}

	var inspect_case = function(mc)
	{
		mc.opened = true;
		var arr = [1, 2, 3, 4];
		shuffleArray(arr);
		for (var i in arr)
		{
			var door = arr[i];
			if (door == 1 && mc.left && !mc.left.opened)
			{
				mc.left_open = true;
				mc.left.right_open = true;
				inspect_case(mc.left);
			}
			else if (door == 2 && mc.right && !mc.right.opened)
			{
				mc.right_open = true;
				mc.right.left_open = true;
				inspect_case(mc.right);
			}
			else if (door == 3 && mc.up && !mc.up.opened)
			{
				mc.up_open = true;
				mc.up.down_open = true;
				inspect_case(mc.up);
			}
			else if (door == 4 && mc.down && !mc.down.opened)
			{
				mc.down_open = true;
				mc.down.up_open = true;
				inspect_case(mc.down);
			}
		}
	}

	inspect_case(maze[0]);

	//make opens
	maze[0].left_open= true;
	maze[maze.length - 1].right_open= true;
	
	// apply maze
	for (var i in maze)
	{
		var mc = maze[i];
		if (mc.left_open)
		{
			array[(mc.y * nb_cols) + mc.x - 1] = 0;
		}
		if (mc.up_open)
		{
			array[((mc.y - 1) * nb_cols) + mc.x] = 0;
		}
		if (mc.right_open)
		{
			array[(mc.y * nb_cols) + mc.x + 1] = 0;
		}
	}

	// draw maze
	var x2 = 0;
	var y2 = 0;
	for (var i in array)
	{
		if (array[i] == 1)
		{
			WallManager.get().addWall(11, x + x2, y + y2, x + x2, y + y2);
		}
		x2 += blk_w;
		if (x2 >= w)
		{
			x2 = 0;
			y2 += blk_h;
		}
	}
}
