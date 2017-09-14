function Times(settings){
	this.aGlobalBestTimes = settings.aGlobalBestTimes;
	this.aPersonalBestTimes = settings.aPersonalBestTimes;
	this.iCheckpointCount = settings.iCheckpointCount;
};
Times.prototype = {
	aCurrentTimes: [],
	jResult: {},
	_iCurrentCheckpointKey: 0,
	reset: function reset(){
		this.jResult = {
			iPersonalDelta: null,
			iGlobalDelta: null,
			bIsFinish: false
		},
		this.aCurrentTimes = [];
	},
	reach: function reach(iTime){
		this.aCurrentTimes.push(iTime);
		this._iCurrentCheckpointKey = this.aCurrentTimes.length-1;
		if(this.aGlobalBestTimes[this._iCurrentCheckpointKey] === undefined){
			this.aGlobalBestTimes.push(iTime);
		}
	
		this.jResult.iPersonalDelta = (iTime - this.aPersonalBestTimes[this._iCurrentCheckpointKey])>>0;
		this.jResult.iGlobalDelta = (iTime - this.aGlobalBestTimes[this._iCurrentCheckpointKey])>>0;
		if(this._iCurrentCheckpointKey === (this.iCheckpointCount - 1)){
			this.jResult.bIsFinish = true;
			if(this.jResult.iPersonalDelta < 0){
				this.aPersonalBestTimes = this.aCurrentTimes.slice(0);
			}
			if(this.jResult.iGlobalDelta < 0){
				this.aGlobalBestTimes = this.aCurrentTimes.slice(0);
			}
		}

		return this.jResult;
	}
};
