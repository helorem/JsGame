function Server()
{
}

Server.get = function()
{
	if (!arguments.callee.instance)
	{
		arguments.callee.instance = new Server();
	}
	return arguments.callee.instance
}

Server.prototype.init = function(url)
{
	this.callbacks = [];

	this.websocket = new WebSocket(url);

	var me = this;
	this.websocket.onopen = function(evt) { me.onOpen(evt); };
	this.websocket.onclose = function(evt) { me.onClose(evt) };
	this.websocket.onmessage = function(evt) { me.onMessage(evt) };
	this.websocket.onerror = function(evt) { me.onError(evt) };

}

Server.prototype.addCallback = function(callback)
{
	this.callbacks.push(callback);
}

Server.prototype.send = function(data)
{
	this.websocket.send(data);
}

Server.prototype.onOpen = function(evt)
{
	console.debug("open");
}

Server.prototype.onClose = function(evt)
{
	console.debug("close");
}

Server.prototype.onMessage = function(evt)
{
	for (var i in this.callbacks)
	{
		this.callbacks[i](evt.data);
	}
}

Server.prototype.onError = function(evt)
{
	console.error(evt.data);
	this.websocket.close();
}

