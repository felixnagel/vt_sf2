'use strict';
/**
* Class TerrainBlock
*/
function TerrainBlock(edge, htf, rot){
	var 
		options = {
			htf: this[htf],
			edge: edge,
			rot: rot
		};

	// call parent
	AlphaBlock.call(this, options);


	this.plot = function plot(canvasId, imgId){
		var 
			canvas = document.getElementById(canvasId),
			ctx = canvas.getContext('2d'),
			stepX = 1,
			stepY = 1;

		ctx.fillStyle="#000";

		for(var x = 0; x < this.edge; x += stepX){
			for(var y = 0; y < this.edge; y += stepY){
				if(this.hittest(x, y)){

					ctx.fillRect(x, y, stepX, stepY);
				}
			}
		}
		if(imgId){
			document.getElementById(imgId).src = canvas.toDataURL();
		}
	};
}

/**
 * inheritance
 */
TerrainBlock.prototype = Object.create(AlphaBlock.prototype);
TerrainBlock.prototype.constructor = TerrainBlock;

// edge (e)
TerrainBlock.prototype.e01 = function(x,y,a){
	return true;
};
TerrainBlock.prototype.e11 = function(x,y,a){
	return y<0 && x>0;
};
TerrainBlock.prototype.e12 = function(x,y,a){
	return x>0;
};
TerrainBlock.prototype.e13 = function(x,y,a){
	return y<0 || x>0;
};
TerrainBlock.prototype.e21 = function(x,y,a){
	return this.e22(x-a/2,y,a);
};
TerrainBlock.prototype.e22 = function(x,y,a){
	return x>y;
};
TerrainBlock.prototype.e23 = function(x,y,a){
	return this.e22(x,y-a/2,a);
};

// circle (c)
TerrainBlock.prototype.c01 = function(x,y,a){
	return Math.sqrt(Math.pow(x,2)+Math.pow(y,2)) < a/2;
};
TerrainBlock.prototype.c02 = function(x,y,a){
	return this.c01(2*x,2*y,a);
};
TerrainBlock.prototype.c11 = function(x,y,a){
	return this.e21(x,y,a) && !this.c01(x,y,a);
};
TerrainBlock.prototype.c12 = function(x,y,a){
	return !this.c01(x+a/2,y-a/2,2*a);
};
TerrainBlock.prototype.c13 = function(x,y,a){
	return !this.c01(x+a/2,y-a/2,a);
};
TerrainBlock.prototype.c21 = function(x,y,a){
	return this.c01(x-a/2,y+a/2,a);
};
TerrainBlock.prototype.c22 = function(x,y,a){
	return this.c01(x-a/2,y+a/2,2*a);
};
TerrainBlock.prototype.c23 = function(x,y,a){
	return this.c01(x,y,a) || this.e13(x,y,a);
};

// sinus (s)
TerrainBlock.prototype.s11 = function(x,y,a){
	return  x>0 && this.s12(2*x-a/2,2*y+a/2,a);
};
TerrainBlock.prototype.s12 = function(x,y,a){
	return Math.sin(x/(a/2)*Math.PI/2) > y/(a/2);
};
TerrainBlock.prototype.s13 = function(x,y,a){
	return  x>0 || this.s12(2*x+a/2,2*y-a/2,a);
};
TerrainBlock.prototype.s21 = function(x,y,a){
	return y<0 && this.s22(2*x-a/2,2*y+a/2,a);
};
TerrainBlock.prototype.s22 = function(x,y,a){
	return this.s12(-y,-x,a);
};
TerrainBlock.prototype.s23 = function(x,y,a){
	return y<0 || this.s22(2*x+a/2,2*y-a/2,a);
};