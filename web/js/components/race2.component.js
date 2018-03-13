$(document).ready(function(){'use strict';
	var
		_USE_EASEL_TICK = true,
		
		_$document = $(document),
		_$window = $(window),
		_$body = $('body'),

		_$gameCanvas = $('#game-canvas'),
		_oGameCanvas = _$gameCanvas[0],
		_oMapContainer = document.getElementById('map-container'),
		_oCameraContainer = document.getElementById('camera-container'),
		
		_$loadingOverlay = $('#loading-overlay'),
		_$topMenu = $('#menu-top'),
		_$clock = $('#clock'),
		_$hudCenteredText = $('#hud-centered-text'),

		_BLOCK_FACE_URL = _$body.data('sc_block_face_url'),
		_BLOCK_STROKE_URL = _$body.data('sc_block_stroke_url'),
		_BLOCKS = _$body.data('jc_blocks'),
		_TIMES = _$body.data('j_times'),
		_MAP = _$body.data('jc_map'),
		_SHIP = _$body.data('jc_ship'),
		_SPRITESHEET_URL = _$body.data('sc_spritesheet_url'),
		_SPRITESHEETS = _$body.data('jc_spritesheets'),

		_Grid = new Grid(_MAP.tiles.edge.race),
		_Ship,
		_oTimes,
		_Clock = new VtClock(),
		_KeyController = new VtKeyController(),
		_BlockData = new BlockData(_BLOCKS, ['terrain']),
		_BlockDataCp = new BlockData(_BLOCKS, ['starting_position', 'checkpoint']),
		_MapDisplay,
		_ShipDisplay,
		_ColorProjector,
		_ColorProjector2,

		_iTime = 0,
		_iTickDeltaTime = 0,
		_iTimestampLast = Date.now(),

		_STEADY = false,
		_RACING = false,
		_DEAD = false,

		_jPassingBlockCoords = {x: 0, y: 0, xRel: 0, yRel: 0},
		_jTerrainBlocks = {},
		_jPassingBlock,
		_sPassingBlockKey = '',

		_jCheckpoints = {},
		_aCheckpointDisplays = [],
		
		_countdownIntervalReference,
		_showDeathMenuTimeoutReference,
		_restartRaceTimeoutReference,

		_i = 0,

		$DEBUG = $('#debug'),

		m = {
			// ------------------------------------------------------------------------------------
			// PREPARATION
			// ------------------------------------------------------------------------------------
			init: function inint(){
				if(_USE_EASEL_TICK){
					createjs.Ticker.addEventListener('tick', m.tick);
				}else{
					setInterval(function(){
						m.tick2();
					}, 1000/60);
				}

				m.prepare_spritesheet_definitions();

				_$window.on('resize', h.on_screen_resize);
				_$body.on('click', '#replay-button-container', m.restart_race);


				_$document.on('map_loaded', m.draw_map);
				window.addEventListener('VtMapRendered', h.on_map_rendered);
				_$document.on('map_drawn', h.on_map_drawn);
				
				window.addEventListener('VtKeyController', h.on_key_controller);

				_$document.on('race_start_prepared', );
				_$document.on('race_restart', m.restart_race);
				_$document.on('terrain_collision', m.hotdog_die);
				_$document.on('checkpoint_reached', m.reach_checkpoint);
				_$document.on('race_finish', m.finish_race);
				
				_$document.trigger('load_map');
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
			reset_ship: function reset_ship(){
				var jBlockData;
				_Ship = new Ship(_SHIP);
				for(var sBlockKey in _BlockDataCp.content){
					jBlockData = _BlockDataCp.content[sBlockKey];
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
				_ShipDisplay.goto_animation_and_play('ship', '0_straight');
				_ShipDisplay.hide('explosion');
			},
			add_terrain_block_objects: function add_terrain_block_objects(){
				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					_jTerrainBlocks[sBlockKey] = new TerrainBlock(_MAP.tiles.edge.race, jBlockData.htf, jBlockData.r);
				}
			},
			setup_checkpoints: function setup_checkpoints(){
				for(var sBlockKey in _BlockDataCp.content){
					if(_BlockDataCp.content[sBlockKey].role === 'checkpoint'){
						_jCheckpoints[sBlockKey] = {
							oDisplay: m.create_checkpoint_display(sBlockKey),
							bReached: false
						};
					}
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
					(_BlockDataCp.content[sBlockKey].x*_jTerrainBlocks[sBlockKey].edge+(_jTerrainBlocks[sBlockKey].edge-iCanvasWidth)/2)>>0,
					(_BlockDataCp.content[sBlockKey].y*_jTerrainBlocks[sBlockKey].edge+(_jTerrainBlocks[sBlockKey].edge-iCanvasHeight)/2)>>0
				);

				oCpDisplay.add_container('cp');
				oCpSsInstance = m.create_sprite_instance('cp1');
				oCpDisplay.add_instance(oCpSsInstance, 'cp1', 'cp');
				oCpDisplay.position_instance(
					'cp1', (oCpDisplay.iCanvasWidth/2)>>0, (oCpDisplay.iCanvasHeight/2)>>0, 0
				);

				return oCpDisplay;
			},
			draw_map: function draw_map(event, jBlocks){
				_BlockDataCp.decode_box_data(jBlocks.sBlocks);
				
				_ColorProjector = new ColorProjector({
					sMode: 1,
					iPhiOffset: 0,
					iRMax:255,
					iGMax:255,
					iBMax: 255,
					iConeWidth: 1*Math.PI
				});
				_ColorProjector2 = new ColorProjector({
					sMode: 2,
					iPhiOffset: 0*Math.PI,
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

				_BlockData.decode_box_data(jBlocks.sBlocks);
				var jBlockData;
				for(var sBlockKey in _BlockData.content){
					jBlockData = _BlockData.content[sBlockKey];
					_MapDisplay.add_block(jBlockData.id, jBlockData.x, jBlockData.y, jBlockData.r);
				}
				m.add_terrain_block_objects();

				m.update_canvas_size();
				_MapDisplay.load_blocks(document.getElementById('map'));

				m.draw_ship();

				m.setup_checkpoints();

				//setInterval(m.tick, 1000/60);
				createjs.Ticker.useRAF = true;
				createjs.Ticker.setFPS(120);

				_$document.trigger('map_drawn');
			},								
			update_canvas_size: function update_canvas_size(){
				_MapDisplay.update_viewport(_oGameCanvas);
			},

 			// ------------------------------------------------------------------------------------
			// GAME LOGIC
			// ------------------------------------------------------------------------------------
			tick: function tick(event, bCustomTick){
				if(!bCustomTick){
					_iTickDeltaTime = event.delta/1000;
				}
				$DEBUG.html(Math.round(1/_iTickDeltaTime));

				if(_STEADY){
					m.interpolate_tick(_iTickDeltaTime, 0.005);

					m.update_camera();

					_ShipDisplay.oStage.update();

					for(_i = 0; _i < _aCheckpointDisplays.length; _i++){
						_jCheckpoints[_aCheckpointDisplays[_i]].oDisplay.oStage.update();
					}

					if(_RACING){
						m.update_clock();
					}
				}
			},
			tick2: function tick2(){
				_iTickDeltaTime = 0.001*(Date.now() - _iTimestampLast);
				requestAnimationFrame(h.tick, true);
				_iTimestampLast = Date.now();
			},
			interpolate_tick: function interpolate_tick(iDT, iStep){
				while(iDT > iStep){
					_Ship.move(iStep);
					m.update_block_coords();
					
					if(_RACING){
						m.perform_hittest();
						_Clock.tick(iStep);
					}
					
					iDT -= iStep;
				}
				if(iDT > 0){
					_Ship.move(iDT);
					m.update_block_coords();
					
					if(_RACING){
						m.perform_hittest();
						_Clock.tick(iDT);
					}
				}
			},
			update_block_coords: function update_block_coords(){
				_jPassingBlockCoords.x = _Grid.abs_to_grid(_Ship.x);
				_jPassingBlockCoords.y = _Grid.abs_to_grid(_Ship.y);
				_jPassingBlockCoords.xRel = _Grid.abs_to_rel(_Ship.x);
				_jPassingBlockCoords.yRel = _Grid.abs_to_rel(_Ship.y);
			},
			update_camera: function update_camera(){
				_ShipDisplay.position_instance('ship', undefined, undefined, _Ship.rotation+90);
				_MapDisplay.update_camera(_oMapContainer, _oCameraContainer, _Ship.x, _Ship.y, _Ship.vxRel, _Ship.vyRel);
				
 				_ColorProjector.calc_rgb(_Ship.vxRel, _Ship.vyRel);
				_$gameCanvas[0].style.backgroundColor = _ColorProjector.get_rgb();
				_$clock[0].style.textShadow = _ColorProjector.get_shadow();
				_$clock[0].style.webkitTransform  = _ColorProjector.get_transform();
				

 				_ColorProjector2.calc_rgb(_Ship.vxRel, _Ship.vyRel);
 				
				_$clock[0].style.color = _ColorProjector2.get_rgb();
			},
			perform_hittest: function perform_hittest(){
				_sPassingBlockKey = _BlockData.create_key(_jPassingBlockCoords);
				
				//Terrain:
				if(
					!_jTerrainBlocks[_sPassingBlockKey]
					||
					!_jTerrainBlocks[_sPassingBlockKey].hittest(_jPassingBlockCoords.xRel, _jPassingBlockCoords.yRel)
				){
					_$document.trigger('terrain_collision');
				}

				//Checkpoints:
				if(
					_jCheckpoints[_sPassingBlockKey]
					&&
					!_jCheckpoints[_sPassingBlockKey].bReached
					&&
					_jTerrainBlocks[_sPassingBlockKey].hittest(_jPassingBlockCoords.xRel, _jPassingBlockCoords.yRel)
				){
					_jCheckpoints[_sPassingBlockKey].bReached = true;
					_$document.trigger('checkpoint_reached');
				}
			},			

 			// ------------------------------------------------------------------------------------
 			// GAME EVENTS
 			// ------------------------------------------------------------------------------------
			restart_race: function restart_race(){
				_RACING = false;
				_DEAD = false;

				_KeyController.supress_actions(['W', 'A', 'S', 'D']);

				m.hide_death_menu();

				m.reset_ship();
				m.update_camera();
				m.reset_checkpoints();

				if(_oTimes === undefined){
					_oTimes = new Times({
						aPersonalBestTimes: _TIMES || [],
						iCheckpointCount: _aCheckpointDisplays.length
					});
				}
				_oTimes.reset();

				_Clock.set(0);
				m.update_clock();
				
				_STEADY = true;

				var aCountDown = ['READY?', '2', '1', 'GO!'];
				clearInterval(_countdownIntervalReference);
				m.hud_show_centered_content(aCountDown.shift(), 'green');
				_countdownIntervalReference = setInterval(function(){
					m.hud_show_centered_content(aCountDown.shift(), 'green');
					if(!aCountDown.length){
						clearInterval(_countdownIntervalReference);
						_KeyController.allow_actions(['W', 'A', 'S', 'D']);
						_RACING = true;
					}
				}, 1000);
			},
			reach_checkpoint: function reach_checkpoint(){
				_jCheckpoints[_sPassingBlockKey].oDisplay.goto_animation_and_play('cp1', 'pass');
				var iDelay = (_SPRITESHEETS.cp1.animations.pass[1]-_SPRITESHEETS.cp1.animations.pass[0]+1)*1000/60;
				(function(sBlockKey){
					_jCheckpoints[sBlockKey].timeoutReference = setTimeout(function(){
						_aCheckpointDisplays.splice(_aCheckpointDisplays.indexOf(sBlockKey), 1);
					}, iDelay);
				})(_sPassingBlockKey);

				var 
					jCpResult = _oTimes.reach(_Clock.get_seconds()),
					sClass = jCpResult.iPersonalDelta <= 0 ? 'green' : 'red';

				m.hud_show_centered_content(_Clock.format_time(jCpResult.iPersonalDelta), sClass);
				
				if(jCpResult.bIsFinish){
					_$document.trigger('race_finish');
					if(jCpResult.bIsImprovement){
						_$document.trigger('submit_times', {times: _oTimes.aCurrentTimes});
					}
				}
			},			
			hotdog_die: function hotdog_die(){
				_DEAD = true;
				_RACING = false;
				
				_Ship.freeze();
				_ShipDisplay.hide('ship');
				_ShipDisplay.show('explosion');
				_ShipDisplay.goto_animation_and_play('explosion', 'explode');
				
				m.show_death_menu();
			},
			finish_race: function finish_race(){
				_RACING = false;
				
				_KeyController.supress_actions(['W', 'A', 'S', 'D']);
				
				_Ship.activate_handbrake();


				m.update_clock();

				console.log(_oTimes);
			},
			reset_checkpoints: function reset_checkpoints(){
				_aCheckpointDisplays = [];
				for(var sBlockKey in _jCheckpoints){
					_aCheckpointDisplays.push(sBlockKey);
					_jCheckpoints[sBlockKey].bReached = false;
					clearTimeout(_jCheckpoints[sBlockKey].timeoutReference);
					_jCheckpoints[sBlockKey].oDisplay.goto_animation_and_play('cp1', 'idle', Math.random()*60>>0);
				}
			},

 			// ------------------------------------------------------------------------------------
			// HUD
			// ------------------------------------------------------------------------------------
			show_death_menu: function show_death_menu(){
				_$gameCanvas.addClass('monochrome');
				clearTimeout(_showDeathMenuTimeoutReference);
				_showDeathMenuTimeoutReference = setTimeout(function(){
					_$topMenu.addClass('visible');
console.log($('body').data('ajax_url_show_scoreboard'));
					$.ajax({
						type: 'GET',
						url: $('body').data('ajax_url_show_scoreboard'),
						success: function(data){
							console.log(data);
						}
					});

				}, 1000);
			},
			hide_death_menu: function hide_death_menu(){
				clearTimeout(_showDeathMenuTimeoutReference);
				_$gameCanvas.removeClass('monochrome');
				_$topMenu.removeClass('visible');
			},
			hud_show_centered_content: function hud_show_centered_content(sContent, sClass){
				_$hudCenteredText.html(sContent);
				_$hudCenteredText.removeClass('fade-out green red');
				_$hudCenteredText[0].offsetWidth;//force redraw
				_$hudCenteredText.addClass('fade-out '+sClass);
			},
			update_clock: function update_clock(){
				_$clock.html(_Clock.get_formatted_time());
			}
		},
		h = {
			on_key_controller: function on_key_controller(event){
				var actions = event.vt_actions;
				if(actions.raceRestart){
					_$document.trigger('race_restart');
					return;
				}
				
				if(actions.W){
					_Ship.thrust();
				}

				if(!actions.A && !actions.D){
					if(actions.W){
						if(_Ship.is_steering_left()){
							//console.log('1_left_to_straight');
							_ShipDisplay.goto_animation_and_play('ship', '1_left_to_straight');
						}else{
							if(_Ship.is_steering_right()){
								//console.log('1_right_to_straight');
								_ShipDisplay.goto_animation_and_play('ship', '1_right_to_straight');
							}else{
								//console.log('1_straight');
								_ShipDisplay.goto_animation_and_play('ship', '1_straight');
							}
						}
					}
					if(!actions.W){
						if(_Ship.is_steering_left()){
							//console.log('0_left_to_straight');
							_ShipDisplay.goto_animation_and_play('ship', '0_left_to_straight');
						}else{
							if(_Ship.is_steering_right()){
								//console.log('0_right_to_straight');
								_ShipDisplay.goto_animation_and_play('ship', '0_right_to_straight');
							}else{
								//console.log('0_straight');
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
			on_map_rendered: function on_map_rendered(){
				_$loadingOverlay.addClass('fade-out');
				setTimeout(function(){
					_$loadingOverlay.detach();
				}, 1000);
				m.restart_race();
			},
			on_screen_resize: function on_screen_resize(){
				clearTimeout(_restartRaceTimeoutReference);				
				_restartRaceTimeoutReference = setTimeout(function(){
					m.update_canvas_size();
					m.restart_race();
				}, 100);
			}
		};
	_$document.on('race_init', m.init);
});

/*
							AWESOME!
							--------
						
							RANK (21)

YOUR TIME: 00:12:45					
PERSONAL BEST: 00:11:87				CHALLENGER'S MEDAL: [X]
MAP RECORD: 00:10:76 (JOHN DOE)		SCOUT'S MEDAL: [X]

					[MENU] [RESTART] [NEXT]

					MAP NAME (BY JOHN DOE)
							*****
 */