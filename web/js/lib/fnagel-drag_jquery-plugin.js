!function($, window, document, undefined){ 'use strict'
    $.fn.fnagelDrag = function(userSettings){
        return this.each(function(){
            // SETTINGS ---------------------------------------------------------------------------
            var
                $this = $(this),

                options = {
                    $sensitive_elements: $this,
                    $offset_parent: $this.offsetParent(),
                    boundaries: {/*min: {x: 0, y: 0}, max: {x: 0, y: 0}*/},
                    drag_event_threshold: 10,
                    force_center: false,
                    selector: null,
                    drag_x: true,
                    drag_y: true
                };

            $.extend(options, userSettings || {});


            // VARS -------------------------------------------------------------------------------
            var
                _position = {
                    left: $this.position().left,
                    top: $this.position().left,
                    left_rel: false,
                    top_rel: false
                },
                _boundaries = {
                    min: {
                        x: 0,
                        y: 0
                    },
                    max: {
                        x: 0,
                        y: 0
                    }
                },
                _$window = $(window),

                _draggedDistance = 0,
                _drag_start_x,
                _drag_start_y,

                _position_left_start,
                _position_top_start;


            // METHODS ----------------------------------------------------------------------------
            var
                m = {
                    get_boundaries: function get_boundaries(){
                        var
                            outerWidth = $this.outerWidth(),
                            outerHeight = $this.outerHeight(),
                            offsetParentInnerWidth = options.$offset_parent.innerWidth(),
                            offsetParentInnerHeight = options.$offset_parent.innerHeight();

                        if(outerWidth <= offsetParentInnerWidth){
                            _boundaries.min.x = 0;
                            _boundaries.max.x = offsetParentInnerWidth - outerWidth;
                        }else{
                            _boundaries.min.x = offsetParentInnerWidth - outerWidth;
                            _boundaries.max.x = 0;
                        }
                        if(outerHeight <= offsetParentInnerHeight){
                            _boundaries.min.y = 0;
                            _boundaries.max.y = offsetParentInnerHeight - outerHeight;
                        }else{
                            _boundaries.min.y = offsetParentInnerHeight - outerHeight;
                            _boundaries.max.y = 0;
                        }
                        $.extend(_boundaries, options.boundaries || {});
                    },
                    reposition: function reposition(newPosition){
                        if(newPosition.left !== undefined){
                            _position.left = Math.round(newPosition.left);

                            if(_position.left < _boundaries.min.x){
                                _position.left = _boundaries.min.x;
                            }
                            if(_position.left > _boundaries.max.x){
                                _position.left = _boundaries.max.x;
                            }

                            $this.css({left: _position.left});
                        }
                        if(newPosition.top !== undefined){
                            _position.top = Math.round(newPosition.top);

                            if(_position.top < _boundaries.min.y){
                                _position.top = _boundaries.min.y;
                            }
                            if(_position.top > _boundaries.max.y){
                                _position.top = _boundaries.max.y;
                            }

                            $this.css({top: _position.top});
                        }
                        
                        m.calc_relative_position();
                        $this.trigger('ln-drag_has-repositioned', _position);
                    },
                    can_drag_x: function can_drag_x(){
                        return (_boundaries.min.x != _boundaries.max.x) && options.drag_x;
                    },
                    can_drag_y: function can_drag_y(){
                        return (_boundaries.min.y != _boundaries.max.y) && options.drag_y;
                    },
                    remove_text_highlight: function remove_text_highlight(){
                        if(window.getSelection){
                            if(window.getSelection().empty){  // Chrome
                                window.getSelection().empty();
                            }else{
                                if(window.getSelection().removeAllRanges){  // Firefox
                                    window.getSelection().removeAllRanges();
                                }
                            }
                        }else{
                            if(document.selection){  // IE?
                                document.selection.empty();
                            }
                        }
                    },
                    retrieve_absolute_position: function retrieve_absolute_position(){
                        var position = $this.position();
                        _position.left = position.left;
                        _position.top = position.top;
                    },
                    calc_relative_position: function calc_relative_position(){
                        _position.left_rel = Math.abs(
                            (_position.left-_boundaries.min.x)/(_boundaries.max.x-_boundaries.min.x)
                        );
                        _position.top_rel = Math.abs(
                            (_position.top-_boundaries.min.y)/(_boundaries.max.y-_boundaries.min.y)
                        );
                    }
                },
                h = {
                    on_mousemove: function on_mousemove(event){
                        if(!m.can_drag_x() && !m.can_drag_y()){
                            return;
                        }

                        if(m.can_drag_x()){
                            var newX = _position_left_start + event.screenX - _drag_start_x;
                            m.reposition({left: newX});
                        }

                        if(m.can_drag_y()){
                            var newY = _position_top_start + event.screenY - _drag_start_y;
                            m.reposition({top: newY});
                        }

                        _draggedDistance += Math.sqrt(
                            Math.pow(newX-_position_left_start, 2) + Math.pow(newY-_position_top_start, 2)
                        );

                        if(_draggedDistance >= options.drag_event_threshold){
                            _draggedDistance = 0;
                            $this.trigger('ln-drag_has-exceeded-drag-threshold');
                        }
                    },
                    on_mouseup: function on_mouseup(event){
                        _draggedDistance = 0;
                        _$window.off('mousemove', h.on_mousemove);
                        _$window.off('mouseup', h.on_mouseup);
                        $this.trigger('ln-drag_dragging-has-ended');
                    },
                    on_mousedown: function on_mousedown(event){
                        if(!m.can_drag_x() && !m.can_drag_y()){
                            return;
                        }
                        
                        m.remove_text_highlight();
                        m.retrieve_absolute_position();
                        m.calc_relative_position();
                        _draggedDistance = 0;

                        _position_left_start = _position.left;
                        _position_top_start = _position.top;

                        _drag_start_x = event.screenX;
                        _drag_start_y = event.screenY;

                        _$window.on('mousemove', h.on_mousemove);
                        _$window.on('mouseup', h.on_mouseup);

                        $this.trigger('ln-drag_dragging-has-started');
                    },
                    on_reposition: function on_reposition(event, newPosition){
                        _position_left_start += newPosition.left - _position.left;
                        _position_top_start += newPosition.top - _position.top;
                        m.reposition(newPosition);
                    }
                };

            
            // INIT -------------------------------------------------------------------------------
            m.get_boundaries();
            options.$sensitive_elements.on('mousedown', h.on_mousedown);

            // API --------------------------------------------------------------------------------
            $this.on('ln-drag_reposition', h.on_reposition);
        });
    };

}(jQuery, window, document);
