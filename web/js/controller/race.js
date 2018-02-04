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
		h = {};

	m.init();
});