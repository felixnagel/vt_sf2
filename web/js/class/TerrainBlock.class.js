'use strict';
/**
* Class TerrainBlock
*/
function TerrainBlock(blockType, rot){
	var options = {
		htf : this.blockTypes[blockType],
		edge : this.edge,
		rot : rot
	}

	this.type = blockType;

	/**
	 * call parent
	 */
	AlphaBlock.call(this, options);
}

/**
 * inheritance
 */
TerrainBlock.prototype = Object.create(AlphaBlock.prototype);
TerrainBlock.prototype.constructor = TerrainBlock;

/**
 * members
 */
TerrainBlock.prototype.edge = 400;
TerrainBlock.prototype.blockTypes = {};

AlphaBlock.prototype.plot = function plot(canvasId){
	// the canvas to print this block (debug)
	var
		canvas = document.getElementById(canvasId),
		ctx    = canvas.getContext('2d');

	// clear canvas
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000000';

	// loop width
	for(var xAbs = 0; xAbs < this.edge; ++xAbs){
		// loop height
		for(var yAbs = 0; yAbs < this.edge; ++yAbs){
			if(this.hittest(xAbs, yAbs)){

				ctx.fillRect(xAbs, yAbs, 1, 1);
			}
		}
	}

	return canvas.toDataURL();
};

// basic block types
TerrainBlock.prototype.blockTypes.circleCurve = function(x,y,a){
	x = 0.5 * (x + a / 2);
	y = 0.5 * (y - a / 2);
	return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) > a / 2;
};
TerrainBlock.prototype.blockTypes._circleCurve = function(x,y,a){
	return !this.blockTypes.circleCurve(x,y,a);
};
TerrainBlock.prototype.blockTypes.circle = function(x,y,a){
	return Math.sqrt(Math.pow(x,2) + Math.pow(y,2)) < a/2;
};
TerrainBlock.prototype.blockTypes.constant = function(x,y,a){
	return y > 0;
};
TerrainBlock.prototype.blockTypes.stepSinus1 = function(x,y,a){
	x = x / (0.5*a) * 0.5*Math.PI;
	y = y / (0.5*a);
	return Math.sin(x) > y;
};
TerrainBlock.prototype.blockTypes.solid = function(x,y,a){
	return true;
};
TerrainBlock.prototype.blockTypes._solid = function(x,y,a){
	return !this.blockTypes.solid(x,y,a);
};
TerrainBlock.prototype.blockTypes.triangle = function(x,y,a){
	return x > y;
};
