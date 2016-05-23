function Creature(x, y, img_file)
{
	PhysicItem.call(this, x, y, img_file);

	this.direction = 0;
	this.steps = null;
	this.path = null;
}
extend(PhysicItem, Creature);

Creature.prototype.setDirection = function(direction)
{
	this.direction = DIRECTIONS.indexOf(direction);
	this.sprite.setIndex(this.direction);
}

Creature.prototype.turn = function(mod)
{
	var current_dir = this.direction;
	var new_dir = current_dir + mod;
	if (new_dir < 0)
	{
		new_dir += DIRECTIONS.length;
	}
	new_dir %= DIRECTIONS.length;
	this.setDirection(DIRECTIONS[new_dir]);
}

Creature.prototype.findPath = function(dst_x, dst_y)
{
	this.path = [
			[dst_x, dst_y]
		];
}

Creature.prototype.moveTo = function(x, y, callback)
{
	var vec_x = x - this.x;
	var vec_y = y - this.y;

	var speed = MOVE_SPEED;

	var distance = Math.sqrt((vec_x * vec_x) + (vec_y * vec_y));
	var step_count = distance / MOVE_STEP;

	var step_x = vec_x / step_count;
	var step_y = vec_y / step_count;

	// Define direction
	var is_S = vec_y > 0;
	var is_E = vec_x > 0;
	var ratio = Math.abs(vec_y) / Math.abs(vec_x);
	var is_up = ratio > RATIO_DIRECTION[1];
	var is_down = ratio < RATIO_DIRECTION[0];

	var dir = "";
	var area1 = "";
	var area2 = "";

	if (vec_y > 0)
	{
		area1 = "S";
	}
	else
	{
		area1 = "N";
	}

	if (vec_x > 0)
	{
		area2 = "E";
	}
	else
	{
		area2 = "W";
	}

	if (ratio > RATIO_DIRECTION[1])
	{
		dir = area1;
	}
	else if (ratio < RATIO_DIRECTION[0])
	{
		dir = area2;
	}
	else
	{
		dir = area1 + area2;
	}
	this.setDirection(dir);

	this.sprite.startAnimation([0, 1, 2, 1], 200); // TODO variable
	this.steps = {"step_x" : step_x, "step_y" : step_y, "count" : step_count, "x" : x, "y" : y, "speed" : speed, "timestamp" : 0, "callback" : callback};
}

Creature.prototype.move = function(vec_x, vec_y, callback)
{
	var x = this.x + vec_x;
	var y = this.y + vec_y;
	this.moveTo(x, y, callback);
}

Creature.prototype.update = function(timestamp)
{
	if (this.steps != null)
	{
		if (timestamp >= this.steps["timestamp"])
		{
			var x = this.x;
			var y = this.y;
			if (this.steps["count"] > 0)
			{
				this.x += this.steps["step_x"];
				this.y += this.steps["step_y"];
				this.steps["timestamp"] = timestamp + this.steps["speed"];
			}
			else
			{
				this.x = this.steps["x"];
				this.y = this.steps["y"];
			}

			//Collision
			var collision = false;
			this.calcShapes();
			console.debug("test collision", this.x, this.y, this.selection_size, this.square);
			var item;
			var items = Screen.get().background_items;
			for (var i in items)
			{
				item = items[i];
				if (item != this && this.isColliding(item))
				{
					console.debug("collision detected with", item.x, item.y, item.square);
					collision = true;
					break;
				}
			}
			if (!collision)
			{
				var items = Screen.get().items;
				for (var i in items)
				{
					item = items[i];
					if (item != this && this.isColliding(item))
					{
						console.debug("collision detected with", item.x, item.y, item.square);
						collision = true;
						break;
					}
				}
			}

			if (collision)
			{
				this.steps["count"] = -1;
				this.x = x;
				this.y = y;
			}
			else
			{
				this.steps["count"] -= 1;
				var res = this.sprite.setPosition(this.x, this.y);
				this.x = res[0];
				this.y = res[1];
			}

			if (this.steps["count"] < 0)
			{
				var callback = this.steps["callback"];
				this.steps = null;
				this.sprite.stopAnimation();
				if (callback)
				{
					callback();
				}
			}
		}
	}
	GraphicItem.prototype.update.call(this, timestamp);
}


