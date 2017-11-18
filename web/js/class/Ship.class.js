function Ship(settings){
	console.log(settings);

	/**
	 * settings
	 */
	this.blackbox_enabled = false;
	this.F_0x = 0;
	this.F_0y = 0;
	this.friction = 0;
	this.handling = 0;
	this.mass = 0;
	this.powerBrakes = 0;
	this.powerEngine = 0;
	this.v_max = 0;

	/**
	 * values
	 */
	this.blackbox = [];
	this.F_engine = 0;
	this.rad = 0;
	this.rotation = 0;
	this.steering = 0;
	this.t = 0;
	this.vAbs = 0;
	this.vx = 0;
	this.vxRel = 0;
	this.vy = 0;
	this.vyRel = 0;
	this.x = 0;
	this.y = 0;

	/**
	 * whitelist settings keys
	 */
	var settingsKeys = [
		'blackbox_enabled',
		'F_0x',
		'F_0y',
		'friction',
		'handling',
		'mass',
		'rotation',
		'v_max',
		'vx',
		'vy',
		'x',
		'y',
	];

	/**
	 * set settings values
	 */
	for(var i in settingsKeys){
		if(settings[settingsKeys[i]] !== undefined){
			this[settingsKeys[i]] = settings[settingsKeys[i]];
		}
	}

	/**
	 * manipulate friction value
	 */
	this.friction /= 1000;

	/**
	 * if user decided to specify v_max, calculate engine power according to that value
	 */
	if(this.v_max){
		this.powerEngine = Math.pow(this.v_max, 2) * this.friction;
		this.powerBrakes = 0.5*this.powerEngine;
	}

	this._bFreeze = false;
}

Ship.prototype = {


	/**
	 * methods
	 */
	_normalizeRotation : function _normalizeRotation(rotation){
		rotation %= 360;
		if(rotation < 0){
			rotation += 360;
		}
		return rotation;
	},

	_toDeg : function _toDeg(rad){
		return rad * 180 / Math.PI;
	},

	_toRad : function _toRad(rotation){
		return rotation / 180 * Math.PI;
	},

	blackboxWrite : function blackboxWrite(){
		this.blackbox.push({
			F_engine : this.F_engine,
			rad      : this.rad,
			rotation : this.rotation,
			t        : this.t,
			vAbs     : this.vAbs,
			vx       : this.vx,
			vxRel	 : this.vxRel,
			vy       : this.vy,
			vyRel	 : this.vyRel,
			x        : this.x,
			y        : this.y
		});
	},

	_drotation: null,
	_F_ex: null,
	_F_ey: null,
	_F_fx: null,
	_F_fy: null,

	move: function move(dt){
		if(this._bFreeze === true){
			return;
		}

		/**
		 * set new t
		 */
		this.t += dt;

		/**
		 * calculate delta rotation and set new rotation and rad
		 */
		this._drotation = this.steering*dt;

		this.rotation = this._normalizeRotation(this.rotation + this._drotation);
		this.rad = this._toRad(this.rotation);

		/**
		 * calculate f engine
		 */
		this._F_ex = this.F_engine * Math.cos(this.rad),
		this._F_ey = this.F_engine * Math.sin(this.rad);

		/**
		 * calculate f friction
		 */
	 	this._F_fx = -this.friction * this.vx * this.vAbs;
		this._F_fy = -this.friction * this.vy * this.vAbs;

		/**
		 * calculate v
		 */
		this.vx += dt * (this._F_ex + this.F_0x + this._F_fx) / this.mass;
		this.vy += dt * (this._F_ey + this.F_0y + this._F_fy) / this.mass;
		this.vxRel = this.vx / this.v_max;
		this.vyRel = this.vy / this.v_max;
		this.vAbs  = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

		/**
		 * calculate delta s and set new x and y
		 */
		this.x += dt*this.vx;
		this.y += dt*this.vy;

		/**
		 * write to blackbox, if enabled
		 */
		if(this.blackbox_enabled){
			this.blackboxWrite();
		}
	},
	no_load : function no_load(){
		this.F_engine = 0;
	},
	steer_left : function steer_left(){
		this.steering = -this.handling;
	},
	steer_right : function steer_right(){
		this.steering = this.handling;
	},
	steer_straight : function steer_straight(){
		this.steering = 0;
	},
	thrust : function thrust(){
		this.F_engine = this.powerEngine;
	},
	throttle : function throttle(){
		this.F_engine = -this.powerBrakes;
	},
	is_steering_left: function is_steering_left(){
		return this.steering < 0;
	},
	is_steering_right: function is_steering_right(){
		return this.steering > 0;
	},
	freeze: function freeze(){
		this._bFreeze = true;
		/*
		this.steering = 0;
		this.F_engine = 0;
		this.vx = 0;
		this.vy = 0;
		this.vxRel = 0;
		this.vyRel = 0;
		this.vAbs = 0;
		*/
	}
};