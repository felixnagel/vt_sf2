function Box(){
	this.content = {};
};
Box.prototype = {
	_DELIMITER: ':',
	normalize_key: function normalize_key(key){
		if(key.constructor === Array){
			key = key.join(this._DELIMITER);
		}
		return key;
	},
	set: function set(key, content){
		this.content[this.normalize_key(key)] = content;
	},
	get: function get(key){
		try{
			return this.content[this.normalize_key(key)];
		}catch(e){
			return undefined;
		}
	},
	remove: function remove(key){
		delete this.content[this.normalize_key(key)];
	}
};
