function Grid(grating){
	this.grating = grating;
};
Grid.prototype = {
	abs_to_grid: function abs_to_grid(x){
		return Math.floor(x/this.grating);
	},
	abs_to_snapped: function abs_to_snapped(x){
		return this.grating*Math.floor(x/this.grating);
	},
	abs_to_rel: function abs_to_rel(x){
		return x - this.grating*Math.floor(x/this.grating);
	},
	grid_to_snapped: function grid_to_snapped(x){
		return this.grating*x;
	},
	grid_to_snapped_centered: function grid_to_snapped_centered(x){
		return this.grating*x+0.5*this.grating;
	},

	/**
	* Draws all block's hit areas on a given canvas and optionally on an image
	*
	* @param string canvasId The id of the canvas
	* @param string categoryKey The category key where the blocks are located
	* @param string imgId The id of the image to copy the content on (optional)
	*
	* @return undefined
	*/
	/*
	plot : function plot(canvasId){
		//the canvas to print this block (debug)
		var canvas = document.getElementById(canvasId),
			ctx = canvas.getContext('2d');

		//loop columns
		for(var xGrid = 0; xGrid < this.width; ++xGrid){
			//loop rows
			for(var yGrid = 0; yGrid < this.height; ++yGrid){
				var block = this.getContent(xGrid, yGrid, categoryKey);
				//loop width
				if(block){
					for(var xRel = 0; xRel < this.grating; ++xRel){
						//loop height
						for(var yRel = 0; yRel < this.grating; ++yRel){
							if(block.hittest(xRel, yRel)){
								ctx.fillRect(xRel + xGrid * this.grating, yRel + yGrid * this.grating, 1, 1);
							}
						}
					}
				}
			}
		}

		if(imgId){
			document.getElementById(imgId).src = this.canvas.toDataURL();
		}

	}
	*/
};
