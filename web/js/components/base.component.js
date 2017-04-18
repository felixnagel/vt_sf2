var
	__hlpr = {
		get_target_event_offset: function get_target_event_offset(event, $target){
			var targetOffset = $target.offset();
			return {top: event.pageY - targetOffset.top, left: event.pageX - targetOffset.left};
		},
		create_essentials: function create_essentials(blockId, x, y, r){
			return {id: blockId, x: x, y: y, r: r};
		},
		array_unique: function array_unique(aArray){
		    var aUniqueArray = [];
		    for(var i = 0; i < aArray.length; i++){
		        if(aUniqueArray.indexOf(aArray[i]) === -1 && aArray[i] !== ''){
					aUniqueArray.push(aArray[i]);
				}
			}
		    return aUniqueArray;
		}
	};