function SimpleDisplay(settings){'use strict';
	// basic members
	this.jInstances =  {};
	this.jContainers = {};

	this.iCanvasWidth = settings.iWidth;
	this.iCanvasHeight = settings.iHeight;
	this.oCanvas = document.createElement('canvas');
	this.oCanvas.style.position = 'absolute';
	this.oCanvas.width = this.iCanvasWidth;
	this.oCanvas.height = this.iCanvasHeight;
	this.oStage = new createjs.Stage(this.oCanvas);
	
	document.getElementById(settings.sParentId).appendChild(this.oCanvas);
	
	// temp members
	this._i = 0;
}

SimpleDisplay.prototype = {
	position: function position(x, y){
		this.oCanvas.style.top = (y>>0)+'px';
		this.oCanvas.style.left = (x>>0)+'px';
	},

	add_container: function add_container(sCId, fParallaxF){
		var oNewContainer = new createjs.Container();

		oNewContainer.fParallaxF = 1;
		if(fParallaxF !== undefined){
			oNewContainer.fParallaxF = fParallaxF;
		}

		oNewContainer.x = 0;
		oNewContainer.y = 0;

		this.jContainers[sCId] = oNewContainer;
		this.oStage.addChild(oNewContainer);
	},
	position_container: function position_container(sCId, iNewX, iNewY){
		this.jContainers[sCId].x = (this.jContainers[sCId].fParallaxF * iNewX) >> 0;
		this.jContainers[sCId].y = (this.jContainers[sCId].fParallaxF * iNewY) >> 0;
	},
	add_instance: function add_instance(oNewInstance, sIId, sCId){
		oNewInstance.fParallaxF = this.jContainers[sCId].fParallaxF;
		oNewInstance.scaleX = this.jContainers[sCId].fParallaxF;
		oNewInstance.scaleY = this.jContainers[sCId].fParallaxF;
		this.jContainers[sCId].addChild(oNewInstance);
		this.jInstances[sIId] = oNewInstance;
	},
	position_instance: function position_instance(sIId, iNewX, iNewY, iNewRot, iNewOversize){
		if(!isNaN(iNewX)){
			this.jInstances[sIId].x = (this.jInstances[sIId].fParallaxF * iNewX) >> 0;
		}
		if(!isNaN(iNewY)){
			this.jInstances[sIId].y = (this.jInstances[sIId].fParallaxF * iNewY) >> 0;
		}
		if(!isNaN(iNewRot)){
			this.jInstances[sIId].rotation = iNewRot >> 0;
		}
		if(!isNaN(iNewOversize)){
			var iRad = this.to_rad(iNewRot);
			this.jInstances[sIId].x -= iNewOversize*Math.cos(iRad) - iNewOversize*Math.sin(iRad) >> 0;
			this.jInstances[sIId].y -= iNewOversize*Math.sin(iRad) + iNewOversize*Math.cos(iRad) >> 0;
		}
	},
	focus_instance: function focus_instance(sCId, sIId){
		this.jContainers[sCId].x = this.calc_focus_x(sCId, sIId) >> 0;
		this.jContainers[sCId].y = this.calc_focus_y(sCId, sIId) >> 0;
	},
	focus_instance_with_movement_offset: function focus_instance_with_movement_offset(sCId, sIId, vxRel, vyRel){
		this.jContainers[sCId].x = (this.calc_focus_x(sCId, sIId) + this.calc_movement_offset_x(vxRel)) >> 0;
		this.jContainers[sCId].y = (this.calc_focus_y(sCId, sIId) + this.calc_movement_offset_y(vyRel)) >> 0;
	},
	calc_focus_x: function calc_focus_x(sCId, sIId){
		return (0.5*this.iCanvasWidth - this.jContainers[sCId].fParallaxF*(this.jInstances[sIId].x/this.jInstances[sIId].fParallaxF));
	},
	calc_focus_y: function calc_focus_y(sCId, sIId){
		return (0.5*this.iCanvasHeight - this.jContainers[sCId].fParallaxF*(this.jInstances[sIId].y/this.jInstances[sIId].fParallaxF));
	},
	calc_movement_offset_x: function calc_movement_offset_x(vRel){
		return (-Math.pow(Math.sin(vRel * this._iMOVF*0.5*Math.PI), 2) * this.sign(vRel) * 0.5*this.iCanvasWidth);
	},
	calc_movement_offset_y: function calc_movement_offset_y(vRel){
		return (-Math.pow(Math.sin(vRel * this._iMOVF*0.5*Math.PI), 2) * this.sign(vRel) * 0.5*this.iCanvasHeight);
	},
	calculate_camera_offset_x: function calculate_camera_offset_x(sCId, sIId, vxRel){
		return (this.calc_focus_x(sCId, sIId) + this.calc_movement_offset_x(vxRel)) >> 0;
	},
	calculate_camera_offset_y: function calculate_camera_offset_y(sCId, sIId, vyRel){
		return (this.calc_focus_y(sCId, sIId) + this.calc_movement_offset_y(vyRel)) >> 0;
	},


	/**
	 * play spritesheet animation with an optional offset of frames
	 * @param	string	sIId	instance identifier
	 * @param  	string	sAnimationName 					name of animation to play
	 * @param  	int 	iOffsetFrames  					offset of frames to begin animation
	 */
	goto_animation_and_play: function goto_animation_and_play(sIId, sAnimationName, iOffsetFrames){
		this.jInstances[sIId].gotoAndPlay(sAnimationName);
		if(iOffsetFrames){
			while(iOffsetFrames > 0){
				this.jInstances[sIId].advance();
				iOffsetFrames--;
			}
		}
	},
	hide: function hide(sIId){
		this.jInstances[sIId].visible = false;
	},
	show: function show(sIId){
		this.jInstances[sIId].visible = true;
	},
	sign: function sign(number){
		return number < 0 ? -1 : 1;
	},
	to_rad: function to_rad(iRot){
		return iRot * Math.PI / 180;
	}
};