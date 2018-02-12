function VtClock(){
	this.set(0);
};
VtClock.prototype = {
	_iS: null,
	set: function set(iS){
		this._iS = iS;
	},
	tick: function tick(iS){
		this._iS += iS;
	},
	format_time: function format_time(iS){
		var sign = '';
		if(iS < 0){
			sign = '-';
			iS = Math.abs(iS);
		}else{
			if(iS > 0){
				sign = '+';
			}
		}
		return sign + ' ' + this.get_2digits((iS/60)%60<<0) + ':' + this.get_2digits(iS<<0) + ':' + this.get_2digits((iS*1000)%1000<<0);
	},
	get_formatted_time: function get_formatted_time(){
		return this.get_2digits(this.get_minutes()) + ':' + this.get_2digits(this.get_seconds()) + ':' + this.get_2digits(this.get_milliseconds());
	},
	
	get_milliseconds: function get_milliseconds(){
		return (this._iS*1000)%1000<<0;
	},
	get_seconds: function get_seconds(){
		return this._iS;
	},
	get_minutes: function get_minutes(){
		return (this._iS/60)%60<<0;
	},
	get_2digits: function get_2digits(iTime){
		if(iTime < 10 && iTime > -9){
			iTime = '0'+iTime;
		}else{
			iTime += '';
		}
		return iTime.substring(0,2);
	},
};