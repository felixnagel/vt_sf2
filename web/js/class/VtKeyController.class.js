function VtKeyController(){
	'use strict'; 
	var 
		self = this,
		bmArray = [
			'RESTART',
			'STEER_LEFT',
			'STEER_RIGHT',
			'THROTTLE',
			'THRUST',
		];

	for(var i = 0; i < bmArray.length; i++){
		self.BM[bmArray[i]] = Math.pow(2, i);
	}

	self.keyMappings = {
		13: self.BM.RESTART,
		37: self.BM.STEER_LEFT,
		38: self.BM.THRUST,
		39: self.BM.STEER_RIGHT,
		40: self.BM.THROTTLE		
	};

	self.register_key(13, false, true, false);
	self.register_key(37, false, true, true);
	self.register_key(38, false, true, true);
	self.register_key(39, false, true, true);
	self.register_key(40, false, true, true);

	window.onkeydown = function(event){
		var keyCode = event.keyCode;
		if(
			!self.registeredKeys[keyCode]
		 	||
		 	event.repeat && !self.registeredKeys[keyCode].canRepeat
		){
			return;
		}
		
		self.registeredKeys[keyCode].isPressed = true;
		self.update_mask();
		
		if(
			(event.repeat === false || self.registeredKeys[keyCode].canRepeat)
			&&
			!self.registeredKeys[keyCode].isLocked
			&&
			self.registeredKeys[keyCode].keyDown
		){
			self.dispatch_event(event);
		}
	};

	window.onkeyup = function(event){
		var keyCode = event.keyCode;
		if(!self.registeredKeys[keyCode]){
			return;
		}
		self.registeredKeys[keyCode].isPressed = false;
		self.update_mask();
	
		if(!self.registeredKeys[keyCode].isLocked && self.registeredKeys[keyCode].keyUp){
			self.dispatch_event(event);
		}
	};
}
VtKeyController.prototype = {
	BM: {},
	key_mask: 0,
	keyMappings: {},
	registeredKeys: {},
	update_mask: function update_mask(){
		this.key_mask = 0;
		for(var i in this.registeredKeys){
			if(this.registeredKeys[i].isPressed){
				this.key_mask |= this.keyMappings[i];
			}else{
				this.key_mask &= ~this.keyMappings[i];
			}
		}
	},
	dispatch_event: function dispatch_event(){
		var event = new Event('VtKeyController');
		event.vt_actions = {
			race_restart: (this.key_mask | this.BM.RESTART) == this.key_mask,

			ship_steer_left: (this.key_mask & (this.BM.STEER_LEFT | this.BM.STEER_RIGHT)) == this.BM.STEER_LEFT,
			ship_steer_right: (this.key_mask & (this.BM.STEER_LEFT | this.BM.STEER_RIGHT)) == this.BM.STEER_RIGHT,

			ship_thrust: (this.key_mask & (this.BM.THRUST | this.BM.THROTTLE)) == this.BM.THRUST,
			ship_throttle: (this.key_mask & (this.BM.THRUST | this.BM.THROTTLE)) == this.BM.THROTTLE
		};
		window.dispatchEvent(event);
	},
	register_key: function register_key(keyCode, canRepeat, keyDown, keyUp){
		this.registeredKeys[keyCode] = {
			canRepeat: canRepeat || false,
			keyDown: keyDown || true,
			keyUp: keyUp || false,
			isPressed: false,
			isLocked: false
		};
	},
	unregister_key: function unregister_key(keyCode){
		delete this.registeredKeys[keyCode];
	},
	lockKey : function lockKey(keyCode){
		this.controlsLocked[keyCode] = true;
	},
	unlockKey : function unlockKey(keyCode){
		delete this.controlsLocked[keyCode];
		if(this.isPressed(keyCode)){
			this.keydown[keyCode]();
		}
	},
	isPressed : function isPressed(keyCode){
		return this.controlsPressed[keyCode] === true;
	}
};

/*

KEY				CODE
--------------------
backspace		8
tab				9
enter			13
shift			16
ctrl			17

alt				18
pause/break		19
caps lock		20
escape			27
page up			33

page down		34
end				35
home			36
left arrow		37
up arrow		38

right arrow		39
down arrow		40
insert			45
delete			46

left window key	91
right window key92
select key		93
num lock		144
scroll lock		145
------------------
0				48
1				49
2				50
3				51
4				52

5				53
6				54
7				55
8				56
9				57
------------------
a				65
b				66
c				67
d				68
e				69

f				70
g				71
h				72
i				73
j				74

k				75
l				76
m				77
n				78
o				79

p				80
q				81
r				82
s				83
t				84

u				85
v				86
w				87
x				88
y				89

z				90
------------------
numpad 0		96
numpad 1		97
numpad 2		98
numpad 3		99
numpad 4		100

numpad 5		101
numpad 6		102
numpad 7		103
numpad 8		104
numpad 9		105
-------------------
multiply		106
add				107
subtract		109
decimal point	110
divide			111
-------------------
f1				112
f2				113
f3				114
f4				115
f5				116

f6				117
f7				118
f8				119
f9				120
f10				121

f11				122
f12				123
-------------------
semi-colon		186
equal sign		187
comma			188
dash			189
period			190

forward slash	191
grave accent	192
open bracket	219
back slash		220
close braket	221

single quote	222
-----------------*/
