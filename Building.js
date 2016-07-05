function Building(x, y, img_file)
{
	PhysicItem.call(this, x, y, img_file);

	this.items = [];
}
extend(PhysicItem, Building);

Building.prototype.onCollision = function(item)
{
	res = false;
	item.setBuilding(this);
	return res;
}

Building.prototype.onCollisionOver = function(item)
{
	item.setBuilding(null);
}

Building.prototype.onEnter = function(item)
{
	console.debug("Enter the building");
	if (this.items <= 0)
	{
		this.sprite.setAnimationIndex(1);
	}
	this.items.push(item);
}

Building.prototype.onExit = function(item)
{
	console.debug("Exit the building");
	this.items.splice(this.items.indexOf(item), 1);
	if (this.items.length <= 0)
	{
		this.sprite.setAnimationIndex(0);
	}
}

