function ColorProjector(jSettings){
	/**
	 * whitelist settings keys
	 */
	var aSettingsKeys = [
		'iR',
		'iAlpha',
	];

	/**
	 * set settings values
	 */
	for(var i in aSettingsKeys){
		if(jSettings[aSettingsKeys[i]] !== undefined){
			this[aSettingsKeys[i]] = jSettings[aSettingsKeys[i]];
		}
	}

	this.init();
}

ColorProjector.prototype = {
	iR: 1,
	iMaxDist: 1,

	iAlpha: 0,
	iPhi: 0,

	iAR: 0,
	iAG: 0,
	iAB: 0,
	
	iDist: 0,

	iRCurr: 0,
	iRMin: 0,
	iRMax: 255,

	iGCurr: 0,
	iGMin: 0,
	iGMax: 255,

	iBCurr: 0,
	iBMin: 0,
	iBMax: 255,

	init: function init(){
		this.iAR = ((this.iAlpha)%360)/180*Math.PI;
		this.iAG = ((this.iAlpha+120)%360)/180*Math.PI;
		this.iAB = ((this.iAlpha+240)%360)/180*Math.PI;

		/*
		this.iXR = this.iR*Math.cos((this.iAlpha%360)/180*Math.PI);
		this.iYR = this.iR*Math.sin((this.iAlpha%360)/180*Math.PI);
		this.iXG = this.iR*Math.cos(((this.iAlpha+120)%360)/180*Math.PI);
		this.iYG = this.iR*Math.sin(((this.iAlpha+120)%360)/180*Math.PI);
		this.iXB = this.iR*Math.cos(((this.iAlpha+240)%360)/180*Math.PI);
		this.iYB = this.iR*Math.sin(((this.iAlpha+240)%360)/180*Math.PI);
		this.iMaxDist = this.iR*Math.sqrt(3);
		//this.iMaxDist = this.iR;
		*/
	},

	calc_rads: function calc_rads(){
	
	},

	calc_dist: function calc_dist(iX, iY){
		this.iDist = Math.sqrt(Math.pow(iX, 2)+Math.pow(iY, 2));
		this.iPhi = Math.atan2(iY, iX);
		this.iFR = Math.cos(this.iPhi*2/3-this.iAR);
		if(this.iFR < 0){
			this.iFR = 0;
		}
		this.iFG = Math.cos(this.iPhi*2/3-this.iAG);
		if(this.iFG < 0){
			this.iFG = 0;
		}
		this.iFB = Math.cos(this.iPhi*2/3-this.iAB);
		if(this.iFB < 0){
			this.iFB = 0;
		}
	},

	calc_rgb: function calc_rgb(){
		this.iRCurr = (this.iRMax-this.iRMin)*this.iDist*this.iFR>>0;
		this.iGCurr = (this.iGMax-this.iGMin)*this.iDist*this.iFG>>0;
		this.iBCurr = (this.iBMax-this.iBMin)*this.iDist*this.iFB>>0;
	},

	get_rgb: function get_rgb(iX, iY){

		this.calc_dist(iX, iY);
		this.calc_rgb();
		console.log(this.iRCurr+','+this.iGCurr+','+this.iBCurr);
		return this.iRCurr+','+this.iGCurr+','+this.iBCurr;
		/*
		console.log(this.iRCurr+','+this.iGCurr+','+this.iBCurr);
		*/
	}
};