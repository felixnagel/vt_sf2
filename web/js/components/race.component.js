'use strict';

$(document).ready(function(){
	var
		_$document = $(document),
		_$body = $('body'),
		_$window = $(window),
		_$clock = $('#clock'),

		_iZoom = 1,
		
		_sWebUrl = _$body.data('web_url'),
		_jBaseSettings = _$body.data('base_settings'),

		_GRIDSIZE = _jBaseSettings.grid.edgeLengthRace,
		_Grid = new Grid(_GRIDSIZE),
		_Ship,
		_Clock = new VtClock(),

		_canvas1 = document.getElementById('canvas-1'),
		_stage1 = new createjs.Stage(_canvas1),
		_DisplayController = new DisplayController(_stage1),
		_KeyController = new VtKeyController(),

		_sLoadedBlockData,
		_BlockData = new BlockData(_$body.data('block_definitions')),
		_aCheckpoints = [],

		_SpritesheetDefinitions = __hlpr.parse_spritesheet_definitions(_$body.data('spritesheet_definitions'), _sWebUrl),

		_RACING = false,
		_RENDERING = false,

		_i = 0,
		_jBlock,
		_jPassingBlockCoords = {x: 0, y: 0, z: 0},
		_iDelta,

	VAR_END;

	var
		m = {
			init: function inint(){
				_$document.on('map_loaded', h.on_map_loaded);
				_$document.on('images_preloaded', h.on_images_preloaded);
				_$document.on('checkpoint_reached', h.on_checkpoint_reached);
				_$document.on('race_restart', h.on_race_restart);
				_$document.on('race_stop', h.on_race_stop);
				_$document.on('race_finish', h.on_race_finish);
				_$document.on('map_drawn', h.on_map_drawn);
				_$document.on('race_start_prepared', h.on_race_start_prepared);
				_$document.on('block_hit', h.on_block_hit);
				_$document.on('explode', h.on_explode);
				window.addEventListener('VtKeyController', h.on_key_controller);
				_$window.on('resize', h.on_window_resize);
				createjs.Ticker.addEventListener('tick', h.on_tick);

				_$document.trigger('load_map');
			},
			
			update_canvas_size: function update_canvas_size(){
				_stage1.canvas.width = Math.round(window.innerWidth/_iZoom);
				_stage1.canvas.height = Math.round(window.innerHeight/_iZoom);
				_DisplayController.update_canvas_dimensions(_iZoom);
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

				var oExplosionInstance = m.create_sprite_instance('explosion');
				_DisplayController.add_instance(oExplosionInstance, 'explosion', 'c1');
				_DisplayController.hide('explosion');
			},
			reset_ship: function reset_ship(){
				_Ship = new Ship(_jBaseSettings.ship);
				_DisplayController.position_instance('ship', 100, 100, 145);
				_DisplayController.show('ship');				
				_DisplayController.goto_animation_and_play('ship', 'idle');
				_DisplayController.hide('explosion');
			},
			draw_blocks: function draw_blocks(){
				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					m.draw_block(jBlockData);
				}
			},
			add_terrain_block_objects: function add_terrain_block_objects(){
				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					_BlockData.set(jBlockData, {oBlock: new TerrainBlock(_GRIDSIZE, jBlockData.type, jBlockData.r)})
				}
			},
			prepare_race_start: function prepare_race_start(){
				m.reset_ship();
				_DisplayController.focus_instance('c1', 'ship');
				_stage1.update();
				_Clock.set_null();
				_$document.trigger('race_start_prepared');
			},
			start_race: function start_race(){
				_RACING = true;
				_RENDERING = true;
			},
			update_camera: function update_camera(){
				_DisplayController.position_instance('ship', _Ship.x, _Ship.y, _Ship.rotation);
				_DisplayController.focus_instance('c1', 'ship');
				_DisplayController.set_movement_offset('c1', _Ship.vxRel, _Ship.vyRel);
			},
			perform_hittest: function perform_hittest(){
				_jPassingBlockCoords.x = _Grid.abs_to_grid(_Ship.x);
				_jPassingBlockCoords.y = _Grid.abs_to_grid(_Ship.y);

				for(_i = 0; _i < _BlockData.layers.length; _i++){
					_jPassingBlockCoords.z = _BlockData.layers[_i];
					_jBlock = _BlockData.get_f3(_jPassingBlockCoords.x, _jPassingBlockCoords.y, _jPassingBlockCoords.z);
					if(!_jBlock) continue;

					if(_jBlock.oBlock.hittest(_Grid.abs_to_rel(_Ship.x), _Grid.abs_to_rel(_Ship.y))){
						_$document.trigger('block_hit', {jBlock: $.extend({}, _jBlock)});
						_BlockData.remove_f3(_jPassingBlockCoords.x, _jPassingBlockCoords.y, _jPassingBlockCoords.z);
					}
				}
			},
			setup_checkpoints: function setup_checkpoints(){
				_aCheckpoints = [];
				for(var sBlockKey in _BlockData.content){
					var jBlockData = _BlockData.content[sBlockKey];
					if(jBlockData.role === 'checkpoint'){
						_aCheckpoints.push({
							currentTime: false,
							personalBest: false,
							globalBest: false
						});
					}
				}
			}
		},
		h = {
			on_window_resize: function on_window_resize(){
				m.update_canvas_size();
			},
			on_key_controller: function on_key_controller(event){
				
				var actions = event.vt_actions;
				if(actions.raceRestart){
					_$document.trigger('race_restart');
					//console.log('race_restart');
				}
				if(!actions.A && !actions.D){
					if(_Ship.is_steering_left()){
						_DisplayController.goto_animation_and_play('ship', 'left_to_straight');
						//console.log('left_to_straight');
					}
					if(_Ship.is_steering_right()){
						_DisplayController.goto_animation_and_play('ship', 'right_to_straight');
						//console.log('right_to_straight');
					}
					_Ship.steer_straight();
				}
				if(actions.A){
					_DisplayController.goto_animation_and_play('ship', 'straight_to_left');
					//console.log('straight_to_left');
					_Ship.steer_left();
				}
				if(actions.D){
					_DisplayController.goto_animation_and_play('ship', 'straight_to_right');
					//console.log('straight_to_right');
					_Ship.steer_right();
				}
				if(!actions.W && !actions.S){
					_Ship.no_load();
					//console.log('no_load');
				}
				if(actions.W){
					_Ship.thrust();
					//console.log('thrust');
				}
				if(actions.S){
					_Ship.throttle();
					//console.log('throttle');
				}
			},
			on_map_loaded: function on_map_loaded(event, jBlocks){
				_sLoadedBlockData = jBlocks.sBlocks;
				_BlockData.decode_box_data(_sLoadedBlockData);

				m.update_canvas_size();
				_DisplayController.add_container('c1', 1);
				m.draw_blocks();
				m.draw_ship();

				m.add_terrain_block_objects();
				m.setup_checkpoints();

				createjs.Ticker.useRAF = true;
				createjs.Ticker.setFPS(60);
				_stage1.update();

				_$document.trigger('map_drawn');
			},
			on_map_drawn: function on_map_drawn(){
				m.prepare_race_start();
			},
			on_race_restart: function on_race_restart(){
				_BlockData.decode_box_data(_sLoadedBlockData);
				m.add_terrain_block_objects();
				m.setup_checkpoints();
				m.prepare_race_start();
			},
			on_race_start_prepared: function on_race_start_prepared(){
				m.start_race();
			},
			on_tick: function on_tick(event){
				_Clock.tick(event.delta);
				_$clock.html(_Clock.get_formatted_time());

				if(_RACING){
					_Ship.move(0.001*event.delta);
					m.update_camera();
					m.perform_hittest();
				}

				if(_RENDERING){
					_stage1.update();
				}
			},
			on_block_hit: function on_block_hit(event, jEventData){
				var jBlock = jEventData.jBlock;
				if(jBlock.role === 'terrain'){
					_$document.trigger('race_stop');
				}
				if(jBlock.role === 'checkpoint' || jBlock.role === 'finish'){
					_$document.trigger('checkpoint_reached');
				}
			},
			on_explode: function on_explode(){
				_DisplayController.position_instance('explosion', _Ship.x, _Ship.y, _Ship.rotation);
				_DisplayController.show('explosion');
				_DisplayController.goto_animation_and_play('explosion', 'explode');
				_DisplayController.hide('ship');
			},
			on_race_stop: function on_race_stop(){
				_$document.trigger('explode');
				_Ship.freeze();
				_RACING = false;
			},
			on_checkpoint_reached: function on_checkpoint_reached(){
				for(var i = 0; i < _aCheckpoints.length; i++){
					if(_aCheckpoints[i].currentTime === false){
						_aCheckpoints[i].currentTime = _Clock.get_time();
						if(i === _aCheckpoints.length - 1){
							_$document.trigger('race_stop');
							_$document.trigger('race_finish', {checkpoints: _aCheckpoints.slice()});
						}
						break;
					}
				}
			},
			on_race_start: function on_race_start(){},
			on_race_finish: function on_race_finish(){}
		};

	_$document.on('race_init', m.init);
});