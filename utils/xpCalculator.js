var Firebase = require('firebase');
/* uncomment below for unit testing */
// var Config = require('./config');
// var fbconfig = Config.getfirebaseConfig();
// Firebase.initializeApp(fbconfig);
/* end of unit testing init */




var setUserXpStats = function(userId,callback){
	var rootRef = Firebase.database().ref();
	var userXp;
	var userPrevLvl;
	var currentCoins;
	var userRef = rootRef.child('users').child(userId);
	var userXpStat={};
	userRef.once('value',function(userSnapp){

		if(!userSnapp.exists()){
			console.error('Error : User'+userId+' do not exists!!');
			return;
		}
		userXp = userSnapp.val().xp || 0;
		if(!userSnapp.val().xpStat){

			userXpStat ={
				lvl : 0
			};
			console.log('lvl set');
		}else{
			userXpStat = userSnapp.val().xpStat;
		}

		userPrevLvl = userXpStat.lvl || 0;
		currentCoins = userSnapp.val().coin || 0;

		getLvl(userXp,function(xpStat){
			userRef.child('xpStat').set(xpStat);
			userRef.child('label').set(xpStat.lvl);
			awardCoin(userPrevLvl,xpStat.lvl,function(coins){
				console.log("Adding %s coins to user %s from lvl:%s to lvl:%s",coins,userId,userPrevLvl,xpStat.lvl);
				var totalCoins = currentCoins+coins;
				console.log("setting %s coins to user : %s",totalCoins,userId);
				userRef.child('coin').set(totalCoins);
				if(callback){
					callback(xpStat);
				}
			});

		});

	});
};

var awardCoin = function(userPrevLvl,userCurLvl,callback){
	var rootRef = Firebase.database().ref();
	var xpRuleRef = rootRef.child('xpRule');
	var coins = 0;
	if(userCurLvl > userPrevLvl){
		//need to save this record
		//console.log("Need to save this record");
		var i = userCurLvl > userPrevLvl;

		xpRuleRef.once('value',function(snapp){
			snapp.forEach(function(ruleSnapp){
				if(ruleSnapp.key > userPrevLvl && ruleSnapp.key <= userCurLvl){
					//console.log('Rule Lvl: '+ruleSnapp.key);
					//console.log(ruleSnapp.val());
					var coinVal = ruleSnapp.val().coinReward || 0;
					coins+=coinVal;
				}
			});
			callback(coins);
		});
	}else{
		callback(0);
	}
};
//test awardCoin
//awardCoin(1,6);

var getLvl = function(userXp,cb){
	var rootRef = Firebase.database().ref();
	var xpRuleRef = rootRef.child('xpRule');
	xpRuleRef.once('value',function(snapp){
		var xpStat = {
			lvl:0,
			currentTotal:userXp,
			remainingXpForNxtLvl:0,
			nextLvl:0,
			percentCompleted:0
		};
		var lvl =0;
		var nextLvlFound =false;
		var prevLvlRuleData ={};
		snapp.forEach(function(lvlSnapp){
			var totalXpRequired = lvlSnapp.val().totalXpRequired;
			if(totalXpRequired > userXp && !nextLvlFound){
				//console.log(totalXpRequired);
				prevLvlTotalRequiredXP = prevLvlRuleData.totalXpRequired || 0;
				nextLvlFound = true;
				xpStat.lvl =(lvlSnapp.key-1);
				xpStat.nextLvl = lvlSnapp.key;
				xpStat.currentTotal = userXp;
				xpStat.totalXpRequiredForNxtLvl = totalXpRequired;
				xpStat.lvlXp = userXp - prevLvlTotalRequiredXP;
				xpStat.remainingXpForNxtLvl = totalXpRequired-userXp;
				xpStat.percentCompleted = (xpStat.lvlXp*100)/(xpStat.lvlXp+xpStat.remainingXpForNxtLvl);
			}
			prevLvlRuleData = lvlSnapp.val();
		});
		cb(xpStat);
	});
};

var redefine = function(){
	var rootRef = Firebase.database().ref();
	console.log('Redefining the xpRule');
	var xpRuleRef = rootRef.child('xpRule');
	xpRuleRef.once('value',function(snapp){
		var i =0;
		var totalXpRequired=0;
		snapp.forEach(function(cSnapp){
			//code below set xpRequiredFroNextLvl from initial value only run once to reset data.
			//xpRuleRef.child(cSnapp.key).child('xpRequiredFroNextLvl').set(cSnapp.val());
			totalXpRequired+=cSnapp.val().xpRequiredFroNextLvl;
			xpRuleRef.child(cSnapp.key).child('totalXpRequired').set(totalXpRequired);
		});
	});
};


//redefine();
//setUserXpStats('yzFHauW8UrVOaci9kYcdS5Yaf4s2');
module.exports = {
	setUserXpStats : setUserXpStats
};

//https://monopoly-2ffc6.firebaseio.com/users/yzFHauW8UrVOaci9kYcdS5Yaf4s2
