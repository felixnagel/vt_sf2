function Times(settings){
	this.aPersonalBestTimes = settings.aPersonalBestTimes;
	this.iCheckpointCount = settings.iCheckpointCount;
	this.aCurrentTimes = [];
	this.aCurrentResults = [];
};

Times.prototype = {
	reset: function reset(){
		this.aCurrentTimes = [];
		this.aCurrentResults = [];
	},
	reach: function reach(iTime){
		iTime = this.round(iTime);

		var 
			_iCurrentCheckpointIndex = this.aCurrentTimes.length,
			jData = {};

		this.aCurrentTimes.push(iTime);

		jData.iTime = iTime;
		jData.bIsFinish = (this.iCheckpointCount === this.aCurrentTimes.length);
		
		if(this.aPersonalBestTimes[_iCurrentCheckpointIndex] === undefined){
			jData.bInitialAttempt = true;
			jData.iPersonalDelta = false;
		}else{
			jData.bInitialAttempt = false;
			jData.iPersonalDelta = this.round(iTime - this.aPersonalBestTimes[_iCurrentCheckpointIndex]);
		}
		
		jData.bIsImprovement = (jData.iPersonalDelta < 0 || jData.bInitialAttempt);

		if(jData.bIsFinish && jData.bIsImprovement){
			this.aPersonalBestTimes = this.aCurrentTimes.slice(0);
		}

		this.aCurrentResults.push(jData);

		return jData;
	},
	get_results: function get_results(){
		return this.aCurrentResults;
	},
	get_current_result: function get_current_result(){
		return this.aCurrentResults[this.aCurrentResults.length-1];
	},
	round: function round(iNum){
		return ((iNum*1000)>>0)/1000;
	}
};
