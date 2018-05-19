var Firebase = require('firebase');
var moment = require('moment');


var addPlayerToDatabase = function(uid, newFriend){
  console.log('--------------Inside addplayertodatabase------------');
  var playerRef = Firebase.database().ref().child('users').child(uid);
  playerRef.child('friends').child(newFriend).set(newFriend);
  console.log('--------------leaving addplayertodatabase------------');
};

var removePlayerFromDatabase = function(uid, friend){
  
  var playerRef = Firebase.database().ref().child('users').child(uid);
  playerRef.child('friends').child(friend).remove();
  
};

var findFrineds = function(uid, callback){
  
  var playerRef = Firebase.database().ref().child('users').child(uid);
  playerRef.child('users').once('value').then( function(snap){
    var friendslist = snap;
    callback = friendslist;
  });
  
};
