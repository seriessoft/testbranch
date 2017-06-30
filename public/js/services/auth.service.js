angular.module('app')
.factory('AuthService',[
	'$firebaseAuth','notify','$rootScope',function($firebaseAuth,notify,$rootScope){
		return $firebaseAuth();
	}
]);
