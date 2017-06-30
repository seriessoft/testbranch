var Firebase = require('firebase');
/* uncomment below for unit testing */
var express = require('express');
var Config = require('./config');
var fbconfig = Config.firebaseConfig;
Firebase.initializeApp(fbconfig);
/* end of unit testing init */

var rootRef = Firebase.database().ref();



var winGame = function(winnerId,gameId){
	
};
