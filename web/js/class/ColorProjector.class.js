function ColorProjector(jSettings){
	/**
	 * whitelist settings keys
	 */
	var aSettingsKeys = [
		'iAlphaB',
		'iAlphaG',
		'iAlphaR',
		'iBMax',
		'iBMin',
		'iConeWidth',
		'iGMax',
		'iGMin',
		'iPhiOffset',
		'iRMax',
		'iRMin',
		'iRotation',
		'iRotation',
		'iShadowStrength',
		'sMode',
	];

	/**
	 * set settings values
	 */
	for(var i in aSettingsKeys){
		if(jSettings[aSettingsKeys[i]] !== undefined){
			this[aSettingsKeys[i]] = jSettings[aSettingsKeys[i]];
		}
	}
}

ColorProjector.prototype = {
	iPhiOffset: 0,
	iAlphaR: 0*Math.PI,
	iAlphaG: -2/3*Math.PI,
	iAlphaB: -4/3*Math.PI,

	iRotation: false,
	iConeWidth: 2/3*Math.PI,
	iShadowStrength: 4,

	sMode: 1,

	_iX:0,
	_iY:0,
	_iDist:0,

	_iR: 0,
	iRMin: 0,
	iRMax: 255,

	_iG: 0,
	iGMin: 0,
	iGMax: 255,

	_iB: 0,
	iBMin: 0,
	iBMax: 255,

	_iPhi: 0,
	_iF: 0,

	init: function init(){},
	rotX: function rotX(alpha){
		return this._iX*Math.cos(alpha+this.iPhiOffset) - this._iY*Math.sin(alpha+this.iPhiOffset)
	},
	rotY: function rotY(alpha){
		return this._iX*Math.sin(alpha+this.iPhiOffset) + this._iY*Math.cos(alpha+this.iPhiOffset);
	},
	getF: function getF(alpha){
		this._iPhi = Math.atan2(this.rotX(alpha), this.rotY(alpha));
		if(this._iPhi < this.iConeWidth && this._iPhi > -this.iConeWidth){
			this._iF = Math.cos(this._iPhi*3/4)*this._iDist;
		}else{
			this._iF = 0;
		}
		return this._iF;
	},
	getCol: function getCol(alpha){
		if(this.sMode === 1){
			// idle == MIN
			return this.iRMin+(this.iRMax-this.iRMin)*this.getF(alpha)>>0;
		}
		if(this.sMode === 2){
			// idle == MAX
			return this.iRMax-(this.iRMax-this.iRMin)*this.getF(alpha)>>0;
		}
	},
	calc_rgb: function calc_rgb(x, y){
		this._iX = x;
		this._iY = y;
		this._iDist = Math.sqrt(Math.pow(this._iX, 2) + Math.pow(y, 2));
		if(this.iRotation !== false){
			this.iAlphaR+=this.iRotation;
			this.iAlphaG+=this.iRotation;
			this.iAlphaB+=this.iRotation;
		}
		this._iR = this.getCol(this.iAlphaR);
		this._iG = this.getCol(this.iAlphaG);
		this._iB = this.getCol(this.iAlphaB);
	},
	get_rgb: function get_rgb(){
		return 'rgb('+this._iR+','+this._iG+','+this._iB+')';
	},
	get_shadow: function get_shadow(){
		//return '4px 4px 0 rgba(0, 0, 0, 1)';
		return this.iShadowStrength*this.rotX(-Math.PI)+'px '+this.iShadowStrength*this.rotY(-Math.PI)+'px 0 rgba(0, 0, 0, 1)';
		return this.iShadowStrength*this.rotX(-Math.PI)+'px '+this.iShadowStrength*this.rotY(-Math.PI)+'px 0 rgba(255, 255, 255, 1)';
	},
	get_transform: function get_transform(){
		return 'rotateX('+this._iY*12+'deg)' + ' ' + 'rotateY('+this._iX*-12+'deg)';
	},
};