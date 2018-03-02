$(document).ready(function(){'use strict';
	var
		_$document = $(document),
		_$body = $('body'),
		
		_BLOCKS = _$body.data('jc_blocks'),

		_Grid = new Grid(_$body.data('jc_map').tiles.edge.editor),
		_BlockData = new BlockData(_BLOCKS, ['terrain']),
		_BlockDataCp = new BlockData(_BLOCKS, ['starting_position', 'checkpoint']),

		_$blockProtos = $('#block-proto-container .block'),
		_$brushes = $('#brush-container .brush'),
		_$paintBrushContainer = $('#paint-brush-container'),

		_$gridContainer = $('#grid-container'),
		_$outerGrid = $('#grid-outer'),
		_$innerGrid = $('#grid-inner'),
		_$horizontalScrollbarContainer = $('#horizontal-scrollbar-container'),
		_$horizontalScrollbarHandle = _$horizontalScrollbarContainer.find('>div'),
		_$verticalScrollbarContainer = $('#vertical-scrollbar-container'),
		_$verticalScrollbarHandle = _$verticalScrollbarContainer.find('>div'),

		_bCancelPaintEvent = false,

		m = {
			rotate_element: function rotate_element($element, iDegree){
				if(iDegree === undefined){
					iDegree = (+$element.data('rotation') + 90) % 360;
				}
				$element.data('rotation', iDegree);
				$element.css({'transform': 'rotate(' + iDegree + 'deg)'});
			},
			activate_brush: function activate_brush(sBlockId){
				_$brushes.removeClass('activated');
				_$brushes.filter('[data-block_id="'+sBlockId+'"]').addClass('activated');
				m.update_paint_brush();
			},
			get_proto_block: function get_proto_block(sBlockId){
				return _$blockProtos.filter('[data-block_id="'+sBlockId+'"]');
			},
			get_active_brush: function get_active_brush(){
				return _$brushes.filter('.activated');
			},
			get_activated_proto_block: function get_activated_proto_block(){
				return m.get_proto_block(m.get_active_brush().data('block_id'));
			},
			update_paint_brush: function update_paint_brush(){
				_$paintBrushContainer.empty();
				var $protoBlock = m.get_activated_proto_block();
				if($protoBlock.length !== 0){
					_$paintBrushContainer.append($protoBlock.clone());
				}
			},
	

			replace_terrain_block: function replace_terrain_block(jEssentials){
				m.remove_terrain_block(jEssentials);

				var 
					$newBlock = m.get_proto_block(jEssentials.id).clone(),
					blockData = _BlockData.create_block_data(jEssentials);

				if(blockData.id === 'clear_terrain'){
					return;
				}

				$newBlock.css({
					top: _Grid.grid_to_snapped(jEssentials.y),
					left: _Grid.grid_to_snapped(jEssentials.x),
					zIndex: 1
				});

				m.rotate_element($newBlock, jEssentials.r);

				$newBlock.appendTo(_$innerGrid);

				_BlockData.set(jEssentials, {$block: $newBlock});
			},

			replace_cp_block: function replace_cp_block(jEssentials){
				m.remove_cp_block(jEssentials);

				var 
					$newBlock = m.get_proto_block(jEssentials.id).clone(),
					blockData = _BlockDataCp.create_block_data(jEssentials);

				if(blockData.id === 'clear_checkpoint'){
					return;
				}

				$newBlock.css({
					top: _Grid.grid_to_snapped(jEssentials.y),
					left: _Grid.grid_to_snapped(jEssentials.x),
					zIndex: 2
				});

				m.rotate_element($newBlock, jEssentials.r);

				$newBlock.appendTo(_$innerGrid);

				_BlockDataCp.set(jEssentials, {$block: $newBlock});
			},


			replace_block: function replace_block(jEssentials){
				if(jEssentials.role == 'terrain'){
					m.replace_terrain_block(jEssentials);
				}else{
					m.replace_cp_block(jEssentials);
				}
			},
			remove_terrain_block: function remove_terrain_block(jEssentials){
				var storedBlockData = _BlockData.get(jEssentials);

				if(storedBlockData !== undefined){
					if(storedBlockData.$block){
						storedBlockData.$block.remove();
					}
					_BlockData.remove(jEssentials);
				}			
			},
			remove_cp_block: function remove_cp_block(jEssentials){
				var storedBlockData = _BlockDataCp.get(jEssentials);

				if(storedBlockData !== undefined){
					if(storedBlockData.$block){
						storedBlockData.$block.remove();
					}
					_BlockDataCp.remove(jEssentials);
				}			
			},
			delete_all_blocks: function delete_all_blocks(){
				for(var sBlockKey in _BlockData.content){
					m.remove_terrain_block(_BlockData.content[sBlockKey]);
				}
				for(var sBlockKey in _BlockDataCp.content){
					m.remove_cp_block(_BlockDataCp.content[sBlockKey]);
				}
			}
		},
		h = {
			on_brush_click: function on_brush_click(){
				var 
					$this = $(this),
					sBlockId = $this.data('block_id');

				if($this.hasClass('activated')){
					m.rotate_element(m.get_active_brush());
					m.rotate_element(m.get_activated_proto_block());
					m.update_paint_brush();
				}
			
				m.activate_brush(sBlockId);
			},
			on_mouseenter_grid: function on_mouseenter_grid(){
				_$paintBrushContainer.show();
			},
			on_mouseleave_grid: function on_mouseleave_grid(){
				_$paintBrushContainer.hide();
			},
			on_mousemove_grid: function on_mousemove_grid(event){
				var 
					$this = $(this),
					jOffset = __hlpr.get_target_event_offset(event, $this),
					iXSnapped = _Grid.abs_to_snapped(jOffset.left),
					iYSsnapped = _Grid.abs_to_snapped(jOffset.top);

				_$paintBrushContainer.css({
					top: iYSsnapped,
					left: iXSnapped
				});
			},
			on_click_grid: function on_click_grid(event){
				if(_bCancelPaintEvent){
					_bCancelPaintEvent = false;
					return;
				}

				var 
					$this = $(this),
					$protoBlock = m.get_activated_proto_block(),
					offset = __hlpr.get_target_event_offset(event, $this),
					jEssentials = {
						id: $protoBlock.data('block_id'),
						x: _Grid.abs_to_grid(offset.left),
						y: _Grid.abs_to_grid(offset.top),
						r: $protoBlock.data('rotation')
					};

				jEssentials = _BlockData.create_block_data(jEssentials) || _BlockDataCp.create_block_data(jEssentials);
					 
				if(jEssentials.id === undefined){
					return;
				}

				m.replace_block(jEssentials);
			},
			on_drag_threshold_exceeded: function on_drag_threshold_exceeded(){
				_bCancelPaintEvent = true;
			},
			on_grid_repositioned: function on_grid_repositioned(event, jNewPosition){
				var iHorizontalSpace = _$horizontalScrollbarContainer.innerWidth() - _$horizontalScrollbarHandle.innerWidth();
				_$horizontalScrollbarHandle.css({
					left: Math.round(iHorizontalSpace - jNewPosition.left_rel*(iHorizontalSpace))
				});
				
				var iVerticalSpace = _$verticalScrollbarContainer.height()-_$verticalScrollbarHandle.height();
				_$verticalScrollbarHandle.css({
					top: Math.round(iVerticalSpace - jNewPosition.top_rel*(iVerticalSpace))
				});
			},
			on_horizontal_scrollbar_repositioned: function on_horizontal_scrollbar_repositioned(event, jNewPosition){
				_$outerGrid.css({
					left: jNewPosition.left_rel*(_$gridContainer.width()-_$outerGrid.innerWidth())
				});
			},
			on_vertical_scrollbar_repositioned: function on_vertical_scrollbar_repositioned(event, jNewPosition){
				_$outerGrid.css({
					top: jNewPosition.top_rel*(_$gridContainer.height()-_$outerGrid.innerHeight())
				});
			},
			on_vertical_scrollbar_container_mousedown: function on_vertical_scrollbar_container_mousedown(event){
				var 
					$this = $(this),
					jTargetOffset = __hlpr.get_target_event_offset(event, $this);

				_$verticalScrollbarHandle.trigger('ln-drag_reposition', {
					top: jTargetOffset.top - 0.5*_$verticalScrollbarHandle.height()
				});
			},
			on_horizontal_scrollbar_container_mousedown: function on_horizontal_scrollbar_container_mousedown(){
				var 
					$this = $(this),
					jTargetOffset = __hlpr.get_target_event_offset(event, $this);

				_$horizontalScrollbarHandle.trigger('ln-drag_reposition', {
					left: jTargetOffset.left - 0.5*_$horizontalScrollbarHandle.width()
				});
			},
			on_click_save_button: function on_click_save_button(){
				console.log(_BlockData.content);
				console.log(_BlockDataCp.content);

				$.ajax({
					type: 'POST',
					url: $('body').data('ajax_url_save_map'),
					data: {
						blocks: _BlockData.encode_box_data(_BlockDataCp.content),
						title: 'test'
					},
					success: function(data){}
				});
			},
			on_click_load_button: function on_click_load_button(){
				$(document).trigger('load_map');
			},
			on_map_loaded: function on_map_loaded(event, oBlocks){
				m.delete_all_blocks();
				_BlockData.decode_box_data(oBlocks.sBlocks);
				for(var sBlockKey in _BlockData.content){
					m.replace_block(_BlockData.content[sBlockKey]);
				}

				_BlockDataCp.decode_box_data(oBlocks.sBlocks);
				for(var sBlockKey in _BlockDataCp.content){
					m.replace_block(_BlockDataCp.content[sBlockKey]);
				}
			}
		};

	// --------------------------------------------------------------------------------------------


	// console.log(_GAME_SETTINGS);
	_$brushes.on('click trouchstart', h.on_brush_click);

	_$innerGrid.on('mouseenter trouchstart', h.on_mouseenter_grid);
	_$innerGrid.on('mouseleave', h.on_mouseleave_grid);
	_$innerGrid.on('mousemove trouchstart', h.on_mousemove_grid);
	_$innerGrid.on('click trouchstart', h.on_click_grid);
	
	_$document.on('vt_brush_rotated', h.on_vt_brush_rotated);
	
	_$outerGrid.fnagelDrag();
	_$outerGrid.on('ln-drag_has-exceeded-drag-threshold', h.on_drag_threshold_exceeded);
	_$outerGrid.on('ln-drag_has-repositioned', h.on_grid_repositioned);

	_$verticalScrollbarHandle.fnagelDrag({drag_x: false, $sensitive_elements: _$verticalScrollbarContainer});
	_$verticalScrollbarHandle.on('ln-drag_has-repositioned', h.on_vertical_scrollbar_repositioned);
	_$verticalScrollbarContainer.on('mousedown', h.on_vertical_scrollbar_container_mousedown);

	_$horizontalScrollbarHandle.fnagelDrag({drag_y: false, $sensitive_elements: _$horizontalScrollbarContainer});
	_$horizontalScrollbarHandle.on('ln-drag_has-repositioned', h.on_horizontal_scrollbar_repositioned);
	_$horizontalScrollbarContainer.on('mousedown', h.on_horizontal_scrollbar_container_mousedown);

	$('#save-button').on('click', h.on_click_save_button);
	$('#load-button').on('click', h.on_click_load_button);

	$(document).on('map_loaded', h.on_map_loaded);

});