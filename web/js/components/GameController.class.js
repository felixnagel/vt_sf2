function GameController(){
	var	self = this,
		options,
		fps = 60,
		debug = false,
		benchmark,

		canvasDisplay,
		stageDisplay,
		stageDisplayIsPlaying,
		displayController,

		canvasHitTest,
		stageHitTest,
		stageHitTestIsPlaying,
		displayControllerHitTest,

		player,
		ship,

		cpTimes,
		cpPassedCount,
		thisRoundsTime,
		raceHasStarted,

		keyController,

		timeoutReferenceOnresizeEvent,
		timeoutReferenceCountdown,

		$header,
		$headerExpandButton,
		$headerRestartButton,
		$headerTimeDisplay,
		$headerTimeDisplayLabel,
	
		$headerBottomContainer,
		$headerPbDisplay,
		$headerRankDisplay,
		$headerGbNameDisplay,
		$headerGbDisplay,
		$hudCenteredDisplay,
		$hudCenteredDisplayTime,
		$highscores,

		hudCenteredClasses,

		init = function init(){
			var queue;

			//get canvasses
			canvasDisplay = document.getElementById('canvas-display');
			canvasHitTest = document.getElementById('canvas-hit-test');

			//get hud elements
			$header					= $('header');
			$headerExpandButton		= $('#header-top-container p.expand-collapse');
			$headerRestartButton	= $('#header-top-container .button.restart');
			$headerTimeDisplay		= $('#time');
			$headerTimeDisplayLabel	= $('#time-label');
			
			$headerBottomContainer  = $('#header-bottom-container');
			$headerPbDisplay		= $('#pb');
			$headerRankDisplay		= $('#rank');
			$headerGbNameDisplay	= $('#gb-name');
			$headerGbDisplay		= $('#gb');
			
			$hudCenteredDisplay		= $('#hud-center');

			$highscores				= $('#highscores');

			hudCenteredClasses = [
				'positive',
				'neutral',
				'negative'
			];

			//initially fit to fullscreen
			adjustCanvasSize();

			//set personal best times default values to empty array and false meaning 'never finished'
			cpTimes = [];
			thisRoundsTime = false;

			//load personal best times from db by ajax request
			$.ajax({
				url: 'ajax/get-checkpoint-times.ajax.php'
			}).done(function(data){
				data = JSON.parse(data);
				//set personal best times if available
				if(data !== false){
					for(var key in data){
						cpTimes.push(parseInt(data[key], 10));
					}
					thisRoundsTime = cpTimes[cpTimes.length - 1];
				}
				refreshScoreboard();
			});

			//create stages
			stageDisplay = new createjs.Stage(canvasDisplay);
			stageHitTest = new createjs.Stage(canvasHitTest);

			benchmark = new Benchmark();//debug

			//setup ticker
			createjs.Ticker.addEventListener('tick',tick);
			createjs.Ticker.useRAF = true;
			createjs.Ticker.setFPS(fps);

			//setup events
			setupEvents();

			//start loading assets, callback setupMap
			queue = new createjs.LoadQueue(true);
			queue.addEventListener('complete', setupMap);

			for(var key in options.images){
				queue.loadFile(options.images[key].url);
			}
			for(var key in options.spritesheets){
				queue.loadFile(options.spritesheets[key].url);
			}
		},

		setupMap = function setupMap(){
			//setup display stage
			displayController = new DisplayController(stageDisplay);
			displayController.addContainer('action');
			displayController.addImage(options.images.map, 'action', 'map');

			//setup checkpoint spritesheets
			for(var key in options.checkpoints){
				//if not last checkpoint set default spritesheet else set finish spritesheet
				if(key != options.checkpoints.length - 1){
					displayController.addSpriteSheet(options.spritesheets.checkpoint, 'action', options.checkpoints[key].idSpritesheet);
				}else{
					displayController.addSpriteSheet(options.spritesheets.finish, 'action', options.checkpoints[key].idSpritesheet);
				}
				//position and set animations
				displayController.position(options.checkpoints[key].idSpritesheet, {x: options.checkpoints[key].x, y: options.checkpoints[key].y});
				displayController.gotoAnimationAndStop(options.checkpoints[key].idSpritesheet, 'pass_by');
			}
			
			//setup ship
			displayController.addSpriteSheet(options.spritesheets.ship, 'action', 'ship');
			displayController.gotoAnimationAndStop('ship', 'default');
			displayController.addSpriteSheet(options.spritesheets.thrustray, 'action', 'thrustray');
			displayController.hideInstance('thrustray');
			displayController.addSpriteSheet(options.spritesheets.explosion, 'action', 'explosion');
			displayController.hideInstance('explosion');

			stageDisplay.update();

			//setup hit test stage
			displayControllerHitTest = new DisplayController(stageHitTest);
			displayControllerHitTest.addContainer('action');
			displayControllerHitTest.addImage(options.images.collisionMap, 'action', 'map');

			stageHitTest.update();
			
			//setup ship
			ship = new Ship({
				initialRotation:	options.map.spawn.rotation,
				steeringStrength:	options.map.steeringStrength,
				mass:				options.map.mass,
				enginePower:		options.map.enginePower,
				friction:			options.map.friction,
				f0x:				options.map.f0x,
				f0y:				options.map.f0y
			});

			//DEBUG
			//setup debug dots
			/*
			displayController.addDot('action', 'dot1');
			displayController.addDot('action', 'dot2');
			displayController.addDot('action', 'dot3');
			*/

			//setup controls
			keyController = new KeyController();
			//steer left: left arrow
			keyController.subscribeKey(
				37,
				function(){
					ship.steerLeft();
					displayController.gotoAnimationAndPlay('ship', 'default_to_left');
				},
				function(){
					var offsetFrames = displayController.getNumberOfMissingFrames('ship');
					if(keyController.isPressed(39)){
						ship.steerRight();
					}else{
						ship.resetSteering();
					}
					displayController.gotoAnimationAndPlay('ship', 'left_to_default', offsetFrames);
				}
			);
			//thrust: up arrow
			keyController.subscribeKey(
				38,
				function(){
					ship.thrust();
					//show thrust animation
					displayController.showInstance('thrustray');
					displayController.gotoAnimationAndPlay('thrustray', 'thrust');
				},
				function(){
					ship.resetThrusting();
					//hide thrust animation
					displayController.gotoAnimationAndStop('thrustray', 'thrust');
					displayController.hideInstance('thrustray');
				}
			);
			//steer right: right arrow
			keyController.subscribeKey(
				39,
				function(){
					ship.steerRight();
					displayController.gotoAnimationAndPlay('ship', 'default_to_right');
				},
				function(){
					var offsetFrames = displayController.getNumberOfMissingFrames('ship');					
					if(keyController.isPressed(37)){
						ship.steerLeft();
					}else{
						ship.resetSteering();
					}
					displayController.gotoAnimationAndPlay('ship', 'right_to_default', offsetFrames);
				}
			);
			//restart enter key
			keyController.subscribeKey(
				13,
				function(){restartRace();}
			);
			//scoreboard ctrl key
			keyController.subscribeKey(
				17,
				function(){
					$headerBottomContainer.addClass('expanded');
				},
				function(){
					$headerBottomContainer.removeClass('expanded');
				}
			);
			//debug shift
			keyController.subscribeKey(
				16,
				function(){
					console.log(benchmark.read('total'));
					console.log(benchmark.read());
					console.log(player.getBlackbox());
				}
			);	

			restartRace();
		},

		restartRace = function restartRace(){
			//reload this courses highscores
			$.ajax({
				url: 'ajax/get-map-highscores.ajax.php'
			}).done(function(data){
				data = JSON.parse(data);
				$highscores.prepend(data);
			});

			//signal stop
			raceHasStarted = false;
			stageDisplayIsPlaying = false;
			stageHitTestIsPlaying = false;
			cpPassedCount = 0;

			//create player instance
			player = new Player();
			player.setPosition(options.map.spawn.x, options.map.spawn.y, options.map.spawn.rotation);

			//reset ship
			ship.reset();

			//hide and set scoreboard default values
			$headerBottomContainer.removeClass('expanded');
			$headerExpandButton.removeClass('expanded');
			$headerTimeDisplayLabel.html('TIME');
			$headerTimeDisplay.html(formatTime(0));
			$headerTimeDisplay.css('color', '#777777');

			//set and stop checkpoint spritesheet animations
			for(var i in options.checkpoints){
				displayController.gotoAnimationAndStop(options.checkpoints[i].idSpritesheet, 'pass_by');
			}

			//position ship, thrustray and camera, hide explosion spritesheet
			displayController.hideInstance('explosion');
			displayController.position('ship', {x: options.map.spawn.x, y: options.map.spawn.y, rotation: options.map.spawn.rotation});
			displayController.showInstance('ship');
			displayController.position('thrustray', {x: options.map.spawn.x, y: options.map.spawn.y, rotation: options.map.spawn.rotation});
			displayController.focusInstance('action', 'ship');
			
			//set and stop ship and thrustray animations
			displayController.gotoAnimationAndStop('ship', 'default');
			displayController.gotoAnimationAndStop('thrustray', 'thrust');

			stageDisplay.update();
			
			//center camera on hit-test-canvas				
			displayControllerHitTest.offset('action', Math.round(-options.map.spawn.x + canvasHitTest.width / 2), Math.round(-options.map.spawn.y + canvasHitTest.height / 2));

			stageHitTest.update();

			//trigger keyup function of thrust key and lock thrust key to prevent jammed thrust during countdown
			keyController.triggerKeyup(37);
			keyController.triggerKeyup(38);
			keyController.triggerKeyup(39);
			keyController.lockKey(37);
			keyController.lockKey(38);
			keyController.lockKey(39);

			//show countdown on centered overlay
			clearTimeout(timeoutReferenceCountdown);
			displayCenteredHud('3', 'neutral');
			timeoutReferenceCountdown = setTimeout(function(){
				displayCenteredHud('2', 'neutral');
				timeoutReferenceCountdown = setTimeout(function(){
					displayCenteredHud('1', 'neutral');
					timeoutReferenceCountdown = setTimeout(function(){
						displayCenteredHud('GO!', 'positive');
					
						//unlock keys and trigger if already pressed
						keyController.unlockKey(37);
						keyController.unlockKey(38);
						keyController.unlockKey(39);
						if(keyController.isPressed(37) === true){
							keyController.triggerKeydown(37);
						}
						if(keyController.isPressed(38) === true){
							keyController.triggerKeydown(38);
						}
						if(keyController.isPressed(39) === true){
							keyController.triggerKeydown(39);
						}

						//sgnal go
						player.startRecording();
						raceHasStarted = true;
						stageDisplayIsPlaying = true;
						stageHitTestIsPlaying = true;
					}, debug ? 0 : 1000);
				}, debug ? 0 : 1000);
			}, debug ? 0 : 1000);
		},

		tick = function tick(e){
			var dt = e.delta;
			if(stageDisplayIsPlaying === true){
				if(raceHasStarted)benchmark.startClock('stageDisplayComplete');//debug
				
				if(raceHasStarted)benchmark.startClock('stageDisplayUpdate');//debug
				stageDisplay.update();
				if(raceHasStarted)benchmark.stopClock('stageDisplayUpdate');//debug

				if(raceHasStarted === true){
					var dsShip,
						sPlayer,
						vShip,
						nextCheckpoint = options.checkpoints[cpPassedCount],
						timeElapsed,
						dPersonalBest;
					
					//calculate delta position of ship
					dsShip = ship.calculateDS(dt / 1000);
					vShip = ship.checkSpeed();

					//add player position and set player speed
					player.addPosition(dsShip.dx, dsShip.dy, dsShip.drotation);
					player.setSpeed(vShip.vAbs, vShip.vRelative);
					
					//get absolute player position and time
					sPlayer = player.getPosition();
					timeElapsed = player.getTimeElapsed();

					//if player is inside the radius of the next checkpoint
					if(Math.sqrt(Math.pow((nextCheckpoint.x - sPlayer.x), 2) + Math.pow((nextCheckpoint.y - sPlayer.y), 2)) <= nextCheckpoint.radius){

						//if player has never finished this map, set delta personal best time to absolute time
						if(thisRoundsTime === false){
							dPersonalBest = timeElapsed;
						}else{
							dPersonalBest = timeElapsed - cpTimes[cpPassedCount];
						}

						//increase checkpoint count and store this personal best
						cpTimes[cpPassedCount] = timeElapsed;
						cpPassedCount++;
				
						//play checkpoint passed by animation
						displayController.gotoAnimationAndPlay(nextCheckpoint.idSpritesheet, 'pass_by');

						//if race has not finished yet
						if(options.checkpoints.length !== cpPassedCount){
							//set color of centered overlay to display delta personal best
							if(dPersonalBest < 0){
								displayCenteredHud(formatTime(dPersonalBest, true), 'positive');
							}else{
								if(dPersonalBest > 0 && thisRoundsTime !== false){
									displayCenteredHud(formatTime(dPersonalBest, true), 'negative');
								}else{
									displayCenteredHud(formatTime(dPersonalBest, true), 'neutral');
								}
							}
						}else{
							//finish race
							stopRace();
							var ajaxUrl = 'ajax/set-pbs.ajax.php';
							//store new times if better
							if(timeElapsed < thisRoundsTime || thisRoundsTime === false){
								thisRoundsTime = timeElapsed;
								$headerTimeDisplayLabel.html('IMPROVEMENT');
								$headerTimeDisplay.css('color', '#44FF44');
								//update db by ajax request
								for(var i in options.checkpoints){
									if(i === '0'){
										ajaxUrl = ajaxUrl + '?cp0=' + cpTimes[0];
									}else{
										ajaxUrl = ajaxUrl + '&cp' + i + '=' + cpTimes[i];
									}
								}
								$.ajax({
									url: ajaxUrl
								}).done(function(){
									refreshScoreboard();
									$.ajax({
										url: 'ajax/refresh-score.ajax.php'
									});
								});
							}else{
								$headerTimeDisplayLabel.html('NO IMPROVEMENT');
								$headerTimeDisplay.css('color', '#FF4444');
							}
						}
					}

					//reposition ship, thrustray and camera
					displayController.position('ship', {x: sPlayer.x, y: sPlayer.y, rotation: sPlayer.rotation});
					displayController.position('thrustray', {x: sPlayer.x, y: sPlayer.y, rotation: sPlayer.rotation});
					displayController.focusMovingInstance('action', 'ship', 1, vShip.rotationV, vShip.vRelative, 0.8);

					//set absolute time value
					$headerTimeDisplay.html(formatTime(timeElapsed));
				}

				if(raceHasStarted)benchmark.stopClock('stageDisplayComplete');//debug
			}

			if(stageHitTestIsPlaying === true){
				if(raceHasStarted)benchmark.startClock('stageHitTestComplete');//debug

				if(raceHasStarted)benchmark.startClock('stageHitTestUpdate');//debug
				stageHitTest.update();
				if(raceHasStarted)benchmark.stopClock('stageHitTestUpdate');//debug

				if(raceHasStarted === true){
					var sPlayer = player.getPosition(),
						x,
						y,
						positionOfPixel,
						pixel;

					//set new offset of hit test stage
					displayControllerHitTest.offset('action', Math.round(-sPlayer.x + canvasHitTest.width / 2), Math.round(-sPlayer.y + canvasHitTest.height / 2));

					//perform hit test
					for(var key in options.map.collisionPoints){
						x = options.map.collisionPoints[key][0];
						y = options.map.collisionPoints[key][1];
						//get absolute collision point pixel positions for hit test
						positionOfPixel = displayController.getAbsolutePositionFromRelativePosition('ship', x, y);

						//DEBUG
						//show collision points
						/*
						if(key == 0){
							displayController.position('dot1', {x: positionOfPixel.x, y: positionOfPixel.y});
						}
						if(key == 1){
							displayController.position('dot2', {x: positionOfPixel.x, y: positionOfPixel.y});
						}
						if(key == 2){
							displayController.position('dot3', {x: positionOfPixel.x, y: positionOfPixel.y});
						}
						*/

						//get pixel from hit test stage at this position
						pixel = displayControllerHitTest.getPixel('action', positionOfPixel.x,positionOfPixel.y);

						//check for collision by color of pixel, fail race upon collision
						if(pixel.r === 0 && pixel.g === 0 && pixel.b === 0 && pixel.a === 255){
							failRace();
							break;
						}
					}
				}

				if(raceHasStarted)benchmark.stopClock('stageHitTestComplete');//debug
			}
			
			//console.log(Math.round(e.target.getMeasuredFPS()));//debug
		},

		refreshScoreboard = function refreshScoreboard(){
			//set scoreboard personal best time
			$headerPbDisplay.html(thisRoundsTime !== false ? formatTime(cpTimes[cpTimes.length - 1], false) : '?');
			//get rank, global best time and leader name by ajax request
			$.ajax({
				url: 'ajax/get-gb.ajax.php'
			}).done(function(data){
				data = JSON.parse(data);
				//set scoreboard values
				$headerGbNameDisplay.html(data ? data['name'] : '?');
				$headerGbDisplay.html(data ? formatTime(data['time'], false) : '?');
			});
			$.ajax({
				url: 'ajax/get-rank.ajax.php'
			}).done(function(data){
				data = JSON.parse(data);
				//set scoreboard values
				$headerRankDisplay.html(data ? data : '?');
			});
		},

		refreshScoreboardAnonymous = function refreshScoreboardAnonymous(){
			//set scoreboard personal best time
			$headerPbDisplay.html(thisRoundsTime !== false ? formatTime(cpTimes[cpTimes.length - 1], false) : '?');
			//only get global time and leader name by ajax request
			$.ajax({
				url: 'ajax/get-gb.ajax.php'
			}).done(function(data){
				data = JSON.parse(data);
				//set scoreboard values
				$headerGbNameDisplay.html(data ? data['name'] : '?');
				$headerGbDisplay.html(data ? formatTime(data['time'], false) : '?');
			});
		},

		//show centered overlay and let it fade out
		displayCenteredHud = function displayCenteredHud(content, displayClass){
			$hudCenteredDisplay.html(content);
			for(var i in hudCenteredClasses){		
				$hudCenteredDisplay.removeClass(hudCenteredClasses[i]);
			}
			$hudCenteredDisplay.addClass(displayClass);

			$hudCenteredDisplay.stop();
			$hudCenteredDisplay.fadeIn(0);
			$hudCenteredDisplay.fadeOut(1000);
		},

		failRace = function failRace(){
			stopRace();
			explode();
			$headerTimeDisplayLabel.html('YOU CRASHED');
			$headerTimeDisplay.html('TRY AGAIN');
		},

		stopRace = function stopRace(){
			raceHasStarted = false;
			player.stopRecording();
			//lock keys
			keyController.lockKey(37);
			keyController.lockKey(38);
			keyController.lockKey(39);

			//hide thrust ray sprite
			displayController.hideInstance('thrustray');
			//roll out scoreboard
			$headerExpandButton.trigger('click');
		},

		explode = function explode(){
			var currentPosition = player.getPosition();
			//set position of explosion animation
			displayController.position('explosion', {x: currentPosition.x, y: currentPosition.y, rotation: currentPosition.theta});
			//hide ship sprite
			displayController.hideInstance('ship');
			//play explosion animation
			displayController.showInstance('explosion');
			displayController.gotoAnimationAndPlay('explosion', 'explode');
		},

		adjustCanvasSize = function adjustCanvasSize(){
			//set canvasses dimension according to screen size
			var newWidth = $(window).width(),
				newHeight = $(window).height() - $header.height();
			
			canvasDisplay.width = newWidth;
			canvasDisplay.height = newHeight;
			
			if(typeof displayController !== 'undefined'){
				displayController.setCanvasWidth(newWidth);
				displayController.setCanvasHeight(newHeight);
			}
		},

		//EVENTS
		setupEvents = function setupEvents(){
			//fit to fullscreen after resizing browser window
			window.onresize = function(){
				//only one event will be fired
				clearTimeout(timeoutReferenceOnresizeEvent);
				timeoutReferenceOnresizeEvent = setTimeout(function(){
					adjustCanvasSize();
				}, 100);
			};

			//restart on click
			$headerRestartButton.on('click', function(e){
				e.preventDefault();
				restartRace();
			});
		},

		//HELPER FUNCTIONS
		formatTime = function formatTime(time, showSign){
			var sign = time < 0 ? -1 : 1,
				minutes,
				seconds,
				milliseconds,
				result;

			time *= sign;

			//count full minutes
			minutes = (Math.floor(time / 60000)).toString();
			//substract difference
			time -= 60000 * minutes;
			//add leading 0 if minutes is <10
			if(minutes.length === 1){
				minutes = '0' + minutes;
			}
			minutes = minutes + ':';

			seconds = (Math.floor(time / 1000)).toString();
			time -= 1000 * seconds;
			if(seconds.length === 1){
				seconds = '0' + seconds;
			}
			seconds = seconds + ':';

			milliseconds = (Math.floor(time / 10)).toString();
			if(milliseconds.length === 1){
				milliseconds = '0' + milliseconds;
			}

			result = minutes + seconds + milliseconds;
			
			//showing optional signature
			if(showSign === true){
				result = (sign === -1 ? '-' : '+') + result;
			}
			return result;
		};

	//CONSTRUCTOR
	$.ajax({
		url: 'ajax/get-options.ajax.php'
	}).done(function(data){
		console.log(data);
		
		options = JSON.parse(data);
		console.log(options);
		init();
	});
}
