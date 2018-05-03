var WebSocketServer = require('websocket').server;
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var Firebase = require('firebase');
var fileUpload = require('express-fileupload');
var Cal = require('./utils/cal');
var Admin = require('./utils/admin');
var Common = require('./utils/common');
var Matchmaking = require('./utils/matchmaking');
var AppConfig = require('./utils/config');
var Hooks = require('./utils/hooks');
var xpCalculator = require('./utils/xpCalculator');
var gameStats = require('./utils/gameStats');
var app = express();
var port = process.env.PORT || 5000;
var wsport = 1337;
//var Khalil = "I Love You Very Much"
/* client's firebase credentials changes are also requird in utils/admin.js for admin credential */

var config = {
    apiKey: "AIzaSyCj1gTHtLAbAYXAxbxyzMHWRCbKihvzdH8",
    authDomain: "saudideal-922d4.firebaseapp.com",
    databaseURL: "https://saudideal-922d4.firebaseio.com",
    projectId: "saudideal-922d4",
    storageBucket: "saudideal-922d4.appspot.com",
    messagingSenderId: "820015895373"
};
/*
our firebase credential
Hello there, i am nice
and i love you
var config = {
	apiKey: "AIzaSyBILjsq_QSbE8X-H2tiSxJxX5i1AV139nI",
    authDomain: "monopoly-2ffc6.firebaseapp.com",
    databaseURL: "https://monopoly-2ffc6.firebaseio.com",
    storageBucket: "monopoly-2ffc6.appspot.com",
    messagingSenderId: "68477236556"
};
*/
Firebase.initializeApp(config);
//initialize hook to listen to firebase event and make changes behind the scne
//though this should be avoided as it may interfare the server logic.
Hooks.init();

app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(fileUpload());



//var clients =[];

var connections = {};
var connectionIDCounter = 0;

function messageSendToUser(key, data){
	console.log(data);
	console.log(key);
	var connection = connections[key];
	if (connection) {
		connection.send(JSON.stringify(data));
	}
}

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

server = app.listen(port,function(){
	console.log('SaudiDeal Server is running on port : '+port);
});

// server.listen(wsport, function() {
// 	console.log("Socket is listning to : "+wsport);
// });
console.log(port);
wsServer = new WebSocketServer({
	httpServer: server
});

wsServer.on('request', function(request) {
	var connection = request.accept(null, request.origin);
	//var index = clients.push(connection)-1;

	connection.id = connectionIDCounter ++;
	connections[connection.id] = connection;
	var matchMakingId = false;
	var GloUserId = false;
	console.log('connected');
	console.log(connection.id);
	//console.log(khalil)
	connection.on('message', function(message) {
		var reqM={};
		if (message.type === 'utf8') {
			reqM = message.utf8Data;
			reqM = JSON.parse(reqM);

			var calltoken = reqM.calltoken || 0;
			switch (reqM.type) {
				case "PING":
					calltoken = reqM.calltoken;
					connection.sendUTF(JSON.stringify({calltoken:calltoken,type:reqM.type}));
					break;
				case "VERSION_CHECK":
					calltoken = reqM.calltoken;
					var serverVersion = 0;
					var clientVersion = parseFloat(reqM.version);
					var platform = reqM.platform;
					console.log('------------------version Check1-2-3------------------');
					console.log(reqM);
					console.log("clientVersion : ", clientVersion);
					if(platform === 'android'){
						serverVersion = 1.0;
						if(serverVersion > clientVersion){
							connection.sendUTF(JSON.stringify({calltoken:calltoken,type:'UPDATE_APP',url:"https://play.google.com/store/apps/details?id=com.khalil.saudideal2&hl=en"}));
						}
					}else if(platform === 'ios'){
						serverVersion = 1.4;
						console.log("serverVersion : " ,serverVersion);
						if(serverVersion > clientVersion){
							console.log('ok');
							connection.sendUTF(JSON.stringify({calltoken:calltoken,type:'UPDATE_APP',url:"https://itunes.apple.com/us/app/saudi-deal/id1149271778?mt=8"}));
						}
					}
					break;
				case "USER_RECONNECT":
					if(reqM.userId){
						GloUserId = reqM.userId;
					}
					if(reqM.roomId){
						matchMakingId = reqM.roomId;
						console.log(matchMakingId);
						var rootRef = Firebase.database().ref();
						var roomRef = rootRef.child('rooms1').child(matchMakingId).child('users');
						roomRef.once('value').then(function(snap){
							var roomData = snap.val();
							Object.keys(roomData).forEach(function(key) {
								if(key != GloUserId){
									var userRef = rootRef.child('users').child(key);
									userRef.once('value').then(function(snap){
										console.log(snap.val().connectionId);
										messageSendToUser(snap.val().connectionId,{'type':'USER_CONNECTED',"userId":GloUserId});
									}).catch(function(err){
										console.log(err);
									});
									console.log('Other User : ' + key);
								}else{
									rootRef.child('users').child(GloUserId).child('connectionId').set(connection.id);
									roomRef.child(GloUserId).child('isActive').set(true);
									var numberOfUser = snap.numChildren();
									var userArr = [];
									var i =1;
									Object.keys(roomData).forEach(function(k) {
										if(k != GloUserId){
											if(roomData[k].isActive){
												userArr.push(k);
											}
										}
										if(numberOfUser === i){
											connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:"Socket reconnect",type:reqM.type,userId:userArr}));
										}
										i++;
									});
								}
						    });
						}).catch(function(err){
							console.log(err);
							connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:"Please send valied room id",type:reqM.type}));
						});
					}
					break;
				case "LOGIN":
					/*
					if(reqM.email && reqM.password){
						var email = reqM.email;
						var password = reqM.password;
						
						Firebase.auth().signInWithEmailAndPassword(email, password).then(function(firebaseUser) {
							
							
							
							var userId = firebaseUser.uid;
							
							
							var userRef = Firebase.database().ref().child('users').child(userId);
							
							
								userRef.once('value', function(snapshot) {
									
									if (snapshot) {
										
										console.log('------------------Seriessoft2--------------------');
										var data = snapshot.val();
										GloUserId =userId;
								
								
										if(data){
											data.userId = userId;
											userRef.child('connectionId').set(connection.id);
											connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully registered',data:data}));
										}else{
											connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'No data in dataBase'}));
										}
								
									}else{
										console.log('------------------Seriessoft3--------------------');
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'No data in dataBase'}));
									}
								
								
								});
							
							
							
						}).catch(function(error) {
							console.log(error);
							console.log('------------------Seriessoft3--------------------');
							connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'username password does not match.'}));
						});
					}else{
						console.log('------------------Seriessoft4--------------------');
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
					
					*/
					
					
					
					
				case "GUEST_LOGIN":
					var defauldId = new Date().getTime();
					var accessToken = new Date().getTime();
					var userId = reqM.userId || defauldId;
					var userRef = Firebase.database().ref().child('users').child(userId);
					var gameSetRef = Firebase.database().ref().child('gameSet').child(userId);
					var data = {
						'accessToken':accessToken,
						'freeCoinPickupTime':defauldId,
						'name':'Guest',
						'email':'',
						'coin':20,
						'xp':0,
						'label':1,
						'profilePic':'',
						'purchaseCoin':0,
						'totalPlayed':0,
						'totalWin':0,
						'created':defauldId
					};
					if(userRef.set(data)){
						Common.setUserStats(userId,function(snapp){
							xpCalculator.setUserXpStats(userId,function(xpStat){
								//todo: any action that is needed when callbacked
							});
							data.userId = userId;
							GloUserId =userId;
							connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully registered',data:data}));
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Problem in user set'}));
					}
					break;
				case "REGISTRATION_WITH_EP":
					if(reqM.email && reqM.name && reqM.password){
						var accessToken = new Date().getTime();
						var defaultDate = new Date().getTime();
						var email = reqM.email;
						var name = reqM.name;
						var password = reqM.password;
						var guestId = reqM.guestId;
						console.log(reqM);
						if(guestId === 0){
							Firebase.auth().createUserWithEmailAndPassword(email, password).then(function(firebaseUser) {
								var userId = firebaseUser.uid;
								console.log('createUserWithEmailAndPassword user Id  :  '+userId);
								var data = {
									'accessToken':accessToken,
									'freeCoinPickupTime':defaultDate,
									'name':name,
									'email':email,
									'coin':20,
									'xp':0,
									'label':1,
									'purchaseCoin':0,
									'totalPlayed':0,
									'totalWin':0,
									'created':defaultDate
								};
								var userRef = Firebase.database().ref().child('users').child(userId);
								var gameSetRef = Firebase.database().ref().child('gameSet').child(userId);
								if(userRef.set(data)){
									Common.setUserStats(userId,function(snapp){
										xpCalculator.setUserXpStats(userId,function(xpStat){
											//todo: any action that is needed when callbacked
										});
										data.userId = userId;
										GloUserId =userId;
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully registered',data:data}));
									});
								}
							}).catch(function(error){
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'email already exsits.'}));
							});
						}else{
							var userRef1 = Firebase.database().ref().child('users').child(guestId);
							//console.log('guestId : '+guestId);
							userRef1.once('value', function(snapshot) {
							  var data = snapshot.val();
							  //console.log('Guest user details');
							  //console.log(data);
								if(data){
									Firebase.auth().createUserWithEmailAndPassword(email, password).then(function(firebaseUser) {
										//userRef1.remove();
										data.email = email;
										data.name = name;
										var userId = firebaseUser.uid;
										var userRef2 = Firebase.database().ref().child('users').child(userId);
										GloUserId =userId;
										userRef2.set(data);
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully registered',data:data}));
									}).catch(function(error){
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'email already exsits.'}));
									});
								}else{
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'GuestId does not exists.'}));
								}
							});
						}
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'REGISTRATION_WITH_FB':
					if(reqM.facebookId){
						var name = reqM.name;
						var facebookImage = reqM.facebook_image;
						var guestId = JSON.parse(reqM.guestId);
						var email = reqM.email;
						var facebookId = reqM.facebookId;
						var emailEncode = new Buffer(email).toString('base64');
						var facebookIdEncode = new Buffer(facebookId).toString('base64');
						var rootRef = Firebase.database().ref();
						var facebookIdsRef = rootRef.child('facebookIds').child(facebookIdEncode);
						facebookIdsRef.once('value').then(function(snapshot){
							var FBuserId = snapshot.val();
							if(FBuserId){
								var emailsRef = rootRef.child('emails').child(emailEncode);
								emailsRef.once('value').then(function(snapshot){
									var EmailuserId = snapshot.val();
									if(EmailuserId){
										if(EmailuserId === FBuserId){
											userRef = rootRef.child('users').child(FBuserId);
											userRef.once('value').then(function(snapshot){
												var data = snapshot.val();
												//data.accessToken = new Date().getTime();
												if(name){
													data.name = name;
												}
												if(facebookImage){
													data.profilePic = facebookImage;
												}
												if(userRef.set(data)){
													data.userId = FBuserId;
													GloUserId =FBuserId;
													connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully login',data:data}));
												}
											});
										}else{
											connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'some problem in login'}));
										}
									}else{
										userRef = rootRef.child('users').child(FBuserId);
										userRef.once('value').then(function(snapshot){
											var data = snapshot.val();
											//data.accessToken = new Date().getTime();
											data.email = email;
											if(name){
												data.name = name;
											}
											if(facebookImage){
												data.profilePic = facebookImage;
											}
											if(userRef.set(data)){
												data.userId = FBuserId;
												GloUserId =FBuserId;
												connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully login',data:data}));
											}
										});
									}
								});
							}else{
								var emailsRef = rootRef.child('emails').child(emailEncode);
								emailsRef.once('value').then(function(snapshot){
									var EmailuserId = snapshot.val();
									if(EmailuserId){
										userRef = rootRef.child('users').child(EmailuserId);
										userRef.once('value').then(function(snapshot){
											var data = snapshot.val();
											//data.accessToken = new Date().getTime();
											data.facebookId = facebookId;
											if(name){
												data.name = name;
											}
											if(facebookImage){
												data.profilePic = facebookImage;
											}
											if(userRef.set(data)){
												data.userId = EmailuserId;
												GloUserId =EmailuserId;
												connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully login',data:data}));
											}
										});
									}else{
										userRef = rootRef.child('users');
										if(guestId === 0){
											var userId = new Date().getTime();
											var userRef = userRef.child(userId);
											var accessToken = new Date().getTime();
											var defauldId = new Date().getTime();
											var data = {
												'accessToken':accessToken,
												'freeCoinPickupTime':defauldId,
												'name':name,
												'facebookId':facebookId,
												'email':email,
												'coin':20,
												'profilePic':facebookImage,
												'xp':0,
												'label':1,
												'purchaseCoin':0,
												'totalPlayed':0,
												'totalWin':0,
												'created':defauldId
											};
											if(userRef.set(data)){
												Common.setUserStats(userId,function(snapp){
													xpCalculator.setUserXpStats(userId,function(xpStat){
														//todo: any action that is needed when callbacked
													});
													data.userId = userId;
													GloUserId =userId;
													connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully login',data:data}));
												});
											}
										}else{
											userRef = userRef.child(guestId);
											userRef.once('value').then(function(snapshot){
												var data = snapshot.val();
												if(name){
													data.name = name;
												}
												if(email){
													data.email = email;
												}
												if(facebookImage){
													data.profilePic = facebookImage;
												}
												data.facebookId = facebookId;
												//data.accessToken = new Date().getTime();
												if(userRef.set(data)){
													data.userId = guestId;
													GloUserId =guestId;
													connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully login',data:data}));
												}
											})
											.catch(function(err){
												connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send valied guestId'}));
											});
										}
									}
								});
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send facebookId and email id'}));
					}
					break;
				case 'USER_DETAILS':
					if(reqM.userId && reqM.accessToken){
						var userId = reqM.userId;
						var accessToken = JSON.parse(reqM.accessToken) || 0;
						var inApp = reqM.in_app || "N";
						var rootRef = Firebase.database().ref();
						var userRef = rootRef.child('users');
						userRef.child(userId).once('value', function(snapshot) {
						  var data = snapshot.val();
							if(data){
								if(data.accessToken === accessToken){
									if(inApp === "Y"){
										data.offerVal = 0;
										data.isOffer = "N";
									}
									data.userId = userId;
									giftOfferRef = rootRef.child('giftOffer').child('someIds');
									if(data.isGiftOfferAvailable === 'true'){
										giftOfferRef.once('value').then(function(snap){
											var giftData = snap.val();
											var currentD = new Date().getTime();
											var startD = new Date(giftData.startDate).getTime();
											var endD = new Date(giftData.endDate).getTime();
											if(currentD <= endD && currentD >= startD){
												data.offerCoin = giftData.coin;
												GloUserId =userId;
												//console.log(connection.id);
												userRef.child(userId).child('connectionId').set(connection.id);
												connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully',data:data}));
											}else{
												data.offerCoin = 0;
												GloUserId =userId;
												//console.log(connection.id);
												userRef.child(userId).child('connectionId').set(connection.id);
												connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully',data:data}));
											}

										}).catch(function(err){
											res.send({errorcode:0,coin:0});
										});
									}else{
										data.offerCoin = 0;
										GloUserId =userId;
										//console.log(connection.id);
										userRef.child(userId).child('connectionId').set(connection.id);
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Successfully',data:data}));
									}
								}else{
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Access token does not exists'}));
								}
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'User id does not exists'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'GAME_START':
					if(reqM.subCatId && reqM.catId && reqM.PlayerID && reqM.userId && reqM.accessToken){
						var subCatId = reqM.subCatId;
						var catId = reqM.catId;
						var PlayerID = reqM.PlayerID;
						var userId = reqM.userId;
						var accessToken = JSON.parse(reqM.accessToken);
						var userRef = Firebase.database().ref().child('users');
						var gameSetRef = Firebase.database().ref().child('gameSet');
						var gameRef = Firebase.database().ref().child('games');
						var subCatRef = Firebase.database().ref().child('category').child(catId).child('subCategory').child(subCatId);
						var userCheckAccessToken = userRef.child(userId);
						userCheckAccessToken.once('value',function(snapshot){
							var userDetails = snapshot.val();
							var userAccessToken = userDetails.accessToken;
							if(userAccessToken === accessToken){
								subCatRef.once('value', function(snapshot) {
								  result = snapshot.val();
									if(result){
										var playerList = PlayerID.split(",");
										var gamedata = {};
										var dateTime = new Date().getTime();
										var data={
											'winner_id':0,
											'cat_id':catId,
											createdDate:dateTime,
											'sub_cat_id':parseInt(subCatId),
											'play_date':new Date()
										};
										var i =1;
										var result1={};
										playerList.forEach(function(item) {
											var j = 'player_id_'+parseInt(i);
											data[j] = item;
											i++;
											var userRef1 = userRef.child(item);
											userRef1.once('value', function(snapshot) {
												result1 = snapshot.val() || {};
												result1.coin = result1.coin || 0;
												result1.totalPlayed = result1.totalPlayed || 0;
												result1.fees = result1.fees || 0;
												result1.xp = result1.xp || 0;
												result1.loserXP = result1.loserXP || 0;
												result1.coin = parseInt(result1.coin-result.fees);
												result1.totalPlayed = parseInt(result1.totalPlayed+1);
												result1.xp = parseInt(result1.xp+result.loserXP);
												userRef1.set(result1);
												xpCalculator.setUserXpStats(snapshot.key,function(xpStat){
													//todo: any action that is needed when callbacked
												});
												gameStats.updateUserStatForGameStart(catId,subCatId,result.fees,snapshot.key,function(){
													//res.send({errorcode:0,msg:'Success',data:data});
												});
											});
										});
										var gameId = gameRef.push(data).key;
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success',data:{gameId:gameId}}));
									}else{
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Category and SubCategory does not exsits'}));
									}
								});
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Access token does not exists'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'GAME_END':
					if(reqM.winningId && reqM.gameId && reqM.userId && reqM.accessToken && reqM.roomId){
						var database = Firebase.database().ref();
						var gameId = reqM.gameId;
						var winningId = reqM.winningId;
						var userId = reqM.userId;
						var roomId = reqM.roomId;
						var accessToken = JSON.parse(reqM.accessToken);
						var gameRef = database.child('games').child(gameId);
						var userRef = database.child('users').child(userId);
						var roomRef = database.child('rooms1').child(roomId);
						userRef.once('value',function(snapshot){
							var userDetails = snapshot.val();
							userRef = database.child('users').child(winningId);
							if(userDetails.accessToken === accessToken){
								gameRef.once('value', function(snapshot) {
									var resultGame = snapshot.val();
									gameRef.remove();
									roomRef.remove();
									if(resultGame.winner_id ===0){
										var subCatRef = database.child('category').child(resultGame.cat_id).child('subCategory').child(resultGame.sub_cat_id);
										subCatRef.once('value', function(snapshot) {
												resultSubCat = snapshot.val();
												userRef.once('value', function(snapshot) {
													resultUser = snapshot.val();
													resultUser.coin = parseInt(resultUser.coin+resultSubCat.winningCoin);
													resultUser.totalWin = parseInt(resultUser.totalWin+1);
													resultUser.xp = parseInt(resultUser.xp+resultSubCat.winnerXP-resultSubCat.loserXP);
													if(userRef.set(resultUser)){
														resultGame.winner_id = winningId;
														xpCalculator.setUserXpStats(snapshot.key,function(xpStat){
															//todo: any action that is needed when callbacked
														});
														gameStats.updateUserStatForGameEnd(resultGame.cat_id,resultGame.sub_cat_id,winningId,function(snapp){
															connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Game end successfully'}));
														});
													}
												});
										});
									}else{
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Game already ended'}));
									}
								});
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:"Access token does not exists"}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'IN_APP_OFFER':
					var inAppOfferRef = Firebase.database().ref().child('inAppOffers');
					inAppOfferRef.on('value',function(snapshot){
						var data1 = snapshot.val();
						var data = [];
						if(data1){
							for( var i in data1 ) {
								if (data1.hasOwnProperty(i)){
										 data1[i].id = i;
										 data1[i].available="N";
								   data.push(data1[i]);
								}
							}
							connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success',data:data}));
						}else{
							connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'No data found'}));
						}
					});
					break;
				case 'IN_APP_PURCHASE':
					if(reqM.offerId && reqM.userId){
						var offerId = reqM.offerId;
						var userId = reqM.userId;
						inAppOfferRef = Firebase.database().ref().child('inAppOffers').child(offerId);
						inAppOfferRef.once('value',function(snapshot){
							var data = snapshot.val();
							if(data){
								var paymentDate = new Date();
								var startOfferDate = new Date(data.startOfferDate);
								var endOfferDate = new Date(data.endOfferDate);
								if((paymentDate > startOfferDate) && (paymentDate < endOfferDate)){
									if(data.extraCoinPercentage){
										data.extraCoin = (data.coinValue*data.extraCoinPercentage/100);
									}else{
										data.extraCoin = 0;
									}
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success',data:data}));
								}else{
									data.extraCoin = 0;
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success',data:data}));
								}
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send valied offer id'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'UPDATE_XP_LABLE':
					if(reqM.userId && reqM.accessToken && reqM.label && reqM.xp){
						var userId = reqM.userId;
						var accessToken = JSON.parse(reqM.accessToken);
						var label = JSON.parse(reqM.label);
						var xp = JSON.parse(reqM.xp);
						var userRef = Firebase.database().ref().child('users').child(userId);
						userRef.once('value',function(snapshot){
							var result = snapshot.val();
							if(result.accessToken === accessToken){
								result.label = parseInt(result.label+label);
								result.xp = parseInt(result.xp+xp);
								if(userRef.set(result)){
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success'}));
								}
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Access token does not exists'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'GET_PICKUP_TIME':
					if(reqM.userId && reqM.accessToken){
						var userId = reqM.userId;
						var currentDate = new Date();
						var accessToken = JSON.parse(reqM.accessToken);
						var userRef = Firebase.database().ref().child('users').child(userId);
						userRef.once('value',function(snapshot){
							var userDetails = snapshot.val();
							var data={};
							if(userDetails.accessToken === accessToken){
								var userDate = new Date(userDetails.freeCoinPickupTime);
								var timeDiff = currentDate-userDate;
								data.timeDiff = timeDiff;
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success',data:data}));
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Access token does not exists'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'UPDATE_PICKUP_TIME':
					if(reqM.userId && reqM.accessToken && reqM.coin){
						var userId = reqM.userId;
						var accessToken = JSON.parse(reqM.accessToken);
						var coin = JSON.parse(reqM.coin);
						var userRef = Firebase.database().ref().child('users').child(userId);
						userRef.once('value',function(snapshot){
							var result = snapshot.val();
							if(result.accessToken === accessToken){
								result.freeCoinPickupTime = new Date().getTime();
								result.coin = parseInt(result.coin+coin);
								if(userRef.set(result)){
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success'}));
								}
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Access token does not exists'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'PURCHASE_COINS':
					if(reqM.userId && reqM.accessToken && reqM.coin){
						var userId = reqM.userId;
						var accessToken = JSON.parse(reqM.accessToken);
						var coin = JSON.parse(reqM.coin);
						var userRef = Firebase.database().ref().child('users').child(userId);
						userRef.once('value',function(snapshot){
							var result = snapshot.val();
							if(result.accessToken === accessToken){
								result.coin = parseInt(result.coin+coin);
								if(userRef.set(result)){
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success'}));
								}
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Access token does not exists'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case 'CHECK_ACCESS_TOKEN':
						if(reqM.userId && reqM.accessToken){
							var userId = reqM.userId;
							var accessToken = JSON.parse(reqM.accessToken);
							var userRef = Firebase.database().ref().child('users').child(userId);
							userRef.once('value',function(snapshot){
								var result = snapshot.val();
								if(result.accessToken === accessToken){
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Success'}));
								}else{
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Access token does not exists'}));
								}
							});
						}else{
							connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
						}
					break;
				case 'CHANGE_PASSWORD':
						if(reqM.userId && reqM.accessToken && reqM.newPassword){
							var userId = reqM.userId;
							var accessToken = JSON.parse(reqM.accessToken);
							var userRef = Firebase.database().ref().child('users').child(userId);
							var newPassword = reqM.newPassword;
							userRef.once('value',function(snapshot){
								var result = snapshot.val();
								if(result.accessToken === accessToken){
									Admin.changePassword(userId,newPassword,function(userData){
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Password has been changed successfully'}));
									},function(err){
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Some problem'}));
									});
								}else{
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Access token does not exists'}));
								}
							});
						}else{
							connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
						}
					break;
				case 'USER_GAME_ANALYTICS':
					if(reqM.userId && reqM.accessToken){
						var userId = reqM.userId;
						var accessToken = JSON.parse(reqM.accessToken);
						var userRef = Firebase.database().ref().child('users').child(userId);
						userRef.once('value',function(snapshot){
							var result = snapshot.val();
							if(result.accessToken === accessToken){
								var gameSetRef = Firebase.database().ref().child('gameSet').child(userId);
								gameSetRef.once('value').then(function(snapshot){
									var data = snapshot.val();//Common.parseGameStat(snapshot.val());
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'successfully',data:data}));
								}).catch(function(err){
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Try again later',data:err}));
								});
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Access token does not exists'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
				case'ADDTS':
					var path=reqM.path;
					if(!path){
						connection.sendUTF(JSON.stringify({calltoken:calltoken,'error':'path is not present'}));
						return;
					}else{
						var reqRef=Firebase.database().ref(path);
						reqRef.set(Firebase.database.ServerValue.TIMESTAMP);
						connection.sendUTF(JSON.stringify({calltoken:calltoken,'success':path+': updated with timestamp'}));
					}
					break;
				case 'MATCH_MAKING':
					console.log('--------------------Match Making in Progress-----------');
					if(reqM.userId && reqM.accessToken && reqM.catId && reqM.subCatId){
						var userId = reqM.userId;
						var roomId = reqM.roomId || null;
						var accessToken = JSON.parse(reqM.accessToken);
						var catId = reqM.catId;
						var subCatId = reqM.subCatId;
						console.log(userId+roomId+accessToken+catId+subCatId);
						Matchmaking.isValidUser(userId,accessToken,function(result){
							if(result.success){
								console.log('-----------------User Valid-----------');
								if(roomId){
									//check if room Exists
									Matchmaking.isValidRoom(roomId,function(data){
										//respond with data
										matchMakingId = roomId;
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Room is valid',data:data}));
									},function(err){
										//respond with data
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Invalid Room'}));
									});
								}else{
									//assign room
									Matchmaking.assignRoom(userId,catId,subCatId,function(data){
										if(data.error){
											connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Insufficient coins',data:{}}));
										}else{
											matchMakingId = data.roomId;
											connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Room assigned',data:data}));
											console.log("assigned room is: " + matchMakingId);
										}
									});
								}
							}else{
								//send error : Invalid User
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Unauthanticated User!'}));
							}
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
						console.log('--------------------Invalid Data-----------');
					}

					break;

				case "STOP_MATCHMAKING":
					if(reqM.userId && reqM.roomId){
						var userId = reqM.userId;
						var roomId = reqM.roomId;
						var rootRef = Firebase.database().ref();
						var roomRef = rootRef.child('rooms1').child(roomId);
						roomRef.once('value').then(function(snap){
							var roomData = snap.val();
							var userLength = snap.child('users').numChildren();
							if(snap.child('users').child(userId).exists()){
								if(!roomData.started){
									if(userLength > 1){
										roomRef.child('users').child(userId).remove();
										roomRef.child('totalUsers').set(roomData.totalUsers-1);
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Room remove successfully.'}));
									}else{
										roomRef.remove();
										rootRef.child('category').child(roomData.catId).child('subCategory').child(roomData.subCatId).child('availableRooms').remove();
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Room remove successfully.'}));
									}
								}else{
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Game start'}));
								}
							}else{
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'User already remove the room.'}));
							}

						}).catch(function(err){
							console.log(err);
						});
					}else{
						connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
					}
					break;
					case "ADD_GIFT_OFFER":
						if(reqM.userId && reqM.accessToken){
							var userId = reqM.userId;
							var accessToken = JSON.parse(reqM.accessToken);
							var rootRef = Firebase.database().ref();
							var userRef = rootRef.child('users').child(userId);
							userRef.once('value').then(function(snapshot){
								var data = snapshot.val();
								if(data.accessToken === accessToken){
									if(data.isGiftOfferAvailable === 'true'){
										var giftOfferRef = rootRef.child('giftOffer').child('someIds');
										giftOfferRef.once('value').then(function(snap){
											var giftData = snap.val();
											var currentD = new Date().getTime();
											var startD = new Date(giftData.startDate).getTime();
											var endD = new Date(giftData.endDate).getTime();
											if(currentD <= endD && currentD >= startD){
												var coin = parseInt(data.coin) + parseInt(giftData.coin);
												userRef.child('isGiftOfferAvailable').set("false");
												userRef.child('coin').set(coin);
												connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:0,msg:'Coin add successfully'}));
											}else{
												connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Offer end'}));
											}
										}).catch(function(err){
											connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Offer end'}));
										});
									}else{
										connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'You already get the offer'}));
									}
								}else{
									connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Unauthanticated User!'}));
								}
							}).catch(function(err){
								connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:2,msg:'Unauthanticated User!'}));
							});
						}else{
							connection.sendUTF(JSON.stringify({calltoken:calltoken,errorcode:1,msg:'Please send all required fields'}));
						}
						break;

				default:
					handler.other(connection,message,function(res){
						console.log(res.message);
					});
			}
		}
	});

	connection.on('close', function(connection) {
		// close user connection set userName to false
		console.log((new Date()) + " Peer " + GloUserId + " disconnected.");

		if(matchMakingId){
			if(GloUserId){
				var rootRef = Firebase.database().ref();
				var roomRef = rootRef.child('rooms1').child(matchMakingId).child('users');
				roomRef.once('value').then(function(snap){
					var roomData = snap.val();
					Object.keys(roomData).forEach(function(key) {
						if(key != GloUserId){
							var userRef = rootRef.child('users').child(key);
							roomRef.child(GloUserId).child('isActive').set(false);
							userRef.once('value').then(function(snap){
								console.log(snap.val());
								messageSendToUser(snap.val().connectionId,{'type':'USER_DISCONNECTED',"userId":GloUserId});
							}).catch(function(err){
								console.log(err);
							});
							console.log('Other User : ' + key);
						}else{
							console.log('Current user :' + GloUserId);
						}
				    });
				}).catch(function(err){
					console.log(err);
				});
			}
		}
		delete connections[connection.id];

		// remove this client from the list of connected clients

	});
});

app.post('/api/users/login',function(req,res){
	res.send({errorcode:1,msg:'Please update the app'});
});

app.post('/api/users/registrationWithGuest',function(req,res){
	res.send({errorcode:1,msg:'Please update the app'});
});

app.post('/api/users/registrationWithFB',function(req,res){
	res.send({errorcode:1,msg:'Please update the app'});
});

app.post('/api/users/registrationWithEP',function(req,res){
	res.send({errorcode:1,msg:'Please update the app'});
});

app.post('/api/users/details',function(req,res){
	res.send({errorcode:1,msg:'Please update the app'});
});
