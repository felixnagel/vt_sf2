function Map(settings){
	this.jBlockData = settings.jBlockData;
	this.iTilesize = settings.iTilesize;
	this.iStrokeOversize = settings.iStrokeOversize;
	this.sFaceUrl = settings.sFaceUrl;
	this.sSpritesheets = settings.sSpritesheets;
	this.sSpritesheetUrl = settings.sSpritesheetUrl;
	this.sStrokeUrl = settings.sStrokeUrl;
	this.oImg = settings.oImg;
	this.oGameCanvas = settings.oGameCanvas;
	this.oMapContainer = settings.oMapContainer;
	this.oCameraContainer = settings.oCameraContainer;
	this.oBg = settings.oBg;

	this.update_viewport();
}

Map.prototype = {
	_jQ: {},
	_iFaceEdge: null,
	_iStrokeEdge: null,
	_bStrokesLoaded: false,
	_bFacesLoaded: false,
	_iMOVF: 0.4,

	update_viewport: function update_viewport(){
		this.iViewportWidth = this.oGameCanvas.clientWidth;
		this.iViewportHeight = this.oGameCanvas.clientHeight;
	},

	draw_on_canvas: function draw_on_canvas(){
		var 
			self = this,
			oCanvas = document.createElement('canvas'),
			oStage = new createjs.Stage(oCanvas),
			iCanvasX = 0,
			iCanvasY = 0;

		for(var i in this.jBlockData.content){
			if(this.jBlockData.content[i].x > iCanvasX){
				iCanvasX = +this.jBlockData.content[i].x;
			}
			if(this.jBlockData.content[i].y > iCanvasY){
				iCanvasY = +this.jBlockData.content[i].y;
			}
		}

		oCanvas.width = (iCanvasX+1)*this.iTilesize + this.iStrokeOversize;
		oCanvas.height = (iCanvasY+1)*this.iTilesize + this.iStrokeOversize;

		/*
		for(var i in this.jBlockData.content){
			var oBitmap = new createjs.Bitmap(self._jQ[this.jBlockData.content[i].id].stroke);
			oBitmap.regX = 0.5*oBitmap.image.width;
			oBitmap.regY = 0.5*oBitmap.image.height;
			oBitmap.x = this.jBlockData.content[i].x*this.iTilesize+0.5*(oBitmap.image.width-this.iStrokeOversize) >> 0;
			oBitmap.y = this.jBlockData.content[i].y*this.iTilesize+0.5*(oBitmap.image.height-this.iStrokeOversize) >> 0;
			oBitmap.rotation = this.jBlockData.content[i].r >> 0;
			oStage.addChild(oBitmap);
		}
		*/

		for(var i in this.jBlockData.content){
			var oBitmap = new createjs.Bitmap(self._jQ[this.jBlockData.content[i].id].face);
			oBitmap.regX = 0.5*oBitmap.image.width;
			oBitmap.regY = 0.5*oBitmap.image.height;
			oBitmap.x = this.jBlockData.content[i].x*this.iTilesize+0.5*(oBitmap.image.width+this.iStrokeOversize) >> 0;
			oBitmap.y = this.jBlockData.content[i].y*this.iTilesize+0.5*(oBitmap.image.height+this.iStrokeOversize) >> 0;
			oBitmap.rotation = this.jBlockData.content[i].r >> 0;
			oStage.addChild(oBitmap);
		}


		oStage.update();
		this.oImg.src = oCanvas.toDataURL('image/png');
	},



	update_camera: function update_camera(x, y, vxRel, vyRel){
		/*
		this.oMapContainer.style.left = ((0.5*this.iViewportWidth - x) >> 0) + 'px';
		this.oMapContainer.style.top = ((0.5*this.iViewportHeight - y) >> 0) + 'px';
		this.oCameraContainer.style.left = ((-Math.pow(Math.sin(vxRel*this._iMOVF*0.5*Math.PI), 2)*this.sign(vxRel)*0.5*this.iViewportWidth) >> 0) + 'px';
		this.oCameraContainer.style.top = ((-Math.pow(Math.sin(vyRel*this._iMOVF*0.5*Math.PI), 2)*this.sign(vyRel)*0.5*this.iViewportHeight) >> 0) + 'px';
		*/

		this.oBg.style.transform = 'translate('+ ((-x/5) >> 0) + 'px, '+ ((- y/5) >> 0) +'px)';
		this.oMapContainer.style.transform = 'translate('+ ((0.5*this.iViewportWidth - x) >> 0) + 'px, '+ ((0.5*this.iViewportHeight - y) >> 0) +'px)';
		this.oCameraContainer.style.transform = 'translate('+ ((-Math.pow(Math.sin(vxRel*this._iMOVF*0.5*Math.PI), 2)*this.sign(vxRel)*0.5*this.iViewportWidth) >> 0) + 'px, '+ ((-Math.pow(Math.sin(vyRel*this._iMOVF*0.5*Math.PI), 2)*this.sign(vyRel)*0.5*this.iViewportHeight) >> 0) +'px)';
	},

	sign: function sign(number){
		return number < 0 ? -1 : 1;
	},


	load_blocks: function load_blocks(){
		for(var i in this.jBlockData.content){
			this.add_to_q(this.jBlockData.content[i].id);
		}
		this.load_all_images();
	},

	on_image_loaded: function on_image_loaded(iProgressionStatus){
		if(iProgressionStatus === 100){
			this.draw_on_canvas();
		}
		//console.log(iProgressionStatus);
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
			
			!function(id){
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
			}(id);
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

		return Math.round(iLoaded/iCount*100);
	}
};