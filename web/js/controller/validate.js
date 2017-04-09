'use strict';
$(document).ready(function(){
	var
		_$document = $(document),
	VAR_END;

	var
		m = {
			init: function init(){
				_$document.on('race_finish', h.on_race_finish);
				_$document.trigger('race_init');
			},
		},
		h = {
			on_race_finish: function on_race_finish(event, jData){
				var jLastTime = jData.checkpoints[jData.checkpoints.length-1];
				if(!jLastTime.personalBest || jLastTime.currentTime < jLastTime.personalBest){
					var aTimes = [];
					for(var i = 0; i < jData.checkpoints.length; i++){
						aTimes.push(jData.checkpoints[i].currentTime);
					}
					_$document.trigger('submit_times', {t: aTimes.slice()});
				}
			}
		};

	m.init();
});