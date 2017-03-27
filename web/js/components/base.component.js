var
	__hlpr = {
		parse_spritesheet_definitions: function parse_spritesheet_definitions(jSpritesheetDefinitions, sWebUrl){
			for(var sSSId in jSpritesheetDefinitions){
				var aImages = jSpritesheetDefinitions[sSSId].images;
				for(var i = 0; i < aImages.length; i++){
					jSpritesheetDefinitions[sSSId].images[i] = 
						sWebUrl + jSpritesheetDefinitions[sSSId].images[i];
				}
			}
			return jSpritesheetDefinitions;
		},
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
		},
		formatTime: function formatTime(iTime, bShowSign){
			var 
				iSign = iTime < 0 ? -1 : 1,
				sMinutes,
				sSeconds,
				sMilliSeconds,
				sResult;

			iTime *= iSign;

			sMinutes = (Math.floor(iTime / 60000)).toString();
			iTime -= 60000 * sMinutes;
			if(sMinutes.length === 1){
				sMinutes = '0' + sMinutes;
			}
			sMinutes = sMinutes + ':';

			sSeconds = (Math.floor(iTime / 1000)).toString();
			iTime -= 1000 * sSeconds;
			if(sSeconds.length === 1){
				sSeconds = '0' + sSeconds;
			}
			sSeconds = sSeconds + ':';

			sMilliSeconds = (Math.floor(iTime / 10)).toString();
			if(sMilliSeconds.length === 1){
				sMilliSeconds = '0' + sMilliSeconds;
			}

			sResult = sMinutes + sSeconds + sMilliSeconds;
			
			if(bShowSign){
				sResult = (iSign === -1 ? '-' : '+') + sResult;
			}
			return sResult;
		}
	};