function VtKeyController(){
	'use strict'; 
	var 
		self = this,

		actionKeys = [
			{actionId: 'W', keys: [38, 87], keyUp: true},
			{actionId: 'A', keys: [37, 65], keyUp: true},
			{actionId: 'S', keys: [40, 83], keyUp: true},
			{actionId: 'D', keys: [39, 68], keyUp: true},
			{actionId: 'raceRestart', keys: [13]}
		];

	for(var k = 0; k < actionKeys.length; k++){
		var jDef = actionKeys[k];
		self.register_key(jDef.actionId, jDef.keys, jDef);
		self.BM[jDef.actionId] = Math.pow(2, k);
	}

	window.onkeydown = function(event){
		var keyCode = event.keyCode;

		self.set_key_pressed(keyCode, true);

		if(
			!self.registeredKeys[keyCode]
			||
			!self.registeredKeys[keyCode].keyDown
			||
			event.repeat && !self.registeredKeys[keyCode].canRepeat	
		){
			return;
		}

		if(!self.registeredKeys[keyCode].isLocked){
			self.dispatch_event(event);
		}
	};

	window.onkeyup = function(event){
		var keyCode = event.keyCode;

		self.set_key_pressed(keyCode, false);

		if(!self.registeredKeys[keyCode] || !self.registeredKeys[keyCode].keyUp){
			return;
		}

		if(!self.registeredKeys[keyCode].isLocked){
			self.dispatch_event(event);
		}
	};
}
VtKeyController.prototype = {
	BM: {},
	key_mask: 0,
	registeredKeys: {},
	
	set_key_pressed: function set_key_pressed(iKeyCode, bPressed){
		if(this.registeredKeys[iKeyCode] !== undefined){
			this.registeredKeys[iKeyCode].isPressed = bPressed;
		}
	},

	update_mask: function update_mask(){
		this.key_mask = 0;
		for(var i in this.registeredKeys){
			if(this.registeredKeys[i].isPressed){
				this.key_mask |= this.BM[this.registeredKeys[i].actionId];
			}
		}
	},
	dispatch_event: function dispatch_event(){
		this.update_mask();
		var event = new Event('VtKeyController');
		event.vt_actions = {
			raceRestart: (this.key_mask | this.BM.raceRestart) == this.key_mask,
			W: (this.key_mask & (this.BM.S | this.BM.W)) == this.BM.W,
			A: (this.key_mask & (this.BM.A | this.BM.D)) == this.BM.A,
			S: (this.key_mask & (this.BM.S | this.BM.W)) == this.BM.S,
			D: (this.key_mask & (this.BM.A | this.BM.D)) == this.BM.D
		};
	
		window.dispatchEvent(event);
	},
	register_key: function register_key(actionId, aKeys, jDef){
		for(var i = 0; i < aKeys.length; i++){
			this.registeredKeys[aKeys[i]] = {
				actionId: actionId,
				canRepeat: false,
				keyDown: true,
				keyUp: false,
				isPressed: false,
				isLocked: false
			};
			for(var mOption in jDef){
				if(this.registeredKeys[aKeys[i]][mOption] !== undefined){
					this.registeredKeys[aKeys[i]][mOption] = jDef[mOption];
				}
			}
		}
	},
	lift_keys: function lift_keys(){
		var event = new Event('VtKeyController');
		event.vt_actions = {raceRestart: false, W: false, A: false, S: false, D: false};
		window.dispatchEvent(event);
	},
	supress_actions: function supress_actions(aActionIds){
		for(var iKey in this.registeredKeys){
			for(var i = 0; i < aActionIds.length; i++){
				if(this.registeredKeys[iKey].actionId === aActionIds[i]){
					this.registeredKeys[iKey].isLocked = true;
				}
			}
		}
		this.lift_keys();
	},
	allow_actions: function allow_actions(aActionIds){
		for(var iKey in this.registeredKeys){
			for(var i = 0; i < aActionIds.length; i++){
				if(this.registeredKeys[iKey].actionId === aActionIds[i]){
					this.registeredKeys[iKey].isLocked = false;
				}
			}
		}
		this.dispatch_event();
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
