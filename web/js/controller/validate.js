'use strict';

$(document).ready(function(){
	var
		_$document = $(document),
		_$body = $('body'),

		_sWebUrl = _$body.data('web_url'),
		_jBaseSettings = _$body.data('base_settings'),

		_GRIDSIZE = _jBaseSettings.grid.edgeLengthRace,
		_Grid = new Grid(_GRIDSIZE),
		_Ship,

		_canvas1 = document.getElementById('canvas-1'),
		_stage1 = new createjs.Stage(_canvas1),
		_DisplayController = new DisplayController(_stage1),
		_KeyController = new VtKeyController(),

		_BlockData = new BlockData(_$body.data('block_definitions')),
		_SpritesheetDefinitions = __hlpr.parse_spritesheet_definitions(_$body.data('spritesheet_definitions'), _sWebUrl),

		_currentBlocks = [],

		_RACING = false,

	VAR_END;

	var
		m = {
			init: function inint(){
				_DisplayController.add_container('c1', 1);
				_$document.trigger('load_map');
				createjs.Ticker.addEventListener('tick', h.on_tick);
				createjs.Ticker.useRAF = true;
				createjs.Ticker.setFPS(60);
			},
			
			create_sprite_instance: function create_sprite_instance(sSSId){
				return new createjs.Sprite(new createjs.SpriteSheet(_SpritesheetDefinitions[sSSId]));
			},
			create_bitmap_instance: function create_bitmap_instance(sSrc){
				return new createjs.Bitmap(_sWebUrl + sSrc);
			},

			draw_block: function draw_block(jBlockData){
				var 
					oNewInstance,
					sBlockKey = _BlockData.create_key(jBlockData);

				if(jBlockData.sprite){
					oNewInstance = m.create_sprite_instance(jBlockData.sprite);
				}else{
					oNewInstance = m.create_bitmap_instance(jBlockData.src);
				}

				oNewInstance.regX = 0.5*_GRIDSIZE;
				oNewInstance.regY = 0.5*_GRIDSIZE;
	
				_DisplayController.add_instance(oNewInstance, sBlockKey, 'c1');
				_DisplayController.position_instance(
					sBlockKey,
					_Grid.grid_to_snapped_centered(jBlockData.x),
					_Grid.grid_to_snapped_centered(jBlockData.y),
					jBlockData.r
				);
				if(jBlockData.sprite){
					_DisplayController.goto_animation_and_play(sBlockKey, 'idle');
				}
			},
			draw_ship: function draw_ship(){
				var oShipInstance = m.create_sprite_instance('ship');
				_DisplayController.add_instance(oShipInstance, 'ship', 'c1');
				_DisplayController.position_instance(
					'ship',
					_jBaseSettings.ship.x,
					_jBaseSettings.ship.y,
					_jBaseSettings.ship.rotation
				);
			},
			reset_ship: function reset_ship(){
				_Ship = new Ship(_jBaseSettings.ship);
				_DisplayController.position_instance('ship', 100, 100, 145);
				_DisplayController.goto_animation_and_play('ship', 'idle');
			},
			draw_blocks: function draw_blocks(){
				for(var sBlockKey in _BlockData.content){
					m.draw_block(_BlockData.content[sBlockKey]);
				}
			},
			prepare_race_start: function prepare_race_start(){
				m.reset_ship();
				_DisplayController.focus_instance('c1', 'ship');
				_stage1.update();
				_$document.trigger('race_start_prepared');
			},
			start_race: function start_race(){
				_RACING = true;
			}
		},
		h = {
			on_key_controller: function on_key_controller(event){
				var actions = event.vt_actions;
				if(actions.race_restart){
					_$document.trigger('race_restart');
				}
				if(!actions.ship_steer_left && !actions.ship_steer_right){
					if(_Ship.is_steering_left()){
						_DisplayController.goto_animation_and_play('ship', 'left_to_straight');
					}
					if(_Ship.is_steering_right()){
						_DisplayController.goto_animation_and_play('ship', 'right_to_straight');
					}
					_Ship.steer_straight();
				}
				if(actions.ship_steer_left){
					_DisplayController.goto_animation_and_play('ship', 'straight_to_left');
					_Ship.steer_left();
				}
				if(actions.ship_steer_right){
					_DisplayController.goto_animation_and_play('ship', 'straight_to_right');
					_Ship.steer_right();
				}
				if(!actions.ship_thrust && !actions.ship_throttle){
					_Ship.no_load();
				}
				if(actions.ship_thrust){
					_Ship.thrust();
				}
				if(actions.ship_throttle){
					_Ship.throttle();
				}
			},
			on_map_loaded: function on_map_loaded(event, oBlocks){
				_BlockData.decode_box_data(oBlocks.sBlocks);
				console.log(_BlockData);
				m.draw_blocks();
				m.draw_ship();
				_stage1.update();
				_$document.trigger('map_drawn');
			},
			on_map_drawn: function on_map_drawn(){
				m.prepare_race_start();
			},
			on_race_restart: function on_race_restart(){
				m.prepare_race_start();
			},
			on_race_start: function on_race_start(){

			},
			on_race_start_prepared: function on_race_start_prepared(){
				m.start_race();
			},
			on_tick: function on_tick(event){
				if(!_RACING){
					return;
				}
				_Ship.move(0.001*event.delta);
				//_grid_coords = _Grid.toGridCoords(_Ship.x, _Ship.y);
				_DisplayController.position_instance('ship', _Ship.x, _Ship.y, _Ship.rotation);
				_DisplayController.focus_instance('c1', 'ship');
				_DisplayController.set_movement_offset('c1', _Ship.vxRel, _Ship.vyRel);


				_currentBlocks = _BlockData.get2(_Grid.abs_to_grid(_Ship.x), _Grid.abs_to_grid(_Ship.y));
console.log(_currentBlocks);
				_stage1.update();
			}
		};

	// --------------------------------------------------------------------------------------------
	
	_$document.on('map_loaded', h.on_map_loaded);
	_$document.on('images_preloaded', h.on_images_preloaded);
	_$document.on('reset_race', h.on_race_restart);
	_$document.on('map_drawn', h.on_map_drawn);
	_$document.on('race_start_prepared', h.on_race_start_prepared);
	// --------------------------------------------------------------------------------------------
	window.addEventListener('VtKeyController', h.on_key_controller);

	// --------------------------------------------------------------------------------------------

	m.init();


});