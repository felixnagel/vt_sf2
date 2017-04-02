function BlockData(jBlockDefinitions){
	this.jBlockDefinitions = jBlockDefinitions;
	this.layers = [];
	this.content = {};
};
BlockData.prototype = {
	_D1: ':',
	_D2: '|',
	_D3: '_',

	set: function set(jEssentials, jAdditionalData){
		for(var key in jAdditionalData){
			jEssentials[key] = jAdditionalData[key];
		}
		this.content[this.create_key(jEssentials)] = this.create_block_data(jEssentials);
	},
	get: function get(jEssentials){
		try{
			return this.content[this.create_key(jEssentials)];
		}catch(e){
			return undefined;
		}
	},
	get_f3: function get_f3(x, y, z){
		return this.content[x+this._D3+y+this._D3+z];
	},
	remove: function remove(jEssentials){
		delete this.content[this.create_key(jEssentials)];
	},
	remove_f3: function remove_f3(x, y, z){
		delete this.content[x+this._D3+y+this._D3+z];
	},
	create_key: function create_key(jEssentials){
		return jEssentials.x+this._D3+jEssentials.y+this._D3+this.jBlockDefinitions[jEssentials.id].z;
	},
	create_block_data: function create_block_data(jEssentials){
		for(var key in this.jBlockDefinitions[jEssentials.id]){
			jEssentials[key] = this.jBlockDefinitions[jEssentials.id][key];
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
				jEssentials = this.decode_block_data(aBlocksData[i]),
				jBlockData = this.create_block_data(jEssentials);

			if(this.layers.indexOf(jBlockData.z) == -1){
				this.layers.push(jBlockData.z);
			}

			this.content[this.create_key(jBlockData)] = jBlockData;
		}
	},
	decode_block_data: function decode_block_data(sBlockData){
		var aBlockData = sBlockData.split(this._D1);
		return {id: aBlockData[0], x: aBlockData[1], y: aBlockData[2], r: aBlockData[3]};
	}
};