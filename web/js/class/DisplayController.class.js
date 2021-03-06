function DisplayController(oStage){'use strict'
	this.oStage = oStage;
}
DisplayController.prototype = {
	// temp members
	_i: null,
	_iMOVF: 0.5,
	// basic members
	aRepeatingInstances: [],
	iCanvasHeight: null,
	iCanvasWidth: null,
	iRepeatingThreshold: 0.1,
	jContainers: {},
	jInstances: {},
	oStage: null,

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
	fillWithStars: function fillWithStars(sCId, iN, iRMax, iCenterX, iCenterY){
		var star, sIId, r;
		for(i = 0; i < iN; i++){
			star = new createjs.Shape(),
			r = iRMax*Math.random()*Math.random()*Math.random()*Math.random() + 1;

			star.graphics.beginFill('#EEE').drawCircle(0, 0, r);

			sIId = 'repeating_instance_' + i + '_' + sCId;
			this.add_instance(star, sIId, sCId);
			this.aRepeatingInstances.push(sIId);

			this.position_instance(sIId, iCenterX, iCenterY);
			this.jInstances[sIId].x += (this.iCanvasWidth*(1 + 2*this.iRepeatingThreshold)*(Math.random() - 0.5) >> 0);
			this.jInstances[sIId].y += (this.iCanvasHeight*(1 + 2*this.iRepeatingThreshold)*(Math.random() - 0.5) >> 0);
		}
	},
	repositionFirstOffscreenRepeatingInstance: function repositionFirstOffscreenRepeatingInstance(){
		for(this._i = 0; this._i < this.aRepeatingInstances.length; this._i++){
			if(this.jInstances[this.aRepeatingInstances[this._i]].x + this.jInstances[this.aRepeatingInstances[this._i]].parent.x < - this.iRepeatingThreshold*this.iCanvasWidth){
				this.jInstances[this.aRepeatingInstances[this._i]].x += (this.iCanvasWidth*(1 + this.iRepeatingThreshold + this.iRepeatingThreshold*Math.random())) >> 0;
				this.jInstances[this.aRepeatingInstances[this._i]].y = -this.jInstances[this.aRepeatingInstances[this._i]].parent.y + this.iCanvasHeight*Math.random() >> 0;
				break;
			}
			if(this.jInstances[this.aRepeatingInstances[this._i]].x + this.jInstances[this.aRepeatingInstances[this._i]].parent.x > this.iCanvasWidth + this.iRepeatingThreshold*this.iCanvasWidth){
				this.jInstances[this.aRepeatingInstances[this._i]].x -= (this.iCanvasWidth*(1 + this.iRepeatingThreshold + this.iRepeatingThreshold*Math.random())) >> 0;
				this.jInstances[this.aRepeatingInstances[this._i]].y = -this.jInstances[this.aRepeatingInstances[this._i]].parent.y + this.iCanvasHeight*Math.random() >> 0;
				break;
			}
			if(this.jInstances[this.aRepeatingInstances[this._i]].y + this.jInstances[this.aRepeatingInstances[this._i]].parent.y < -this.iRepeatingThreshold*this.iCanvasHeight){
				this.jInstances[this.aRepeatingInstances[this._i]].x = -this.jInstances[this.aRepeatingInstances[this._i]].parent.x + this.iCanvasWidth*Math.random() >> 0;
				this.jInstances[this.aRepeatingInstances[this._i]].y += (this.iCanvasHeight*(1 + this.iRepeatingThreshold + this.iRepeatingThreshold*Math.random())) >> 0;
				break;
			}
			if(this.jInstances[this.aRepeatingInstances[this._i]].y + this.jInstances[this.aRepeatingInstances[this._i]].parent.y > this.iCanvasHeight + this.iRepeatingThreshold*this.iCanvasHeight){
				this.jInstances[this.aRepeatingInstances[this._i]].x = -this.jInstances[this.aRepeatingInstances[this._i]].parent.x + this.iCanvasWidth*Math.random() >> 0;
				this.jInstances[this.aRepeatingInstances[this._i]].y -= (this.iCanvasHeight*(1 + this.iRepeatingThreshold + this.iRepeatingThreshold*Math.random())) >> 0;
				break;
			}
		}
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


/*

DisplayController.prototype.getNumberOfMissingFrames = function getNumberOfMissingFrames(sIId){
	var sprite = instance[sIId];
	return sprite._animation.frames.length - Math.floor(sprite.currentAnimationFrame) - 1;
};

DisplayController.prototype.gotoAnimationAndStop = function gotoAnimationAndStop(sIId, sAnimationName){
	instance[sIId].gotoAndStop(sAnimationName);
};

DisplayController.prototype.addDot = function addDot(sCId, sIId){
	var g = new createjs.Graphics();
	g.setStrokeStyle(1);
	g.beginStroke(createjs.Graphics.getRGB(0,0,0));
	g.beginFill(createjs.Graphics.getRGB(255,0,0));
	g.drawCircle(0,0,2);
	var oNewInstance = new createjs.Shape(g);
	jContainers[sCId].addChild(oNewInstance);
	instance[sIId] = oNewInstance;
};




DisplayController.prototype.setInstanceZIndex = function setInstanceZIndex(sIId, newZIndex){
	var currentImageInstance = instance[sIId];
	currentImageInstance.parent.setChildIndex(currentImageInstance, newZIndex);
};

DisplayController.prototype.removeInstance = function removeInstance(sIId){
	if(typeof instance[sIId] !== 'undefined'){
		for(var i in jContainers){
			for(var j in jContainers[i].children){
				if(jContainers[i].children[j] === instance[sIId]){
					jContainers[i].removeChild(instance[sIId]);
					delete instance[sIId];
				}
			}
		}
	}
};




DisplayController.prototype.attribute = function attribute(sIId, attributeIdentifier, attributeValue){
	if(typeof attributeValue !== 'undefined'){
		this.jInstances[sIId][attributeIdentifier] = attributeValue;
	}else{
		return this.jInstances[sIId][attributeIdentifier];
	}
};

//use native ctx.getImageData() method to get a single pixel's color data
DisplayController.prototype.getPixel = function getPixel(sCId, positionX, positionY){
	var relativeX = positionX + offsetX[sCId],
		relativeY = positionY + offsetY[sCId],
		data;

	data = (ctx.getImageData(relativeX, relativeY, 1, 1)).data;
	return {r: data[0], g: data[1], b: data[2], a: data[3]};
};

//get absolute positions of coordinates relative to an image instance's registration point
DisplayController.prototype.getAbsolutePositionFromRelativePosition = function getAbsolutePositionFromRelativePosition(sIId, relativeX, relativeY){
	var absoluteX,
		absoluteY,
		theta = instance[sIId].rotation;

	//substract registration point offset
	relativeX -= instance[sIId].regX;
	relativeY -= instance[sIId].regY;

	//use rotation matrix
	absoluteX = Math.round(Math.cos(toRad(theta)) * (relativeX) - Math.sin(toRad(theta)) * (relativeY)) + instance[sIId].x;
	absoluteY = Math.round(Math.sin(toRad(theta)) * (relativeX) + Math.cos(toRad(theta)) * (relativeY)) + instance[sIId].y;

	return {x: absoluteX, y: absoluteY};
};

DisplayController.prototype.centerInstance = function centerInstance(sIId){
	if(typeof instance[sIId].image !== 'undefined'){
		instance[sIId].x = Math.round(cw / 2 - instance[sIId].image.width / 2);
		instance[sIId].y = Math.round(iCanvasHeight / 2 - instance[sIId].image.height / 2);
	}else{
		if(typeof instance[sIId].spriteSheet !== 'undefined'){
			instance[sIId].x = Math.round(cw / 2 - instance[sIId].spriteSheet._images[0].width / 2);
			instance[sIId].y = Math.round(iCanvasHeight / 2 - instance[sIId].spriteSheet._images[0].height / 2);
		}else{
			if(typeof instance[sIId].text !== 'undefined'){
				instance[sIId].x = Math.round(cw / 2 - instance[sIId].getMeasuredWidth() / 2);
				instance[sIId].y = Math.round(iCanvasHeight / 2 - instance[sIId].getMeasuredHeight() / 2);
			}
		}
	}
};

*/
