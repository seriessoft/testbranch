(function() {
	'use strict';
	angular.module('app').controller('mainCtrl',[
		'$scope','$state','localStorageService','notify','$rootScope','$location',
		function($scope,$state,localStorageService,notify,$rootScope,$location){
			var userId = localStorageService.getStorageId();
			//console.log(userId);
			if(!userId){
				window.location.href = "#!/login";
			}
			$scope.logoutUser = function(){
				localStorageService.deleteStorageId();
				notify('Logout Successfully.');
				console.log('Logout');
				$rootScope.isUserLoggedIn = false;
				$state.go('login');
			};

			$scope.getMenuClass = function (path) {
	            return ($location.path().substr(0, path.length) === path) ? 'active' : '';
	        };
		}
	]);
}());
