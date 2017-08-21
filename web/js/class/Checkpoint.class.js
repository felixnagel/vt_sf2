function Checkpoint(settings){
	this.oDisplay = settings.oDisplay;
	this.iBestTime = settings.iBestTime;
	this.iGlobalBestTime = settings.iGlobalBestTime;
	this.bIsFinish = settings.bIsFinish;
};
Checkpoint.prototype = {
	iCurrentTime: null,
	iBestTime: null,
	iGlobalBestTime: null,
	bIsBestTime: false,
	bIsGlobalBestTime: false,
	bIsFinish: false;

	reset: function reset(){
		this.iCurrentTime = null;
	},
	is_reached: function is_reached(){
		return this.iCurrentTime !== null;
	},
	reach: function reach(iTime){
		if(iTime < this.iBestTime){
			this.bIsBestTime = true;
			this.iBestTime = iTime;
		}
		if(iTime < this.iGlobalBestTime){
			this.bIsGlobalBestTime = true;
			this.iGlobalBestTime = iTime;
		}
		this.iCurrentTime = iTime;
	}
};
