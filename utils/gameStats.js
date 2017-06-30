var Firebase = require('firebase');
/* uncomment below for unit testing */
// var Config = require('./config');
// var fbconfig = Config.getfirebaseConfig();
// Firebase.initializeApp(fbconfig);
/* end of unit testing init */




var updateRoomToUserGameSetHistory = function(userId,roomId){
	var rootRef = Firebase.database().ref();
	var gameHistoryRef = rootRef.child('gameSet').child(userId);
	var gameHistoryRoomsRef = gameHistoryRef.child('rooms');
	var roomRef = rootRef.child('rooms1').child(roomId);
	roomRef.once('value').then(function(roomSnapp){
		gameHistoryRoomsRef.child(roomSnapp.key).set(roomSnapp.val());
		refreshUserStat(userId);
	});
};

var refreshUserStat = function(userId){
	var rootRef = Firebase.database().ref();
	var gameHistoryRef = rootRef.child('gameSet').child(userId);
	var gameHistoryRoomsRef = gameHistoryRef.child('rooms');
	gameHistoryRoomsRef.once('value').then(function(roomsSnapp){
		var catWiseStat ={};
		var catId;
		var val;
		roomsSnapp.forEach(function(roomS){
			val = roomS.val();
			catId = val.catId;
			if(!catWiseStat[catId]){
				catWiseStat[catId]={
					played:0,
					won:0
				};
			}
			catWiseStat[catId].played = 1 + catWiseStat[catId].played || 0;
			//if user is winner of this game increse won by 1;
			if(val.winner && val.winner === userId){
				catWiseStat[catId].won = 1 + catWiseStat[catId].won || 0;
			}
		});
		gameHistoryRef.child('stats').set(catWiseStat);
	});
};

var getUserStat = function(userId,callback){
	var rootRef = Firebase.database().ref();
	var gameHistoryStatRef = rootRef.child('gameSet').child(userId).child('stats');
	gameHistoryStatRef.once('value',function(snapp){
		callback(snapp.val());
	});
};

var updateUserStatForGameStart = function(catId,subCatId,fees,userId,callback){
	var rootRef = Firebase.database().ref();
	var catId1 = 'C'+catId;
	var gameSetRef = rootRef.child('gameSet').child(userId);
		gameSetRef.once('value').then(function(snapshot){
			var gameSetData1 = snapshot.val();
			gameSetData1.totalCost = parseInt(gameSetData1.totalCost+result.fees);
			gameSetData1.totalPlayed = parseInt(gameSetData1.totalPlayed+1);
			gameSetData1[catId1].totalPlayed = parseInt(gameSetData1[catId1].totalPlayed+1);
			if(gameSetRef.set(gameSetData1)){
				callback(gameSetData1);
			}
		});
};

var updateUserStatForGameEnd = function(catId,subCatId,winnerId,callback){
	var catId1 = 'C'+catId;
	var rootRef = Firebase.database().ref();
	var gameSetRef = rootRef.child('gameSet').child(winnerId);
	gameSetRef.once('value').then(function(snapshot){
		var gameSetData1 = snapshot.val();
		gameSetData1.totalWin = parseInt(gameSetData1.totalWin+1);
		gameSetData1[catId1].totalWin = parseInt(gameSetData1[catId1].totalWin+1);
		if(gameSetRef.set(gameSetData1)){
			callback(true)
		}
	});
};
//function below is written for cli unit testing
/*
process.argv.forEach(function(val,index,array){
	console.log(index + ':' + val);
	if(process.argv[2]){
		switch (process.argv[2]){
			case 'getUserStat':
				getUserStat(process.argv[3],function(result){
					console.log(result);
				});
				break;
			default :
				console.log("Please provide valid parameter");
		}

	}
});
*/
//below is for testing purpose only

//addRoomToUserGameSetHistory("p3Ufuf88QSXeWECkd8jIYmIaQl32","-KcO2XrDVm9Pdm_NnEnB");
//getUserStat("p3Ufuf88QSXeWECkd8jIYmIaQl32");




module.exports = {
	getUserStat:getUserStat,
	updateRoomToUserGameSetHistory:updateRoomToUserGameSetHistory,
	refreshUserStat:refreshUserStat,
	updateUserStatForGameStart:updateUserStatForGameStart,
	updateUserStatForGameEnd:updateUserStatForGameEnd
};
