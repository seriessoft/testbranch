(function() {
	'use strict';
	angular.module('app').controller('userDetailsCtrl',[
		'$scope','$state','localStorageService','notify','$rootScope','$timeout','$uibModalInstance','items',
		function($scope,$state,localStorageService,notify,$rootScope,$timeout,$uibModalInstance,items){
			var adminUserId = localStorageService.getStorageId();
			var userId = items;
			var rootRef = firebase.database().ref();
			if(!adminUserId){
				window.location.href = "#!/login";
				$rootScope.isUserLoggedIn = false;
			}

			if(userId){
				var userRef = rootRef.child('users').child(userId);
				var userSetRef = rootRef.child('gameSet').child(userId);
				userRef.once('value', function(snapshot) {
					$timeout(function () {
						$scope.users = snapshot.val();
						userSetRef.once('value', function(snapshot) {
							$timeout(function () {
								//console.log(snapshot.val());
								if(snapshot.val()){
									$scope.userSet = snapshot.val();
								}else{
									$scope.userSet=[];
								}

							},0);
						});
					},0);
				});
			}

			$scope.ok = function () {
				$uibModalInstance.close();
			};

			$scope.cancel = function () {
				$uibModalInstance.close();
			};

			$scope.isValueObJect = function(data){
				if(angular.isObject(data)){
					return true;
				}else{
					return false;
				}
			};


		}
	]);
}());
