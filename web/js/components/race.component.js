'use strict';

$(document).ready(function(){
	var
		_$document = $(document),
		_$body = $('body'),
		_$window = $(window),
		_$clock = $('#clock'),

		_iZoom = 1,
		
		_SHIP = _$body.data('jc_ship'),

		_BLOCKS = _$body.data('jc_blocks'),
		_MAP = _$body.data('jc_map'),
		_SPRITESHEETS = _$body.data('jc_spritesheets'),

		_BLOCK_FACE_URL = _$body.data('sc_block_face_url'),
		_BLOCK_STROKE_URL = _$body.data('sc_block_stroke_url'),
		_SPRITESHEET_URL = _$body.data('sc_spritesheet_url'),

		_Grid = new Grid(_MAP.tiles.edge.race),
		_Ship,
		_Clock = new VtClock(),

		_$canvas1 = $('#canvas-1'),
		_stage1 = new createjs.Stage(_$canvas1[0]),
		_DisplayController = new DisplayController(_stage1),

		_$canvasBg = $('#canvas-bg'),
		_$imgBg = $('#img-bg'),
		_stageBg = new createjs.Stage(_$canvasBg[0]),
		_DisplayControllerBg = new DisplayController(_stageBg),

		_KeyController = new VtKeyController(),

		_sLoadedBlockData,
		_BlockData = new BlockData(_BLOCKS),
		_aCheckpoints = [],

		_RACING = false,
		_RENDERING = false,

		_i = 0,
		_jBlock,
		_jPassingBlockCoords = {x: 0, y: 0, z: 0},
		_iDelta,

	VAR_END;


	var $DEBUG = $('#debug');

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
				m.prepare_spritesheet_definitions();

				_$document.trigger('load_map');
			},
			
			update_canvas_size: function update_canvas_size(){
				_stage1.canvas.width = Math.round(window.innerWidth/_iZoom/4);
				_DisplayController.iCanvasWidth = _stage1.canvas.width;
				_DisplayControllerBg.iCanvasWidth = _stage1.canvas.width;

				_stage1.canvas.height = Math.round(window.innerHeight/_iZoom/4);
				_DisplayController.iCanvasHeight = _stage1.canvas.height;
				_DisplayControllerBg.iCanvasHeight = _stage1.canvas.height;
			},

			create_sprite_instance: function create_sprite_instance(sSSId){
				return new createjs.Sprite(new createjs.SpriteSheet(_SPRITESHEETS[sSSId]));
			},
			prepare_spritesheet_definitions: function prepare_spritesheet_definitions(){
				for(var sSSId in _SPRITESHEETS){
					var aImages = _SPRITESHEETS[sSSId].images;
					for(var i = 0; i < aImages.length; i++){
						_SPRITESHEETS[sSSId].images[i] = _SPRITESHEET_URL+_SPRITESHEETS[sSSId].images[i];
					}
				}
			},
			draw_block_face: function draw_block_face(jBlockData){
				var 
					oNewInstance,
					sBlockKey = _BlockData.create_key(jBlockData);

				if(jBlockData.sprite){
					oNewInstance = m.create_sprite_instance(jBlockData.sprite);
				}else{
					oNewInstance = new createjs.Bitmap(_BLOCK_FACE_URL+jBlockData.id+'.png');
					oNewInstance.regX = 0.5*_MAP.tiles.edge.race;
					oNewInstance.regY = 0.5*_MAP.tiles.edge.race;
				}

				_DisplayControllerBg.add_instance(oNewInstance, sBlockKey, 'terrain');
				_DisplayControllerBg.position_instance(
					sBlockKey,
					_Grid.grid_to_snapped_centered(jBlockData.x),
					_Grid.grid_to_snapped_centered(jBlockData.y),
					jBlockData.r
				);

				if(jBlockData.sprite){
					_DisplayController.goto_animation_and_play(sBlockKey, 'idle');
				}
			},

			draw_block_stroke: function draw_block_stroke(jBlockData){
				var 
					oNewInstance,
					sBlockKey = _BlockData.create_key(jBlockData)+'/stroke';

				if(jBlockData.sprite){
					oNewInstance = m.create_sprite_instance(jBlockData.sprite);
				}else{
					oNewInstance = new createjs.Bitmap(_BLOCK_STROKE_URL+jBlockData.id+'.png');
					oNewInstance.regX = 0.5*_MAP.tiles.edge.race;
					oNewInstance.regY = 0.5*_MAP.tiles.edge.race;
				}

				_DisplayControllerBg.add_instance(oNewInstance, sBlockKey, 'terrain_stroke');
				_DisplayControllerBg.position_instance(
					sBlockKey,
					_Grid.grid_to_snapped_centered(jBlockData.x),
					_Grid.grid_to_snapped_centered(jBlockData.y),
					jBlockData.r,
					_MAP.tiles.stroke_oversize
				);

				if(jBlockData.sprite){
					_DisplayController.goto_animation_and_play(sBlockKey, 'idle');
				}
			},

			draw_ship: function draw_ship(){
				var oShipInstance = m.create_sprite_instance('ship');
				_DisplayController.add_instance(oShipInstance, 'ship', 'animation');
				_DisplayController.position_instance('ship', 0, 0, 0);

				var oExplosionInstance = m.create_sprite_instance('explosion');
				_DisplayController.add_instance(oExplosionInstance, 'explosion', 'animation');
				_DisplayController.hide('explosion');
			},
			reset_ship: function reset_ship(){
				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					if(jBlockData.role == 'starting_position'){
						
					}
				}

				_Ship = new Ship(_SHIP);
				_DisplayController.position_instance('ship', 100, 100, 145);
				_DisplayController.show('ship');				
				_DisplayController.goto_animation_and_play('ship', 'idle');
				_DisplayController.hide('explosion');
			},

			draw_terrain_blocks: function draw_terrain_blocks(){
				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					if(jBlockData.role == 'terrain'){
						m.draw_block_face(jBlockData);
						m.draw_block_stroke(jBlockData);
					}
				}
			},

			add_terrain_block_objects: function add_terrain_block_objects(){
				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					if(jBlockData.htf === undefined){
						jBlockData.htf = jBlockData.id;
					}
					_BlockData.set(jBlockData, {oBlock: new TerrainBlock(_MAP.tiles.edge.race, jBlockData.htf, jBlockData.r)})
				}
			},

			prepare_race_start: function prepare_race_start(){
				m.reset_ship();
				m.update_camera();
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
				_DisplayController.focus_instance_with_movement_offset('animation', 'ship', _Ship.vxRel, _Ship.vyRel);


				_$imgBg[0].style.left = _DisplayControllerBg.calculate_camera_offset_x('terrain', 'ship', _Ship.vxRel)+'px';
				_$imgBg[0].style.top = _DisplayControllerBg.calculate_camera_offset_y('terrain', 'ship', _Ship.vyRel)+'px';
				/*
				_$imgBg.css({
					top: _DisplayControllerBg.calculate_camera_offset_y('terrain', 'ship', _Ship.vyRel),
					left: _DisplayControllerBg.calculate_camera_offset_x('terrain', 'ship', _Ship.vxRel)
				});

				/*
				_DisplayController.focus_instance('terrain_stroke', 'ship');
				_DisplayController.set_movement_offset('terrain_stroke', _Ship.vxRel, _Ship.vyRel);
				*/
			},

			perform_hittest: function perform_hittest(){
				_jPassingBlockCoords.x = _Grid.abs_to_grid(_Ship.x);
				_jPassingBlockCoords.y = _Grid.abs_to_grid(_Ship.y);

				for(_i = 0; _i < _BlockData.layers.length; _i++){
					_jPassingBlockCoords.z = _BlockData.layers[_i];
					_jBlock = _BlockData.get_by_xyz(_jPassingBlockCoords.x, _jPassingBlockCoords.y, _jPassingBlockCoords.z);
					if(!_jBlock) continue;

					if(_jBlock.oBlock.hittest(_Grid.abs_to_rel(_Ship.x), _Grid.abs_to_rel(_Ship.y))){
						//_$document.trigger('block_hit', {jBlock: $.extend({}, _jBlock)});
						//_BlockData.remove_by_xyz(_jPassingBlockCoords.x, _jPassingBlockCoords.y, _jPassingBlockCoords.z);
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
			},

			transfer_terrain_blocks_to_img: function transfer_terrain_blocks_to_img(){
				_$imgBg.attr('src', _$canvasBg[0].toDataURL());
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
				}
				if(!actions.A && !actions.D){
					if(_Ship.is_steering_left()){
						_DisplayController.goto_animation_and_play('ship', 'left_to_straight');
					}
					if(_Ship.is_steering_right()){
						_DisplayController.goto_animation_and_play('ship', 'right_to_straight');
					}
					_Ship.steer_straight();
				}
				if(actions.A){
					_DisplayController.goto_animation_and_play('ship', 'straight_to_left');
					_Ship.steer_left();
				}
				if(actions.D){
					_DisplayController.goto_animation_and_play('ship', 'straight_to_right');
					_Ship.steer_right();
				}
				if(!actions.W && !actions.S){
					_Ship.no_load();
				}
				if(actions.W){
					_Ship.thrust();
				}
				if(actions.S){
					_Ship.throttle();
				}
			},
			on_map_loaded: function on_map_loaded(event, jBlocks){
				_sLoadedBlockData = jBlocks.sBlocks;
				_BlockData.decode_box_data(_sLoadedBlockData);

				m.update_canvas_size();
				
				_DisplayControllerBg.add_container('terrain_stroke', 1);
				_DisplayControllerBg.add_container('terrain', 1);
				_DisplayController.add_container('animation', 1);

				m.draw_terrain_blocks();
				m.draw_ship();
				m.add_terrain_block_objects();
				m.setup_checkpoints();
				
				/*
				_DisplayController.fillWithStars('bg-5', 1000, 10, _SHIP.x, _SHIP.y);
				_DisplayController.fillWithStars('bg-4', 1000, 13, _SHIP.x, _SHIP.y);
				_DisplayController.fillWithStars('bg-3', 1000, 16, _SHIP.x, _SHIP.y);
				_DisplayController.fillWithStars('bg-2', 1000, 25, _SHIP.x, _SHIP.y);
				_DisplayController.fillWithStars('bg-1', 1000, 50, _SHIP.x, _SHIP.y);
				*/

				createjs.Ticker.useRAF = true;
				createjs.Ticker.setFPS(60);

				setTimeout(function(){_$document.trigger('map_drawn')}, 3000);
			},
			on_map_drawn: function on_map_drawn(){
				_stageBg.update();
				m.transfer_terrain_blocks_to_img();

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
				if(_RACING){
					_Ship.move(0.001*event.delta);
					m.update_camera();
					m.perform_hittest();
					_Clock.tick(event.delta);
					_$clock.html(_Clock.get_formatted_time());
				}
				if(_RENDERING){
					//_stageBg.update();
					_stage1.update();
				}
				$DEBUG.html(Math.round(createjs.Ticker.getMeasuredFPS()));
			},
			on_block_hit: function on_block_hit(event, jEventData){
				var 
					jBlock = jEventData.jBlock,
					sBlockKey = _BlockData.create_key(jBlock);

				if(jBlock.role === 'terrain'){
					_$document.trigger('race_stop');
				}
				if(jBlock.role === 'checkpoint' || jBlock.role === 'finish'){
					_DisplayController.goto_animation_and_play(sBlockKey, 'pass');
					_$document.trigger('checkpoint_reached');
				}
				if(jBlock.role === 'starting_position'){
					//_DisplayController.goto_animation_and_play(sBlockKey, 'pass');
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
