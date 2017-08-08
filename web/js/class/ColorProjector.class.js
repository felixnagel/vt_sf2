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



/*
<div id="test" style="width:200px; height:200px; border:1px solid red; position:relative">
	<div style="position:absolute; top:99px; left:99px; right:99px; bottom:99px; background-color:red"></div>
</div>
<div id="test-color" style="margin-top:10px; height:500px; width:100%; border:1px solid red;">
	<p id="test-color2" style="font-size:400px; text-shadow:10px 10px 0px rgba(0, 0, 0, 0.2);">FOOBAR FOOBAR</p>
</div>

{literal}<script type="text/javascript">
	$(document).ready(function(){ 'use strict';
		var $w = $('#test');
		var $testColor = $('#test-color');
		var $testColor2 = $('#test-color2');

		var rotX = function rotX(x, y, alpha){
			return x*Math.cos(alpha) - y*Math.sin(alpha)
		};
		var rotY = function rotY(x, y, alpha){
			return x*Math.sin(alpha) + y*Math.cos(alpha);
		};
		var getF = function getF(x, y, alpha){
			var phi = Math.atan2(rotY(x, y, alpha), rotX(x, y, alpha));
			var f = 0;
			if(phi < 2/3*Math.PI && phi > -2/3*Math.PI){
				f = Math.cos(phi*3/4);
			}
			f *= Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
			return f;
		};

		var getR = function getR(x, y){
			var alpha = 0*Math.PI;
			//return 255*getF(x, y, alpha)>>0;
			return 255-255*getF(x, y, alpha)>>0;
		};
		var getG = function getG(x, y){
			var alpha = -2/3*Math.PI;
			//return 255*getF(x, y, alpha)>>0;
			return 255-255*getF(x, y, alpha)>>0;
		};
		var getB = function getB(x, y){
			var alpha = -4/3*Math.PI;
			//return 255*getF(x, y, alpha)>>0;
			return 255-255*getF(x, y, alpha)>>0;
		};

		$w.on('mousemove', function(event){
			var x = (event.offsetX - 100) / 100;
			var y = (event.offsetY - 100) / 100;
			$testColor[0].style.backgroundColor = 'rgb('+getR(x, y)+','+getG(x, y)+','+getB(x, y)+')';
			$testColor2[0].style.color = 'rgb('+getR(x, y)+','+getG(x, y)+','+getB(x, y)+')';
			$testColor2[0].style.textShadow = 20*rotX(x, y, Math.PI)+'px '+20*rotY(x, y, Math.PI)+'px 2px rgba(0, 0, 0, 0.3)';
			$testColor2[0].style.transform = 'rotateX('+y*-15+'deg)' + ' ' + 'rotateY('+x*15+'deg)';
			
		});
	});
</script>{/literal}
*/