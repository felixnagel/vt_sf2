function Map(settings){
	this.iTilesize = settings.iTilesize;
	this.sFaceUrl = settings.sFaceUrl;
	this.sStrokeUrl = settings.sStrokeUrl;
	this.iStrokeOversize = settings.iStrokeOversize;
	
	this._aBlocks = [];
	this._oImg = null;
	this._jQ = {};
	this._iMOVF = 0.4;
}

Map.prototype = {
	add_block: function add_block(id, x, y, r){
		this._aBlocks.push({id: id, x: x, y: y, r: r});
	},
	update_viewport: function update_viewport(oGameCanvas){
		this.iViewportWidth = oGameCanvas.clientWidth;
		this.iViewportHeight = oGameCanvas.clientHeight;
	},
	draw_on_canvas: function draw_on_canvas(){
		var 
			self = this,
			oCanvas = document.createElement('canvas'),
			ctx = oCanvas.getContext('2d'),
			oStage = new createjs.Stage(oCanvas),
			iCanvasX = 0,
			iCanvasY = 0,
			jBlock;

		for(var i in this._aBlocks){
			jBlock = this._aBlocks[i];
			if(jBlock.x > iCanvasX){
				iCanvasX = +jBlock.x;
			}
			if(jBlock.y > iCanvasY){
				iCanvasY = +jBlock.y;
			}
		}

		oCanvas.width = (iCanvasX+1)*this.iTilesize + this.iStrokeOversize;
		oCanvas.height = (iCanvasY+1)*this.iTilesize + this.iStrokeOversize;

		for(var i in this._aBlocks){
			jBlock = this._aBlocks[i];
			var oBitmap = new createjs.Bitmap(self._jQ[jBlock.id].stroke);
			oBitmap.regX = 0.5*oBitmap.image.width;
			oBitmap.regY = 0.5*oBitmap.image.height;
			oBitmap.x = jBlock.x*this.iTilesize+0.5*(oBitmap.image.width-this.iStrokeOversize) >> 0;
			oBitmap.y = jBlock.y*this.iTilesize+0.5*(oBitmap.image.height-this.iStrokeOversize) >> 0;
			oBitmap.rotation = jBlock.r >> 0;
			oStage.addChild(oBitmap);
		}

		for(var i in this._aBlocks){
			jBlock = this._aBlocks[i];
			var oBitmap = new createjs.Bitmap(self._jQ[jBlock.id].face);
			oBitmap.regX = 0.5*oBitmap.image.width;
			oBitmap.regY = 0.5*oBitmap.image.height;
			oBitmap.x = jBlock.x*this.iTilesize+0.5*(oBitmap.image.width+this.iStrokeOversize) >> 0;
			oBitmap.y = jBlock.y*this.iTilesize+0.5*(oBitmap.image.height+this.iStrokeOversize) >> 0;
			oBitmap.rotation = jBlock.r >> 0;
			oStage.addChild(oBitmap);
		}

		oStage.update();
		this._oImg.src = oCanvas.toDataURL('image/png');
	},
	update_camera: function update_camera(oMapContainer, oCameraContainer, x, y, vxRel, vyRel){
		oMapContainer.style.transform = 'translate('+ ((0.5*this.iViewportWidth - x) >> 0) + 'px, '+ ((0.5*this.iViewportHeight - y) >> 0) +'px)';
		oCameraContainer.style.transform = 'translate('+ ((-Math.pow(Math.sin(vxRel*this._iMOVF*0.5*Math.PI), 2)*this.sign(vxRel)*0.5*this.iViewportWidth) >> 0) + 'px, '+ ((-Math.pow(Math.sin(vyRel*this._iMOVF*0.5*Math.PI), 2)*this.sign(vyRel)*0.5*this.iViewportHeight) >> 0) +'px)';
	},
	sign: function sign(number){
		return number < 0 ? -1 : 1;
	},
	load_blocks: function load_blocks(oImg){
		this._oImg = oImg;
		for(var i in this._aBlocks){
			this.add_to_q(this._aBlocks[i].id);
		}
		this.load_all_images();
	},
	on_image_loaded: function on_image_loaded(iProgressionStatus){
		if(iProgressionStatus === 1){
			console.log('all faces/strokes loaded!');
			this.draw_on_canvas();
		}
	},
	add_to_q: function add_to_q(id){
		this._jQ[id] = {stroke: false, face: false};
	},
	load_all_images: function load_all_images(){
		var self = this;
		for(var id in this._jQ){
			var oImgStroke = new Image();
			oImgStroke.src = self.sStrokeUrl+id+'.png';
			
			var oImgFace = new Image();
			oImgFace.src = self.sFaceUrl+id+'.png';
			
			(function(id){
				oImgStroke.onload = function(event){
					self._jQ[id].stroke = this;
					var iProgressionStatus = self.get_progression_status();
					self.on_image_loaded(iProgressionStatus);
				};
				oImgFace.onload = function(event){
					self._jQ[id].face = this;
					var iProgressionStatus = self.get_progression_status();
					self.on_image_loaded(iProgressionStatus);
				};
			}(id));
		}
	},
	get_progression_status: function get_progression_status(){
		var
			iCount = 0,
			iLoaded = 0;

		for(var id in this._jQ){
			iCount++;
			if(this._jQ[id].stroke !== false){
				iLoaded++;
			}
			iCount++;
			if(this._jQ[id].face !== false){
				iLoaded++;
			}
		}
		return iLoaded/iCount;
	}
};