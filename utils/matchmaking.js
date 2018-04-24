var Firebase = require('firebase');
var moment = require('moment');

//test if git accepts this file
var isValidRoom = function(roomId,success,error){
	console.log('----------Inside isValidRoom--------');
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
	console.log('----------Leaving isValidRoom--------');
};

var assignRoom = function(userId,catId,subCatId,callback){
	console.log('----------Inside assignRoom--------');
	var retRoomData ={};
	lookForAvailableRoom(catId,subCatId,function(data){
		//console.log('Insert User to available room id : '+roomId);
		//room is available
		var roomId = data.roomId;
		var usersRef = Firebase.database().ref().child('users').child(userId);
		usersRef.once('value').then(function(snap){
			userData = snap.val();
			if(userData.coin >= data.fees){
				addUserToRoom(userId,roomId,userData.name);
				var roomRef = Firebase.database().ref().child('rooms1').child(roomId);
				roomRef.once('value').then(function(roomSnapp){
					retRoomData = roomSnapp.val();
					callback(retRoomData);
				});
			}else{
				callback({error:true});
			}
		}).catch(function(err){
			console.log(err);
		});
	},function(subcatData){
		//console.log('room is not available create room');
		var usersRef = Firebase.database().ref().child('users').child(userId);
		var userCoinRef = usersRef.child('coin');
		userCoinRef.once('value').then(function(snap){
			var userCoin = snap.val();
			if(userCoin >= subcatData.fees){
				createRoom(catId,subCatId,subcatData,userId,function(roomId){
					var roomRef = Firebase.database().ref().child('rooms1').child(roomId);
					roomRef.once('value').then(function(roomSnapp){
						retRoomData = roomSnapp.val();
						callback(retRoomData);
					});
				});
			}else{
				callback({error:true});
			}
		}).catch(function(err){
			console.log(err);
		});
	});
		console.log('----------Leaving assignRoom--------');

};

var createRoom = function(catId,subCatId,subCatData,userId,callback){
	//console.log(subCatData);
	console.log('----------Inside createRoom--------');

	var roomsRef = Firebase.database().ref().child('rooms1');
	var roomCatRef = Firebase.database().ref().child('category').child(catId).child('subCategory').child(subCatId);
	var availableRoomsRef = roomCatRef.child('availableRooms');
	var maxPlayerAllowed = subCatData.max || 1;
	var dateTime = new Date().getTime();
	var roomData = {
		catId:catId,
		subCatId:subCatId,
		max : maxPlayerAllowed,
		started:false,
		createdDate:dateTime,
		roomFull:false,
		firstUser:userId
	};
	var roomId = roomsRef.push(roomData).key;
	roomsRef.child(roomId).child('roomId').set(roomId);
	var usersRef = Firebase.database().ref().child('users').child(userId);
	usersRef.once('value',function(snapshot){
		var userData = snapshot.val();
		addUserToRoom(userId,roomId,userData.name);
	});

	availableRoomsRef.child(roomId).set({
		available:true
	});
	callback(roomId);
	console.log('----------Leaving createRoom--------');

};

var addUserToRoom = function(userId,roomId,name,roomData){
	var roomRef = Firebase.database().ref().child('rooms1').child(roomId);

	roomRef.child('users').child(userId).set({
		playing:true,
		isActive:true,
		name:name
	});

	roomRef.once('value').then(function(roomSnapp){
		var roomSnappVal = roomSnapp.val();
		var maxAllowed = roomSnappVal.max;
		var totalUser = roomSnapp.child('users').numChildren();
		var users = roomSnapp.child('users');
		/*users.forEach(function(user){
			//add 60 seconds to users last seen
			var lastSeenWithBuffer = moment(user.val().lastseen).utc() ;
			var now = moment().utc();
			var dif = now.diff(lastSeenWithBuffer,'seconds');
			//console.log(dif);
			//console.log(lastSeenWithBuffer.format());
			if(dif > 10){
				var userRef = roomRef.child('users').child(user.key).set({});
				//console.log('User : %s deleted from room : %s',user.key,roomId);
				totalUser = roomSnapp.child('users').numChildren();
			}
		});*/
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

	});

};

var lookForAvailableRoom = function(catId,subCatId,fn_available,fn_notAvailable){
	//console.log('Looking for available room');
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
			fn_available({roomId:roomId,fees:subcatData.fees});
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

var testMatchMaking = function(userId,catId,subCatId,callback){
	var rootRef = Firebase.database().ref();
	var catSubCatRef = rootRef.child('category').child(catId).child('subCategory').child(subCatId);
	var userRef = rootRef.child('users').child(userId);
	var roomRef = rootRef.child('rooms1');
	var availableRoomsRef = catSubCatRef.child('availableRooms');

	var roomId=null;
	catSubCatRef.once('value').then(function(snapshot){
		var subCatData = snapshot.val();
		if(snapshot.child('availableRooms').exists()){
			snapshot.child('availableRooms').forEach(function(roomSnapp){
				roomId = roomSnapp.key;
			});
			userRef.child('name').once('value',function(snapshot){
				var userName = snapshot.val();
				addUserToRoom(userId,roomId,userName);
			});
			var roomIdRef = roomRef.child(roomId);
			roomIdRef.once('value').then(function(roomSnapp){
				retRoomData = roomSnapp.val();
				callback(retRoomData);
			});

		}else{
			var maxPlayerAllowed = subCatData.max || 1;
			var roomData = {
				catId:catId,
				subCatId:subCatId,
				max : maxPlayerAllowed,
				started:false,
				roomFull:false,
				firstUser:userId
			};
			roomId = roomRef.push(roomData).key;
			roomRef.child(roomId).child('roomId').set(roomId);
			var usersNameRef = userRef.child('name');
			usersNameRef.once('value',function(snapshot){
				var userName = snapshot.val();
				addUserToRoom(userId,roomId,userName);
			});

			availableRoomsRef.child(roomId).set({
				available:true
			});

			roomRef.child(roomId).once('value').then(function(roomSnapp){
				retRoomData = roomSnapp.val();
				callback(retRoomData);
			});
		}
	}).catch(function(err){
		console.log(err);
	});
};

module.exports = {
	isValidUser:isValidUser,
	isValidRoom:isValidRoom,
	assignRoom:assignRoom,
	getRoomDetails:getRoomDetails,
	getSubCatDetails:getSubCatDetails,
	testMatchMaking : testMatchMaking
};
