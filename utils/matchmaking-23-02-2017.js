var Firebase = require('firebase');
var moment = require('moment');

//test if git accepts this file
var isValidRoom = function(roomId,success,error){
	var roomRef = Firebase.database().ref().child('rooms1').child(roomId);
	roomRef.once('value').then(function(snapp){
		if(snapp.exists()){
			success(snapp.val());
		}else{
			error({'msg':'room not exists!!'});
		}
	})
	.catch(function(err){
		error({'msg':'room not exists!!'});
	});
};

var assignRoom = function(userId,catId,subCatId,callback){
	var retRoomData ={};
	lookForAvailableRoom(catId,subCatId,function(roomId){
		console.log('Insert User to available room id : '+roomId);
		//room is available
		addUserToRoom(userId,roomId);
		var roomRef = Firebase.database().ref().child('rooms1').child(roomId);
		roomRef.once('value').then(function(roomSnapp){
			retRoomData = roomSnapp.val();
			callback(retRoomData);
		});
	},function(subcatData){
		console.log('room is not available create room');
		createRoom(catId,subCatId,subcatData,userId,function(roomId){
			var roomRef = Firebase.database().ref().child('rooms1').child(roomId);
			roomRef.once('value').then(function(roomSnapp){
				retRoomData = roomSnapp.val();
				callback(retRoomData);
			});
		});
	});
};

var createRoom = function(catId,subCatId,subCatData,userId,callback){
	//console.log(subCatData);
	var roomsRef = Firebase.database().ref().child('rooms1');
	var roomCatRef = Firebase.database().ref().child('category').child(catId).child('subCategory').child(subCatId);
	var availableRoomsRef = roomCatRef.child('availableRooms');
	var maxPlayerAllowed = subCatData.max || 1;
	var roomData = {
		catId:catId,
		subCatId:subCatId,
		max : maxPlayerAllowed,
		started:false,
		roomFull:false,
		firstUser:userId
	};
	var roomId = roomsRef.push(roomData).key;
	roomsRef.child(roomId).child('roomId').set(roomId);
	addUserToRoom(userId,roomId);
	availableRoomsRef.child(roomId).set({
		available:true
	});
	callback(roomId);
};

var addUserToRoom = function(userId,roomId){
	var roomRef = Firebase.database().ref().child('rooms1').child(roomId);

	roomRef.child('users').child(userId).set({
		playing:true
	});

	roomRef.once('value').then(function(roomSnapp){
		var roomSnappVal = roomSnapp.val();
		var maxAllowed = roomSnappVal.max;
		var totalUser = roomSnapp.child('users').numChildren();
		var users = roomSnapp.child('users');
		users.forEach(function(user){
			//add 60 seconds to users last seen
			var lastSeenWithBuffer = moment(user.val().lastseen).utc() ;
			var now = moment().utc();
			var dif = now.diff(lastSeenWithBuffer,'seconds');
			console.log(dif);
			//console.log(lastSeenWithBuffer.format());
			if(dif > 10){
				var userRef = roomRef.child('users').child(user.key).set({});
				console.log('User : %s deleted from room : %s',user.key,roomId);
				totalUser = roomSnapp.child('users').numChildren();
			}
		});
		setTimeout(function () {
			roomRef.once('value',function(rs){
				totalUser = rs.child('users').numChildren();
				roomRef.child('totalUsers').set(totalUser);
				if(totalUser>=maxAllowed){
					roomRef.child('roomFull').set(true);
					roomRef.child('started').set(true);
					var roomCatRef = Firebase.database().ref().child('category').child(roomSnappVal.catId).child('subCategory').child(roomSnappVal.subCatId);
					var availableRoomsRef = roomCatRef.child('availableRooms');
					var thisRoomRef = availableRoomsRef.child(roomId);
					thisRoomRef.set({});
				}else{
					roomRef.child('roomFull').set(false);
					roomRef.child('started').set(false);
				}
			});
		}, 500);

	});

};

var lookForAvailableRoom = function(catId,subCatId,fn_available,fn_notAvailable){
	console.log('Looking for available room');
	var roomCatRef = Firebase.database().ref().child('category').child(catId).child('subCategory').child(subCatId);
	var availableRoomsRef = roomCatRef.child('availableRooms');
	roomCatRef.once('value').then(function(snapshot){
		var subcatData = snapshot.val();
		if(snapshot.child('availableRooms').exists()){
			//callback available function
			var roomId=null;
			snapshot.child('availableRooms').forEach(function(roomSnapp){
				roomId = roomSnapp.key;
			});
			fn_available(roomId);
		}else{
			//callback not available function
			fn_notAvailable(subcatData);
		}
	}).catch(function(err){
		console.log(err);
	});
};

var isValidUser = function(userId,accessToken,callback){
	var usersRef = Firebase.database().ref().child('users').child(userId).child('accessToken');
	usersRef.once('value')
		.then(function(snapshot){
			if(snapshot.val()===accessToken){
				callback({success:true});
			}else{
				callback({success:false});
			}
		})
		.catch(function(err){
			callback({success:false});
		});
};

var getRoomDetails = function(roomId,callback) {
	var roomRef = Firebase.database().ref().child('rooms1').child(roomId);
	roomRef.once('value')
		.then(function(snapshot){
			var data = snapshot.val();
			if(data){
				callback({success:true,data:data});
			}else{
				callback({success:false});
			}
		})
		.catch(function(err){
			callback({success:false});
		});
};

var getSubCatDetails = function(catId,subCatId,callback) {
	var subCatRef = Firebase.database().ref().child('category').child(catId).child('subCategory').child(subCatId);
	subCatRef.once('value')
		.then(function(snapshot){
			var data = snapshot.val();
			if(data){
				callback({success:true,data:data});
			}else{
				callback({success:false});
			}
		})
		.catch(function(err){
			callback({success:false});
		});
};

module.exports = {
	isValidUser:isValidUser,
	isValidRoom:isValidRoom,
	assignRoom:assignRoom,
	getRoomDetails:getRoomDetails,
	getSubCatDetails:getSubCatDetails
};
