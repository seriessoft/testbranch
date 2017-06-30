(function() {
	'use strict';
	angular.module('app').controller('authCtrl',[
		'$scope','$state','$timeout','AuthService','localStorageService','$rootScope',
		function($scope,$state,$timeout,AuthService,localStorageService,$rootScope){
			var userId = localStorageService.getStorageId();
			//console.log(userId);
			if(userId){
				window.location.href = "#!/dashboard";
			}
			var adminRef = firebase.database().ref('/admins');
			$scope.login= function(user){
				$scope.isButtonBusy=true;
				$scope.err=null;
				AuthService.$signInWithEmailAndPassword(user.email,user.password).then(function(res){
					console.log('ok');
					adminRef.child(res.uid).once('value',function(snapp){
						$timeout(function(){
							console.log(snapp.exists());
							if(snapp.exists()){
								localStorageService.setStorageId(res.uid);
								$rootScope.isUserLoggedIn = true;
								$state.go('users');
							}else{
								$scope.err = {
									message : 'Invalid User!!!'
								};
								$scope.isButtonBusy=false;
							}
						},0);
					},function(err){});
				}).catch(function(err){
					$scope.err = err;
					$scope.isButtonBusy=false;
				});
			};
		}
	]);
}());
