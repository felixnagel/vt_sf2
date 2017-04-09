function VtClock(){
	this.set_null();
};
VtClock.prototype = {
	_iMs: null,
	_sFormattedTime: null,
	set_null: function set_null(){
		this._iMs = 0;
		this._sFormattedTime = '00:00:00';
	},
	tick: function tick(iDMS){
		this._iMs += iDMS;
		this._sFormattedTime = this.get_minutes((this._iMs/1000/60)%60<<0) + ':' + this.get_seconds((this._iMs/1000)%60<<0) + ':' + this.get_milliseconds(this._iMs%1000<<0);
	},
	get_formatted_time: function get_formatted_time(){
		return this._sFormattedTime;
	},
	get_time: function get_time(){
		return this._iMs<<0;
	},
	get_minutes: function get_minutes(minutes){
		if(minutes < 10){
			minutes = '0'+minutes;
		}
		return minutes;
	},
	get_seconds: function get_seconds(seconds){
		if(seconds < 10){
			seconds = '0'+seconds;
		}else{
			seconds += '';
		}
		return seconds.substring(0, 2);
	},
	get_milliseconds: function get_milliseconds(milliseconds){
		if(milliseconds < 10){
			milliseconds = '0'+milliseconds;
		}else{
			milliseconds += '';
		}
		return milliseconds.substring(0, 2);
	}
};