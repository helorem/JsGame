function PhysicItem(x, y, img_file)
{
	GraphicItem.call(this, x, y, img_file);
}
extend(GraphicItem, PhysicItem);

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
