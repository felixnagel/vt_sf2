$(document).ready(function(){
	!function(){
		var 
			$document = $(document),
			h = {
				on_preload_images: function on_preload_images(event, aImageUrls){

				}
			};




		$document.on('preload_images', h.on_preload_images);
	}();
});