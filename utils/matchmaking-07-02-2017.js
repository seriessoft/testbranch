var Firebase = require('firebase');

var isValidRoom = function(roomId,success,error){
	var roomRef = Firebase.database().ref().child('rooms1').child(roomId);
	roomRef.once('value').then(function(snapp){
		if(snapp.val()){
			success(snapp.val());
		}else{
			error({'msg':'room not exists!!'});
		}
	})
	.catch(function(err){
		error({'msg':'room not exists!!'});
	});
};

var assignRoom = function(userId,catId,subCatId,roomId,callback){
	var subCatRef = Firebase.database().ref().child('category').child(catId).child('subCategory').child(subCatId);
	var roomRef = Firebase.database().ref().child('rooms1');
	subCatRef.once('value', function(snapshot) {
		if(subCatData.availableRoomId){
			roomRef.child(subCatData.availableRoomId).once('value',function(snapshot){
				var roomData = snapshot.val();
				var userKey = 'userId_'+roomData.playerNumber;
				roomData.playerNumber = parseInt(roomData.playerNumber+1);
				if(roomData.playerNumber === roomData.max){
						roomData.roomFull = true;
						roomData.status='Full';
						roomData.users[userId]={
																'online':true
															};
						roomRef.child(subCatData.availableRoomId).set(roomData);
						roomData.roomId = subCatData.availableRoomId;
						subCatData.availableRoomId = false;
						subCatRef.set(subCatData);
						roomData.roomId = subCatData.availableRoomId;
						res.send({
							errorcode:0,
							msg:'Room created',
							data:roomData
						});
				}else{
					roomData.users.userKey=userId;
					roomRef.child(subCatData.availableRoomId).set(roomData);
					roomData.roomId = subCatData.availableRoomId;
					res.send({
						errorcode:0,
						msg:'Room created',
						data:roomData
					});
				}
			});
		}else{
			var roomData = {
				'catId':catId,
				'subCatId':subCatId,
				'max':subCatData.max,
				'started':false,
				'roomFull':false,
				'playerNumber':1,
				'status':'Not Full',
				'users':{
					userId:{
						'online':true
					}
				},
				'firstUser':userId
			};
			var roomId = roomRef.push(roomData).key;
			subCatData.availableRoomId = roomId;
			subCatRef.set(subCatData);
			roomData.roomId = roomId;
			res.send({
				errorcode:0,
				msg:'Room created',
				data:roomData
			});
		}
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
	getRoomDetails:getRoomDetails,
	getSubCatDetails:getSubCatDetails,
	assignRoom:assignRoom

};
