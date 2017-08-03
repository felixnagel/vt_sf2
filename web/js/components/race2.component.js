'use strict';

$(document).ready(function(){
	var
		_$document = $(document),
		_$body = $('body'),
		_$window = $(window),
		_$clock = $('#clock'),
		
		_$gameCanvas = $('#game-canvas'),

		_BLOCK_FACE_URL = _$body.data('sc_block_face_url'),
		_BLOCK_STROKE_URL = _$body.data('sc_block_stroke_url'),
		_BLOCKS = _$body.data('jc_blocks'),
		_MAP = _$body.data('jc_map'),
		_SHIP = _$body.data('jc_ship'),
		_SPRITESHEET_URL = _$body.data('sc_spritesheet_url'),
		_SPRITESHEETS = _$body.data('jc_spritesheets'),

		_Grid = new Grid(_MAP.tiles.edge.race),
		_Ship,
		_Clock = new VtClock(),
		_KeyController = new VtKeyController(),
		_BlockData = new BlockData(_BLOCKS),
		_MapDisplay,
		_ShipDisplay,
		_ColorProjector,

		_sLoadedBlockData,
		_aCheckpoints = [],
		_RACING = false,
		_RENDERING = false,
		_i = 0,
		_jBlock,
		_jPassingBlockCoords = {x: 0, y: 0, z: 0},
		_iDelta,
		
		_iTimeStart = 0,
		_iTimeCount = 0,

		_oTimeTmp = +new Date,
		_oLastFrame = +new Date,


	VAR_END;


	var $DEBUG = $('#debug');

	var
		m = {
			init: function inint(){
				_$document.on('map_loaded', h.on_map_loaded);
				_$document.on('map_drawn', h.on_map_drawn);
				m.prepare_spritesheet_definitions();
				//createjs.Ticker.addEventListener('tick', h.on_tick);
				window.addEventListener('VtKeyController', h.on_key_controller);
				_$document.on('checkpoint_reached', h.on_checkpoint_reached);
				_$document.on('race_restart', h.on_race_restart);
				_$document.on('race_stop', h.on_race_stop);
				_$document.on('race_finish', h.on_race_finish);
				_$document.on('race_start_prepared', h.on_race_start_prepared);
				_$document.on('block_hit', h.on_block_hit);
				_$document.on('explode', h.on_explode);
				_$window.on('resize', h.on_window_resize);
				_$document.trigger('load_map');
			},
			
			update_canvas_size: function update_canvas_size(){
				_MapDisplay.update_viewport();
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

			draw_ship: function draw_ship(){
				_ShipDisplay = new SimpleDisplay({
					iWidth: 50,
					iHeight: 50,
					sParentId: 'camera-container'
				});
				_ShipDisplay.add_container('ship');
				
				var oShipInstance = m.create_sprite_instance('ship');
				_ShipDisplay.add_instance(oShipInstance, 'ship', 'ship');
				_ShipDisplay.position_instance('ship', 0, 0, 0);

				var oExplosionInstance = m.create_sprite_instance('explosion');
				_ShipDisplay.add_instance(oExplosionInstance, 'explosion', 'ship');
				_ShipDisplay.hide('explosion');
			},
			reset_ship: function reset_ship(){
				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					if(jBlockData.role == 'starting_position'){
						
					}
				}

				_Ship = new Ship(_SHIP);
				_ShipDisplay.position(
					Math.round(_$gameCanvas.width()/2-_ShipDisplay.iWidth/2),
					Math.round(_$gameCanvas.height()/2-_ShipDisplay.iHeight/2)
				);
				_ShipDisplay.position_instance(
					'ship',
					Math.round(_ShipDisplay.iWidth/2),
					Math.round(_ShipDisplay.iHeight/2), 
					0
				);
				_ShipDisplay.show('ship');				
				_ShipDisplay.goto_animation_and_play('ship', 'idle');
				_ShipDisplay.hide('explosion');
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
				_Clock.set_null();
				_$document.trigger('race_start_prepared');
			},

			start_race: function start_race(){
				_RACING = true;
				_RENDERING = true;
			},

			update_camera: function update_camera(){
				_ShipDisplay.position_instance('ship', undefined, undefined, _Ship.rotation);
				_ShipDisplay.oStage.update();
				_MapDisplay.update_camera(_Ship.x, _Ship.y, _Ship.vxRel, _Ship.vyRel);
				_$gameCanvas[0].style.backgroundColor = 'rgb('+_ColorProjector.get_rgb(_Ship.vxRel, _Ship.vyRel)+')';
				
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
			},

			tick: function tick(){
				_oTimeTmp = +new Date - _oLastFrame;
				requestAnimationFrame(h.on_tick);
				_oLastFrame = +new Date;
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
						_ShipDisplay.goto_animation_and_play('ship', 'left_to_straight');
					}
					if(_Ship.is_steering_right()){
						_ShipDisplay.goto_animation_and_play('ship', 'right_to_straight');
					}
					_Ship.steer_straight();
				}
				if(actions.A){
					_ShipDisplay.goto_animation_and_play('ship', 'straight_to_left');
					_Ship.steer_left();
				}
				if(actions.D){
					_ShipDisplay.goto_animation_and_play('ship', 'straight_to_right');
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

				_ColorProjector = new ColorProjector({});

				_MapDisplay = new Map({
					iStrokeOversize: _MAP.tiles.stroke_oversize,
					iTilesize: 400,
					jBlockData: _BlockData,
					oCameraContainer: document.getElementById('camera-container'),
					oGameCanvas: document.getElementById('game-canvas'),
					oImg: document.getElementById('map'),
					oBg: document.getElementById('bg'),
					oMapContainer: document.getElementById('map-container'),
					sFaceUrl: _BLOCK_FACE_URL,
					sSpritesheets: _SPRITESHEETS,
					sSpritesheetUrl: _SPRITESHEET_URL,
					sStrokeUrl: _BLOCK_STROKE_URL
				});
				_MapDisplay.load_blocks();
	
				m.draw_ship();
				m.add_terrain_block_objects();
				//m.setup_checkpoints();

				
				setInterval(m.tick, 1000/120);


				/*
				createjs.Ticker.useRAF = true;
				createjs.Ticker.setFPS(60);
				*/


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

			on_tick: function on_tick(){
				
				if(_RACING){
					
					_Ship.move(0.001*_oTimeTmp);

					m.update_camera();
					m.perform_hittest();
					//_Clock.tick(_oTimeTmp);
					_$clock.html(_Clock.get_formatted_time());
				}
				if(_RENDERING){}
				$DEBUG.html(Math.round(1000/_oTimeTmp));

				
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
