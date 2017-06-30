(function() {
	'use strict';
	angular.module('app',[
		'ui.bootstrap',
		'ui.bootstrap.datetimepicker',
		'ui.router',
		'firebase',
		'cgNotify',
		'ngStorage',
		'ngFileUpload'
	]);

	angular.module('app').config([
		'$stateProvider','$urlRouterProvider',
		function($stateProvider,$urlRouterProvider){
			// our server details
			/*
			var config = {
				apiKey: "AIzaSyBILjsq_QSbE8X-H2tiSxJxX5i1AV139nI",
			    authDomain: "monopoly-2ffc6.firebaseapp.com",
			    databaseURL: "https://monopoly-2ffc6.firebaseio.com",
			    storageBucket: "monopoly-2ffc6.appspot.com",
			    messagingSenderId: "68477236556"
			};
			*/
			//client server details
			// /*
			var config = {
			    apiKey: "AIzaSyCj1gTHtLAbAYXAxbxyzMHWRCbKihvzdH8",
			    authDomain: "saudideal-922d4.firebaseapp.com",
			    databaseURL: "https://saudideal-922d4.firebaseio.com",
			    projectId: "saudideal-922d4",
			    storageBucket: "saudideal-922d4.appspot.com",
			    messagingSenderId: "820015895373"
			};
			// */
			firebase.initializeApp(config);

			$stateProvider.state({
				name:'login',
				url : '/login',
				controller:'authCtrl',
				templateUrl : 'pages/login.html',
				resolve : {
					"currentAuth":["AuthService",function(AuthService){
						return AuthService.$waitForSignIn();
					}]
				}
			}).state({
				name : 'dashboard',
				url : '/dashboard',
				controller:'dashboardCtrl',
				template : '<h3>Welcome to dashboard</h3>'
			}).state({
				name : 'users',
				url : '/users',
				controller:'usersCtrl',
				templateUrl : 'pages/users.html'
			}).state({
				name : 'inapp_offer',
				url : '/inapp_offer',
				controller:'inappOfferCtrl',
				templateUrl : 'pages/inapp_offer.html'
			}).state({
				name : 'gift_offer',
				url : '/gift_offer',
				controller:'giftOfferCtrl',
				templateUrl : 'pages/gift_offer.html'
			}).state({
				name : 'report',
				url : '/report',
				controller:'reportCtrl',
				templateUrl : 'pages/report.html'
			}).state({
				name : 'rooms',
				url : '/rooms',
				controller:'roomsCtrl',
				templateUrl : 'pages/rooms.html'
			});
			$urlRouterProvider.when('','/login');
		}
	]);

	angular.module('app').run(["$rootScope","localStorageService","$state", function ($rootScope,localStorageService,$state) {
		var userId = localStorageService.getStorageId();
		//console.log(userId);
		if (userId) {
			$rootScope.isUserLoggedIn = true;
		} else {
			$rootScope.isUserLoggedIn = false;

		}
		/*$rootScope.$on("$routeChangeStart",function(event,next,previous,error){
			console.log('change');
			if (localStorage.userId) {
	            $rootScope.isUserLoggedIn = true;
	        } else {
	            $rootScope.isUserLoggedIn = false;
	        }
		});*/
	}]);

}());
