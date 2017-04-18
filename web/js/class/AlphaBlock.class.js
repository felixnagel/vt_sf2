'use strict';
/**
* Class AlphaBlock
*
* Base class to create and handle blocks
*
* The registration point of the block is at the top left.
* The origin point of the block is the block's center.
*
* Absolute coordinates are relative to the block's registration point.
* Relative coordinates are relative to the block's origin point.
*
* The hittest function htf(x,y) defines the block's hit area. This function has to return either true or false.
* I.e. For a block with triangle shaped hit area at x bottom left, htf(x,y) would be defined as:
*	htf = function htf(x, y){
*		return x < y;
*	}
*/


/**
* Constructor
*
* @param int rot The block's rotation in degrees
*/
function AlphaBlock(options){
	this.edge = options.edge;
	this.rot  = options.rot;
	this.htf  = options.htf;
	this.rad  = this.toRad(this.rot);
}

AlphaBlock.prototype = {
	_xRel : null,
	_yRel : null,
	_xRot : null,
	_yRot : null,

	toRad: function toRad(deg){
		return deg / 180 * Math.PI;
	},

	absToRelCoordX: function absToRelCoordX(coordAbs){
		return coordAbs - this.edge/2;
	},

	absToRelCoordY: function absToRelCoordY(coordAbs){
		return this.edge/2 - coordAbs;
	},

	rotateX: function rotateX(xRel, yRel){
		return Math.round(xRel * Math.cos(this.rad) - yRel * Math.sin(this.rad));
	},

	rotateY: function rotateY(xRel, yRel){
		return Math.round(xRel * Math.sin(this.rad) + yRel * Math.cos(this.rad));
	},

	hittest: function hittest(xAbs, yAbs){
		// transform given absolute coordinates to rotated relative coordinates
		this._xRel = this.absToRelCoordX(xAbs);
		this._yRel = this.absToRelCoordY(yAbs);
		this._xRot = this.rotateX(this._xRel, this._yRel);
		this._yRot = this.rotateY(this._xRel, this._yRel);

		// calculate and return hittest value
		return this.htf(this._xRot, this._yRot, this.edge);
	},

	/**
	* The block's hittest functions
	*
	* @param int xRel The relative x coordinate
	* @param int yRel The relative y coordinate
	* @param int a The edge length of the block
	*
	* @result bool Coordinates are within the block's hit area
	*/
	htf: function htf(x, y, a){
		return false;
	}
};
