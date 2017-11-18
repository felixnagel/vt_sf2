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
		_USE_EASEL_TICK = false,

		_Grid = new Grid(_MAP.tiles.edge.race),
		_Ship,
		_oTimes,
		_Clock = new VtClock(),
		_KeyController = new VtKeyController(),
		_BlockData = new BlockData(_BLOCKS),
		_MapDisplay,
		_ShipDisplay,
		_ColorProjector,
		_ColorProjector2,

		_oMapContainer = document.getElementById('map-container'),
		_oCameraContainer = document.getElementById('camera-container'),

		_aCheckpointDisplays = [],
		_jCheckpoints = {},
		_RACING = false,
		_RENDERING = false,
		_jPassingBlockCoords = {x: 0, y: 0, z: 0},
		_jTerrainBlocks = {},

		_iTimeStart = 0,
		_iTimeCount = 0,

		_iTickDeltaTime = 0,
		_iTimestampLast = Date.now(),

		_i = 0,
		_sKey = '',


	VAR_END;

	var $DEBUG = $('#debug');

	var
		m = {
			init: function inint(){
				_$document.on('map_loaded', h.on_map_loaded);
				_$document.on('map_drawn', h.on_map_drawn);
				m.prepare_spritesheet_definitions();
				
				if(_USE_EASEL_TICK){
					createjs.Ticker.addEventListener('tick', h.on_tick);
				}else{
					setInterval(function(){
						m.tick();
					}, 1000/60);
				}

				window.addEventListener('VtKeyController', h.on_key_controller);
				_$document.on('checkpoint_reached', h.on_checkpoint_reached);
				_$document.on('race_restart', h.on_race_restart);
				_$document.on('race_stop', h.on_race_stop);
				_$document.on('race_finish', h.on_race_finish);
				_$document.on('race_start_prepared', h.on_race_start_prepared);
				_$document.on('explode', h.on_explode);
				_$window.on('resize', h.on_window_resize);
				_$document.trigger('load_map');
			},
			
			update_canvas_size: function update_canvas_size(){
				_MapDisplay.update_viewport(document.getElementById('game-canvas'));
			},

			create_sprite_instance: function create_sprite_instance(sSSId){
				return new createjs.Sprite(new createjs.SpriteSheet(_SPRITESHEETS[sSSId]));
			},
			prepare_spritesheet_definitions: function prepare_spritesheet_definitions(){
				var aImages;
				for(var sSSId in _SPRITESHEETS){
					aImages = _SPRITESHEETS[sSSId].images;
					for(_i = 0; _i < aImages.length; _i++){
						_SPRITESHEETS[sSSId].images[_i] = _SPRITESHEET_URL+_SPRITESHEETS[sSSId].images[_i];
					}
				}
			},

			draw_ship: function draw_ship(){
				_ShipDisplay = new SimpleDisplay({
					iWidth: 100,
					iHeight: 100,
					sParentId: 'camera-container'
				});
				
				_ShipDisplay.add_container('ship');
				var oShipInstance = m.create_sprite_instance('ship');
				_ShipDisplay.add_instance(oShipInstance, 'ship', 'ship');
				_ShipDisplay.position_instance('ship', 0, 0, 0);

				var oExplosionInstance = m.create_sprite_instance('explosion');
				_ShipDisplay.add_instance(oExplosionInstance, 'explosion', 'ship');
				_ShipDisplay.position_instance(
					'explosion', (_ShipDisplay.iCanvasWidth/2)>>0, (_ShipDisplay.iCanvasHeight/2)>>0, 0
				);
				_ShipDisplay.hide('explosion');
			},
			explode_ship: function explode_ship(){
				_ShipDisplay.hide('ship');
				_ShipDisplay.show('explosion');
				_ShipDisplay.goto_animation_and_play('explosion', 'explode');
			},
			reset_ship: function reset_ship(){
				var jBlockData;
				_Ship = new Ship(_SHIP);
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					if(jBlockData.role == 'starting_position'){
						_Ship.x = _Grid.grid_to_snapped_centered(jBlockData.x);
						_Ship.y = _Grid.grid_to_snapped_centered(jBlockData.y);
						_Ship.rot = jBlockData.rot;
					}
				}
				
				_ShipDisplay.position(
					Math.round(_$gameCanvas.width()/2-_ShipDisplay.iCanvasWidth/2),
					Math.round(_$gameCanvas.height()/2-_ShipDisplay.iCanvasHeight/2)
				);

				_ShipDisplay.position_instance(
					'ship',
					Math.round(_ShipDisplay.iCanvasWidth/2),
					Math.round(_ShipDisplay.iCanvasHeight/2), 
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
					_jTerrainBlocks[sBlockKey] = new TerrainBlock(_MAP.tiles.edge.race, jBlockData.htf, jBlockData.r);
				}
			},

			prepare_race_start: function prepare_race_start(){
				m.reset_ship();
				m.update_camera();
				m.reset_checkpoints();
				_Clock.set_null();
				_$document.trigger('race_start_prepared');
			},

			start_race: function start_race(){
				_RACING = true;
				_RENDERING = true;
			},


			// ------------------------------------------------------------------------------------
			// CAMERA, HITTEST, TICK
			// ------------------------------------------------------------------------------------
			update_camera: function update_camera(){
				_ShipDisplay.position_instance('ship', undefined, undefined, _Ship.rotation+90);
				_MapDisplay.update_camera(_oMapContainer, _oCameraContainer, _Ship.x, _Ship.y, _Ship.vxRel, _Ship.vyRel);
				
 				_ColorProjector.calc_rgb(_Ship.vxRel, _Ship.vyRel);
				_$gameCanvas[0].style.backgroundColor = _ColorProjector.get_rgb();
				_$clock[0].style.textShadow = _ColorProjector.get_shadow();

 				_ColorProjector2.calc_rgb(_Ship.vxRel, _Ship.vyRel);
 				
				_$clock[0].style.color = _ColorProjector2.get_rgb();
			},
			perform_hittest: function perform_hittest(){
				_jPassingBlockCoords.x = _Grid.abs_to_grid(_Ship.x);
				_jPassingBlockCoords.y = _Grid.abs_to_grid(_Ship.y);

				//Terrain:
				_sKey = _BlockData.get_key_by_xy_role(_jPassingBlockCoords.x, _jPassingBlockCoords.y, 'terrain');
				if(!_jTerrainBlocks[_sKey] || !_jTerrainBlocks[_sKey].hittest(_Grid.abs_to_rel(_Ship.x), _Grid.abs_to_rel(_Ship.y))){
					_$document.trigger('race_stop');
				}

				//Checkpoints:
				_sKey = _BlockData.get_key_by_xy_role(_jPassingBlockCoords.x, _jPassingBlockCoords.y, 'checkpoint');
				if(_jCheckpoints[_sKey] && !_jCheckpoints[_sKey].bReached && _jTerrainBlocks[_sKey].hittest(_Grid.abs_to_rel(_Ship.x), _Grid.abs_to_rel(_Ship.y))){
					_jCheckpoints[_sKey].bReached = true;
					_$document.trigger('checkpoint_reached', _sKey);
				}
			},
			tick: function tick(){
				_iTickDeltaTime = 0.001*(Date.now() - _iTimestampLast);
				requestAnimationFrame(h.on_tick, true);
				_iTimestampLast = Date.now();
			},
			interpolate_tick: function interpolate_tick(iDT, iStep){
				while(iDT > iStep){
					_Ship.move(iStep);
					m.perform_hittest();
					iDT -= iStep;
				}
				if(iDT > 0){
					_Ship.move(iDT);
					m.perform_hittest();
				}
			},

			// ------------------------------------------------------------------------------------
			// CHECKPOINTS
			// ------------------------------------------------------------------------------------
			setup_checkpoints: function setup_checkpoints(){
				for(var sBlockKey in _BlockData.content){
					if(_BlockData.content[sBlockKey].role === 'checkpoint'){
						_jCheckpoints[sBlockKey] = {
							oDisplay: m.create_checkpoint_display(sBlockKey),
							bReached: false
						};
					}
				}
			},
			reset_checkpoints: function reset_checkpoints(){
				_aCheckpointDisplays = [];
				for(var sBlockKey in _jCheckpoints){
					_aCheckpointDisplays.push(sBlockKey);
					_jCheckpoints[sBlockKey].bReached = false;
					_jCheckpoints[sBlockKey].oDisplay.goto_animation_and_play('cp1', 'idle', Math.random()*60>>0);
				}
			},
			create_checkpoint_display: function create_checkpoint_display(sBlockKey){
				var 
					oCpDisplay,
					oCpSsInstance,
					iCanvasWidth = 150,
					iCanvasHeight = 150;

				oCpDisplay = new SimpleDisplay({
					iWidth: iCanvasWidth,
					iHeight: iCanvasHeight,
					sParentId: 'map-container'
				});
				
				oCpDisplay.position(
					(_BlockData.content[sBlockKey].x*_jTerrainBlocks[sBlockKey].edge+(_jTerrainBlocks[sBlockKey].edge-iCanvasWidth)/2)>>0,
					(_BlockData.content[sBlockKey].y*_jTerrainBlocks[sBlockKey].edge+(_jTerrainBlocks[sBlockKey].edge-iCanvasHeight)/2)>>0
				);

				oCpDisplay.add_container('cp');
				oCpSsInstance = m.create_sprite_instance('cp1');
				oCpDisplay.add_instance(oCpSsInstance, 'cp1', 'cp');
				oCpDisplay.position_instance(
					'cp1', (oCpDisplay.iCanvasWidth/2)>>0, (oCpDisplay.iCanvasHeight/2)>>0, 0
				);

				return oCpDisplay;
			},
			// ------------------------------------------------------------------------------------

			add_checkpoint_objects: function add_checkpoint_objects(){
			},



			transfer_terrain_blocks_to_img: function transfer_terrain_blocks_to_img(){
				_$imgBg.attr('src', _$canvasBg[0].toDataURL());
			},

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
				
				if(actions.W){
					_Ship.thrust();
				}

				if(!actions.A && !actions.D){
					if(actions.W){
						if(_Ship.is_steering_left()){
							console.log('1_left_to_straight');
							_ShipDisplay.goto_animation_and_play('ship', '1_left_to_straight');
						}else{
							if(_Ship.is_steering_right()){
								console.log('1_right_to_straight');
								_ShipDisplay.goto_animation_and_play('ship', '1_right_to_straight');
							}else{
								console.log('1_straight');
								_ShipDisplay.goto_animation_and_play('ship', '1_straight');
							}
						}
					}
					if(!actions.W){
						if(_Ship.is_steering_left()){
							console.log('0_left_to_straight');
							_ShipDisplay.goto_animation_and_play('ship', '0_left_to_straight');
						}else{
							if(_Ship.is_steering_right()){
								console.log('0_right_to_straight');
								_ShipDisplay.goto_animation_and_play('ship', '0_right_to_straight');
							}else{
								console.log('0_straight');
								_ShipDisplay.goto_animation_and_play('ship', '0_straight');
							}
						}
					}
					_Ship.steer_straight();
				}

				if(actions.A){
					_Ship.steer_left();
					if(!actions.W){
						_ShipDisplay.goto_animation_and_play('ship', '0_straight_to_left');
					}
					if(actions.W){
						_ShipDisplay.goto_animation_and_play('ship', '1_straight_to_left');
					}
				}
				if(actions.D){
					_Ship.steer_right();
					if(!actions.W){
						_ShipDisplay.goto_animation_and_play('ship', '0_straight_to_right');
					}
					if(actions.W){
						_ShipDisplay.goto_animation_and_play('ship', '1_straight_to_right');
					}
				}

				if(actions.S){
					_Ship.throttle();
				}
				if(!actions.W && !actions.S){
					_Ship.no_load();
				}
			},
			on_map_loaded: function on_map_loaded(event, jBlocks){
				_BlockData.decode_box_data(jBlocks.sBlocks);

				
				_ColorProjector = new ColorProjector({
					sMode: 2,
					iPhiOffset: 0,
					iRMax:255,
					iGMax:255,
					iBMax: 255,
					iConeWidth: 1*Math.PI
				});
				_ColorProjector2 = new ColorProjector({
					sMode: 2,
					iPhiOffset: Math.PI,
					iRMax:255,
					iGMax:255,
					iBMax: 255
				});

				_MapDisplay = new Map({
					iStrokeOversize: _MAP.tiles.stroke_oversize,
					iTilesize: _MAP.tiles.edge.race,
					sFaceUrl: _BLOCK_FACE_URL,
					sSpritesheets: _SPRITESHEETS,
					sSpritesheetUrl: _SPRITESHEET_URL,
					sStrokeUrl: _BLOCK_STROKE_URL
				});

				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					if(jBlockData.role === 'terrain'){
						_MapDisplay.add_block(jBlockData.id, jBlockData.x, jBlockData.y, jBlockData.r);
					}
				}


				m.update_canvas_size();
				_MapDisplay.load_blocks(document.getElementById('map'));

				m.draw_ship();
				m.add_terrain_block_objects();
				m.setup_checkpoints();

				//setInterval(m.tick, 1000/60);
				createjs.Ticker.useRAF = true;
				createjs.Ticker.setFPS(120);

				_$document.trigger('map_drawn');
			},
			on_map_drawn: function on_map_drawn(){
				m.prepare_race_start();
			},
			on_race_restart: function on_race_restart(){
				m.prepare_race_start();
			},
			on_race_start_prepared: function on_race_start_prepared(){
				m.start_race();
			},

			on_tick: function on_tick(event, bCustomTick){
				if(!bCustomTick){
					_iTickDeltaTime = event.delta/1000;
				}
				console.log('ok');

				if(_RACING){
					m.interpolate_tick(_iTickDeltaTime, 0.005)
					m.update_camera();
					_Clock.tick(_iTickDeltaTime);
					_$clock.html(_Clock.get_formatted_time());
				}

				if(_RENDERING){
					_ShipDisplay.oStage.update();
					for(_i = 0; _i < _aCheckpointDisplays.length; _i++){
						_jCheckpoints[_aCheckpointDisplays[_i]].oDisplay.oStage.update();
					}
				}
				$DEBUG.html(Math.round(1/_iTickDeltaTime));
			},
			on_explode: function on_explode(){
				m.explode_ship();
			},
			on_race_stop: function on_race_stop(){
				_RACING = false;
				_$document.trigger('explode');
				_Ship.freeze();
			},
			on_checkpoint_reached: function on_checkpoint_reached(event, sBlockKey){
				_jCheckpoints[sBlockKey].oDisplay.goto_animation_and_play('cp1', 'pass');
				var iDelay = (_SPRITESHEETS.cp1.animations.pass[1]-_SPRITESHEETS.cp1.animations.pass[0]+1)*1000/60;
				(function(sBlockKey){
					setTimeout(function(){
						_aCheckpointDisplays.splice(_aCheckpointDisplays.indexOf(sBlockKey), 1);
					}, iDelay);
				})(sBlockKey);
			},
			on_race_start: function on_race_start(){},
			on_race_finish: function on_race_finish(){}
		};

	_$document.on('race_init', m.init);


});
