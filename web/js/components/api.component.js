$(document).ready(function(){
	var
		_$document = $(document),
		_$body = $('body'),

		m = {},
		h = {
			on_load_map: function on_load_map(){
				$.ajax({
					type: 'GET',
					url: $('body').data('ajax_url_load_map'),
					success: function(sBlocks){
						_$document.trigger('map_loaded', {sBlocks: sBlocks});
					}
				});
			},
			on_preload_images: function on_preload_images(event, oImageUrls){
				var	
					aImageUrls = oImageUrls.urls,
					jImages = {},
					queue = new createjs.LoadQueue(true);

				aImageUrls = __hlpr.array_unique(aImageUrls);

				queue.addEventListener('complete', function(event, data){
					_$document.trigger('images_preloaded');
				});
				queue.addEventListener('fileload', function(event, data){
					//jImages[]
					console.log(event);
				});

				for(var i = 0; i < aImageUrls.length; i++){
					queue.loadFile(aImageUrls[i], false);
				}

				queue.load();
			}
		};

	_$document.on('preload_images', h.on_preload_images);	
	_$document.on('load_map', h.on_load_map);
});