function GraphicItem(x, y, img_file)
{
	this.x = x;
	this.y = y;
	this.sprite = new Sprite(img_file);
	this.sprite.setPosition(this.x, this.y);
}

GraphicItem.prototype.update = function(timestamp)
{
	this.sprite.update(timestamp);
}

