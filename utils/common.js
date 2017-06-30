var Firebase = require('firebase');



var setUserStats = function(userId,callback){
	var gameSetRef = Firebase.database().ref().child('gameSet').child(userId);
	var gameSetData={
		'totalPlayed':0,
		'totalWin':0,
		'totalCost':0,
		"C1" : {
			'totalPlayed':0,
			'totalWin':0
		},
		"C2" : {
			'totalPlayed':0,
			'totalWin':0
		},
		"C3" : {
			'totalPlayed':0,
			'totalWin':0
		},
		"C4" : {
			'totalPlayed':0,
			'totalWin':0
		}
	};
	if(gameSetRef.set(gameSetData)){
		callback(true);
	}
};

var parseGameStat = function(gameStats){
	console.log(gameStats);
	var data = {};
	return data;
};

module.exports = {
		setUserStats:setUserStats,
		parseGameStat:parseGameStat
};
