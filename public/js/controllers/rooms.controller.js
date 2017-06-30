(function() {
	'use strict';
	angular.module('app').controller('roomsCtrl',[
		'$scope','$state','localStorageService','notify','$rootScope','$timeout','$uibModal',
		function($scope,$state,localStorageService,notify,$rootScope,$timeout,$uibModal){
			var adminUserId = localStorageService.getStorageId();
			//console.log(userId);
			var rootRef = firebase.database().ref();
			if(!adminUserId){
				window.location.href = "#!/login";
				$rootScope.isUserLoggedIn = false;
			}
			$scope.value = '';
			$scope.preButtonHide = false;
			$scope.nextButtonHide = true;
			$scope.filterData = {
				currentKey : '',
				preKey : '',
				pageLength :101,
				isFistValue: 'true'
			};

			$scope.getUsersList = function(){
				$scope.isButtonBusy = true;
				var roomsRef = rootRef.child('rooms1');
				roomsRef.orderByKey()
					.limitToFirst($scope.filterData.pageLength)
					.startAt($scope.filterData.currentKey)
					.once('value').then(function(snapshot){
						$timeout(function () {
							$scope.rooms = snapshot.val();
							console.log('ok');
							$scope.isButtonBusy = false;
						},0);
				}).catch(function(err){
					console.log(err);
				});
			};

			$scope.getUsersList();

			$scope.next = function(key){
				$scope.isButtonBusy = true;
				$scope.filterData.preKey = $scope.filterData.currentKey;
				if($scope.filterData.preKey === ''){
					$scope.preButtonHide = true;
				}else{
					$scope.preButtonHide = true;
				}
				$scope.filterData.currentKey = key;
				$scope.getUsersList();
			};

			$scope.pre = function(key){
				$scope.isButtonBusy = true;
				$scope.filterData.currentKey = $scope.filterData.preKey;
				// if($scope.filterData.preKey === $scope.filterData.currentKey){
				// 	$scope.preButtonHide = false;
				// }else{
				// 	$scope.preButtonHide = true;
				// }
				$scope.getUsersList();
			};

			$scope.funTest = function(key){
				$scope.value = key;
			};

			$scope.deleteAll = function(){
				var con = confirm("Are you sure!");
				if(con){
					var i = 2;
					var roomRef = rootRef.child('rooms1');
					angular.forEach($scope.rooms,function(value, key){
						roomRef.child(key).remove();
						if(i === $scope.filterData.pageLength){
							notify('All rooms delete successfully');
							$scope.getUsersList();
						}
						i++;
					});
				}
			};

			$scope.deleteRoom = function(key){
				var con = confirm("Are you sure!");
				if(con){
					var roomRef = rootRef.child('rooms1');
					roomRef.child(key).remove();
					notify('room delete successfully');
					$scope.getUsersList();
				}
			};

		}
	]);
}());
