// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function extend(base, sub) {
	// Avoid instantiating the base class just to setup inheritance
	// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
	// for a polyfill
	// Also, do a recursive merge of two prototypes, so we don't overwrite 
	// the existing prototype, but still maintain the inheritance chain
	// Thanks to @ccnokes
	var origProto = sub.prototype;
	sub.prototype = Object.create(base.prototype);
	for (var key in origProto)  {
		sub.prototype[key] = origProto[key];
	}
	// Remember the constructor property was set wrong, let's fix it
	sub.prototype.constructor = sub;
	// In ECMAScript5+ (all modern browsers), you can make the constructor property
	// non-enumerable if you define it like this instead
	Object.defineProperty(sub.prototype, 'constructor', {
		enumerable: false,
		value: sub
	});
}

function loadImageData(src)
{
	var img = g_images[src];
	var w = img["w"];
	var h = img["h"];
	var img_w = img["total_w"];
	var img_h = img["total_h"];

	var line_size = img_h;
	var line_step = h;
	var col_size = img_w;
	var col_step = w;

	if (img["orientation"] == "v")
	{
		line_size = img_w;
		line_step = w;
		col_size = img_h;
		col_step = h;
	}

	var anim_index = 0;
	var frames = [];
	for (var i = 0; i < line_size; i += line_step)
	{
		for (var j = 0; j < col_size; j += col_step)
		{
			if (frames.length <= anim_index)
			{
				frames.push([]);
			}

			var frame = document.createElement("canvas");
			frame.width = w;
			frame.height = h;
			if (img["orientation"] == "v")
			{
				frame.getContext("2d").drawImage(img["img"], i, j, w, h, 0, 0, w, h);
			}
			else
			{
				frame.getContext("2d").drawImage(img["img"], j, i, w, h, 0, 0, w, h);
			}
			frame.img_data = frame.getContext("2d").getImageData(0, 0, w, h);
			frames[anim_index].push(frame);

			if (frames[anim_index].length >= img["animation"][anim_index])
			{
				anim_index += 1;
			}
		}
	}
	g_images[src]["frames"] = frames;
}

