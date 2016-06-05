COLLISION_BOX = 1;
COLLISION_CIRCLE = 2;

function testCircleCollision(item1, item2)
{
	res = false;
	if (item2.collision_type == COLLISION_CIRCLE)
	{
		var vec_x = item1.circle[0] - item2.circle[0];
		var vec_y = item1.circle[1] - item2.circle[1];
		var size = item1.circle[2] + item2.circle[2];

		res = (size * size) > ((vec_x * vec_x) + (vec_y * vec_y));
	}
	else if (item2.collision_type  == COLLISION_BOX)
	{
		var vec_x1;
		var vec_x2;
		var vec_y;
		var vec_x1_2;
		var vec_x2_2;
		var vec_y_2;
		var size = item1.circle[2] * item1.circle[2];

		vec_y = item1.circle[1] - item2.square[2];
		vec_y_2 = vec_y * vec_y;

		vec_x1 = item1.circle[0] - item2.square[0];
		vec_x1_2 = vec_x1 * vec_x1;

		res = size > (vec_x1_2 + (vec_y_2));
		if (res)
		{
			return res;
		}

		vec_x2 = item1.circle[0] - item2.square[1];
		vec_x2_2 = vec_x2 * vec_x2;

		res = size > (vec_x_2 + (vec_y_2));
		if (res)
		{
			return res;
		}

		vec_y = item1.circle[1] - item2.square[3];
		vec_y_2 = vec_y * vec_y;

		res = size > (vec_x1_2 + (vec_y_2));
		if (res)
		{
			return res;
		}

		res = size > (vec_x_2 + (vec_y_2));
		if (res)
		{
			return res;
		}
	}
	return res
}

function PhysicItem(x, y, img_file)
{
	GraphicItem.call(this, x, y, img_file);
	this.collision_type = COLLISION_CIRCLE;
	this.square = [0, 0, 0, 0];
	this.circle = [0, 0, this.selection_size / 2];

	// TODO debug only --------------------
	var me = this;
	Screen.get().debug_items["collision" + Screen.get().items.length] = function(ctx) {
		if (document.getElementById("chk_collision").checked)
		{
			ctx.beginPath();
			ctx.strokeStyle = "#FFFF00";
			ctx.arc(me.circle[0], me.circle[1], me.circle[2], 0, 2*Math.PI);
			ctx.closePath();
			ctx.stroke();
		}
	};

	Screen.get().setUpdateNeeded(true);
	//-------------


	this.calcShapes();
}
extend(GraphicItem, PhysicItem);

PhysicItem.prototype.calcShapes = function()
{
	var left = this.x - (this.selection_size / 2);
	var right = left + this.selection_size;
	var up = this.y - (this.selection_size / 2);
	var down = up + this.selection_size;
	this.square[0] = left;
	this.square[1] = right;
	this.square[2] = up;
	this.square[3] = down;
	this.circle[0] = this.x;
	this.circle[1] = this.y;
}

PhysicItem.prototype.getCollisionBox = function(item)
{
	var left = this.square[0];
	var right = this.square[1];
	var up = this.square[2];
	var down = this.square[3];

	var o_left = item.square[0];
	var o_right = item.square[1];
	var o_up = item.square[2];
	var o_down = item.square[3];

	var box  = [0, 0, 0, 0];
	box[0] = Math.max(left, o_left);
	box[1] = Math.min(right, o_right);
	box[2] = Math.max(up, o_up);
	box[3] = Math.min(down, o_down);

	return box;
}

PhysicItem.prototype.isColliding = function(other)
{
	res = false;
	if (this.collision_type == COLLISION_CIRCLE)
	{
		res = testCircleCollision(this, other);
	}
	else if (other.collision_type == COLLISION_CIRCLE)
	{
		res = testCircleCollision(other, this);
	}
	else
	{
		var box = this.getCollisionBox(other);
		res = (box[0] <= box[1] && box[2] <= box[3]);
	}
	return res;
}

/**
PhysicItem.prototype.isColliding = function(other)
{
	res = false;

	var left = this.x - (this.sprite.w / 2);
	var right = left + this.sprite.w;
	var up = this.y - (this.sprite.h / 2);
	var down = up + this.sprite.h;

	var o_left = other.x - (other.sprite.w / 2);
	var o_right = o_left + other.sprite.w;
	var o_up = other.y - (other.sprite.h / 2);
	var o_down = o_up + other.sprite.h;

	var box  = [0, 0, 0, 0];
	box[0] = Math.max(left, o_left);
	box[1] = Math.max(up, o_up);
	box[2] = Math.min(right, o_right);
	box[3] = Math.min(down, o_down);

	if (box[0] <= box[2] && box[1] <= box[3])
	{
		//Possible collision
		var pixels = this.sprite.getFrame().img_data;
		var o_pixels = other.sprite.getFrame().img_data;
		for (var y = box[1]; y < box[3]; ++y)
		{
			for (var x = box[0]; x < box[2]; ++x)
			{
				var frame_x = x - left;
				var frame_y = y - up;
				var frame_w = this.sprite.w;
				var i = ((frame_y * frame_w) + frame_x) * 4;
				var pix = pixels.data[i + 3];

				var o_frame_x = x - o_left;
				var o_frame_y = y - o_up;
				var o_frame_w = other.sprite.w;
				var o_i = ((o_frame_y * o_frame_w) + o_frame_x) * 4;
				var o_pix = o_pixels.data[o_i + 3];

				if (pix != 0 && o_pix != 0)
				{
					res = true;
					break;
					break;
				}
			}
		}
	}
	return res;
}
**/


