var BUTTON_LEFT = 1;
var BUTTON_RIGHT = 2;

function ControlManager()
{
}

ControlManager.get = function()
{
	if (!arguments.callee.instance)
	{
		arguments.callee.instance = new ControlManager();
	}
	return arguments.callee.instance
}

ControlManager.prototype.init = function(screen_elm, action_elm)
{
	this.screen_elm = screen_elm;
	this.action_elm = action_elm;
	
	var me = this;
	this.screen_elm.addEventListener("contextmenu", function(evt) { evt.preventDefault(); });
	this.screen_elm.addEventListener("mousedown", function(evt) { me.onMouseDown(evt); });
	this.screen_elm.addEventListener("mouseup", function(evt) { me.onMouseUp(evt); });
	this.screen_elm.addEventListener("mousemove", function(evt) { me.onMouseMove(evt); });
}

ControlManager.prototype.getMode = function()
{
	return this.action_elm.value;
}

ControlManager.prototype._resolvePosition = function(evt)
{
	var x;
	var y;
	if (evt.pageX || evt.pageY)
	{
		x = evt.pageX;
		y = evt.pageY;
	}
	else
	{
		x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	x -= this.screen_elm.offsetLeft;
	y -= this.screen_elm.offsetTop;

	return [evt.buttons, x, y];
}

ControlManager.prototype.onMouseDown = function(evt)
{
	evt.preventDefault();

	Screen.get().beginSelectionSquare(this._resolvePosition(evt));
}

ControlManager.prototype.onMouseUp = function(evt)
{
	evt.preventDefault();

	if (Screen.get().selection_square)
	{
		Screen.get().updateSelectionSquare(this._resolvePosition(evt));
		var square = Screen.get().selection_square;
		Screen.get().endSelectionSquare();
		
		if (square[1] == square[3] && square[2] == square[4])
		{
			//click
			this.onClick(square);
		}
		else
		{
			//selection
			this.onSelection(square);
		}
	}
}

ControlManager.prototype.onSelection = function(square)
{
	if (this.getMode() == "create_wall1")
	{
		WallManager.get().addWall(10, square[1], square[2], square[3], square[4]);
	}
	else if (this.getMode() == "create_wall2")
	{
		WallManager.get().addWall(11, square[1], square[2], square[3], square[4]);
	}
	else
	{
		if (square[0] == BUTTON_LEFT)
		{
			Screen.get().unselectAll();
			var items = Screen.get().getItemsIn(square[1], square[2], square[3], square[4]);
			for (var i in items)
			{
				Screen.get().select(items[i]);
			}
		}
	}
}

ControlManager.prototype.onMouseMove = function(evt)
{
	evt.preventDefault();

	if (Screen.get().selection_square && Screen.get().selection_square[0] == BUTTON_LEFT)
	{
		Screen.get().updateSelectionSquare(this._resolvePosition(evt));

	}
}

ControlManager.prototype.onClick = function(cursor)
{
	var button = cursor[0];
	var x = cursor[1];
	var y = cursor[2];

	if (this.getMode() == "create_creature")
	{
		this.actionCreateCreature(x, y, "images/scrub.png");
	}
	else
	{
		var item = Screen.get().getItemAt(x, y);
		if (item)
		{
			if (button == BUTTON_LEFT)
			{
				Screen.get().unselectAll();
				Screen.get().select(item);
			}
		}
		else
		{
			if (button == BUTTON_LEFT)
			{
				Screen.get().unselectAll();
			}
			else
			{
				var items = Screen.get().getSelected();
				for (var i in items)
				{
					if (this.getMode() == "find_path")
					{
						items[i].findPath(x, y);
					}
					else
					{
						this.actionMoveCreature(items[i], x, y);
					}
				}
			}
		}
	}
}

ControlManager.prototype.actionCreateCreature = function(x, y, image)
{
	console.debug("Create creature at", x, y);
	var item = new Creature(x, y, image);
	Screen.get().addItem(item);
}

ControlManager.prototype.actionMoveCreature = function(item, x, y)
{
	console.debug("Move creature to", x, y);
	item.moveTo(x, y);
}
