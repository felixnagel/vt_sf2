function BlockData(jBlockDefinitions, aRoles){
	this.jBlockDefinitions = jBlockDefinitions;
	this.layers = [];
	this.content = {};
	this.roles = aRoles;
};
BlockData.prototype = {
	_D1: ':',
	_D2: '|',

	get: function get(jEssentials){
		try{
			return this.content[this.create_key(jEssentials)];
		}catch(e){
			return undefined;
		}
	},

	set: function set(jBlockData, jAdditionalData){
		for(var key in jAdditionalData){
			jBlockData[key] = jAdditionalData[key];
		}		
		this.content[this.create_key(jBlockData)] = jBlockData;
	},

	remove: function remove(jEssentials){
		try{
			delete this.content[this.create_key(jEssentials)];
		}catch(e){
			return undefined;
		}
	},

	create_key: function create_key(jEssentials){
		return jEssentials.x+this._D2+jEssentials.y;
	},

	create_block_data: function create_block_data(jEssentials){
		for(var key in this.jBlockDefinitions[jEssentials.id]){
			jEssentials[key] = this.jBlockDefinitions[jEssentials.id][key];
		}
		if(jEssentials.role === undefined){
			jEssentials.role = 'terrain';
		}
		if(jEssentials.htf === undefined){
			jEssentials.htf = jEssentials.id;
		}
		return jEssentials;
	},

	encode_box_data: function encode_box_data(jBlocksData){
		var encodedBlocks = [];
		for(var key in jBlocksData){
			encodedBlocks.push(this.encode_block_data(jBlocksData[key]));
		}
		return encodedBlocks.join(this._D2);
	},

	encode_block_data: function encode_block_data(jBlockData){
		return jBlockData.id+this._D1+jBlockData.x+this._D1+jBlockData.y+this._D1+jBlockData.r;
	},

	decode_box_data: function decode_box_data(sBoxData){
		if(!sBoxData){
			return {};
		}
		var aBlocksData = sBoxData.split(this._D2);

		this.content = {};
			
		for(var i = 0; i < aBlocksData.length; i++){
			var 
				jEssentials = this._D2+jEssentials.z+this.decode_block_data(aBlocksData[i]),
				jBlockData = this.create_block_data(jEssentials);

			if(this.roles.indexOf(jBlockData.role) !== -1){
				this.set(jBlockData);
			}
		}
	},

	decode_block_data: function decode_block_data(sBlockData){
		var aBlockData = sBlockData.split(this._D1);
		return {id: aBlockData[0], x: aBlockData[1], y: aBlockData[2], r: aBlockData[3]};
	}
};