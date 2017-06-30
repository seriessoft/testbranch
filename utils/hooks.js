var Firebase = require('firebase');
var xpCalculator = require('./xpCalculator');
var moment = require('moment');

var init = function(){
	//RoomAddedListner();
	//onNewRoomAdded();
	//onGameWin();
	//onXpChange();
	//mapEmailToUser();
	//mapFacebookIdToUser();
	mapEmailFacebookIdToUser();
};

// both email and facebook

var mapEmailFacebookIdToUser = function(){
	var usersRef = Firebase.database().ref().child('users');
	var emailsRef = Firebase.database().ref().child('emails');
	var facebookIdsRef = Firebase.database().ref().child('facebookIds');
	usersRef.once('child_added',function(snapp){
		var email = snapp.val().email || null;
		var facebookId = snapp.val().facebookId || null;
		var userId = snapp.key;
		if(email){
			emailsRef.child(__encode(email)).set(userId);
		}
		if(facebookId){
			facebookIdsRef.child(__encode(facebookId)).set(userId);
		}
	});
};


//Lister for room on value
var RoomAddedListner = function(){
	var roomsRef = Firebase.database().ref().child('rooms1');
	roomsRef.once('value',function(snapp){
		snapp.forEach(function(roomSnapp){
			if(!roomSnapp.child('roomId').exists()){
				roomsRef.child(roomSnapp.key).child('roomId').set(roomSnapp.key);
			}

		});
	});
};

//var onNewRoomAdded

var onNewRoomAdded = function(){
	var roomsRef = Firebase.database().ref().child('rooms1');
	roomsRef.once('child_added',function(roomSnapp){
		watchForOnlineUser(roomSnapp.key);
	});
};

//listner for userpsersence
var watchForOnlineUser = function(roomId){
	var usersInRoomRef = Firebase.database().ref().child('rooms1').child(roomId).child('users');
	usersInRoomRef.once('value',function(usersSnapp){
		usersSnapp.forEach(function(user){
			var userId = user.key;
			var lastSeen = user.val().lastseen || null;
			var h=null;
			if(lastSeen){
				h = Date(lastSeen);
			}
			//console.log('user : '+userId+' last seen at : '+h);
			var userlastSeenRef = Firebase.database().ref().child('users').child(userId).child('lastseen');
			userlastSeenRef.set(lastSeen);

		});
		//deleteInactiveUserFromRoom(roomId);
	});
};

// var deleteInactiveUserFromRoom = function(roomId){
// 	var roomsRef = Firebase.database().ref().child('rooms1').child(roomId);
// 	roomsRef.on('value',function(roomSnapp){
// 		if(roomSnapp.val().started===false){
// 			users = roomSnapp.child('users');
// 			users.forEach(function(user){
// 				//add 60 seconds to users last seen
// 				var lastSeenWithBuffer = moment(user.val().lastseen).utc() ;
// 				var now = moment().utc();
// 				var dif = now.diff(lastSeenWithBuffer,'seconds');
// 				console.log(dif);
// 				//console.log(lastSeenWithBuffer.format());
// 				if(dif > 60){
// 					var userRef = roomsRef.child('users').child(user.key).set({});
// 					console.log('User : %s deleted from room : %s',user.key,roomId);
// 				}
// 			});
// 		}else{
// 			console.log('Room : %s has started',roomId);
// 		}
// 	});
// };

//listen for winner
var onGameWin = function(){
	var roomsRef = Firebase.database().ref().child('room1');
	roomsRef.once('child_added',function(roomSnap){
		var roomId = roomSnap.key;
		roomsRef.child(roomId).child('winnerId').on('value',function(winner){
			var winnerId = winner.key;
			console.log(winnerId);
		});
	});
};

//listen for xpchange
var onXpChange = function(){
	var usersRef = Firebase.database().ref().child('users');
	usersRef.once('child_added',function(userSnapp){
		if(!userSnapp.val().xpStat){
			xpRef= usersRef.child(userSnapp.key).child('xp');
			xpRef.once('value',function(xpSnapp){
				xpCalculator.setUserXpStats(userSnapp.key,function(xpStat){
					//console.log(xpStat);
				});
			});
		}

	});
};

//email to user map table

var mapEmailToUser = function(){
	var usersRef = Firebase.database().ref().child('users');
	var emailsRef = Firebase.database().ref().child('emails');
	usersRef.once('child_added',function(snapp){
		var email = snapp.val().email || null;
		var userId = snapp.key;
		if(email){
			emailsRef.child(__encode(email)).set(userId);
		}
	});
};

var mapFacebookIdToUser = function(){
	var usersRef = Firebase.database().ref().child('users');
	var emailsRef = Firebase.database().ref().child('facebookIds');
	usersRef.once('child_added',function(snapp){
		var email = snapp.val().facebookId || null;
		var userId = snapp.key;
		if(email){
			emailsRef.child(__encode(email)).set(userId);
		}

	});

};

/*var mapNamesToUser = function(){
	var usersRef = Firebase.database().ref().child('users');
	var namesRef = Firebase.database().ref().child('names');
	usersRef.on('child_added',function(snapp){
		var name = snapp.val().name || null;
		var userId = snapp.key;
		if(name != 'Guest'){
			emailsRef.child(__encode(name)).set(userId);
		}
	});
};*/

var __encode = function(text){
	var base64 = new Buffer(text).toString('base64');
	return base64;
};



module.exports = {
	init:init
};
