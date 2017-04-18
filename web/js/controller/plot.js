'use strict';

$(document).ready(function(){
	var
		_$body = $('body'),
		_BLOCKS = _$body.data('jc_blocks'),
		$canvasses = $('canvas'),
		_BASE_SETTINGS = _$body.data('jc_map'),
		_GRIDSIZE = _BASE_SETTINGS.tiles.edge.race,
		$images = $('img');


	for(var sBlockKey in _BLOCKS){
		var jBlock = _BLOCKS[sBlockKey];
		if(jBlock.role == 'terrain'){
			var Block = new TerrainBlock(_GRIDSIZE, sBlockKey, 0);
			Block.plot('plot-canvas-'+sBlockKey, 'plot-img-'+sBlockKey);
		}
	}
});