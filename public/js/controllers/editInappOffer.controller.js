(function() {
	'use strict';
	angular.module('app').controller('editInappOfferCtrl',[
		'$scope','$state','localStorageService','notify','$rootScope','$timeout','$uibModalInstance','items','$filter',
		function($scope,$state,localStorageService,notify,$rootScope,$timeout,$uibModalInstance,items,$filter){
			var adminUserId = localStorageService.getStorageId();
			var inappOfferId = items;
			var rootRef = firebase.database().ref();
			if(!adminUserId){
				window.location.href = "#!/login";
				$rootScope.isUserLoggedIn = false;
			}
			if(inappOfferId){
				var inappOfferRef = rootRef.child('inAppOffers').child(inappOfferId);
				inappOfferRef.once('value', function(snapshot) {
					$timeout(function () {
						$scope.inappOfferDetail = snapshot.val();
						$scope.inappOfferDetail.startOfferDate = new Date($scope.inappOfferDetail.startOfferDate);
						$scope.inappOfferDetail.endOfferDate = new Date($scope.inappOfferDetail.endOfferDate);
					},0);
				});
			}

			$scope.ok = function () {
				$scope.inappOfferDetail.startOfferDate = $filter('date')($scope.inappOfferDetail.startOfferDate, "yyyy-MM-dd");
				$scope.inappOfferDetail.endOfferDate = $filter('date')($scope.inappOfferDetail.endOfferDate, "yyyy-MM-dd");
				inappOfferRef.set($scope.inappOfferDetail).then(function(){
					$timeout(function(){
						notify("Inapp offer update successfully.");
						$uibModalInstance.close();
					},0);
				}).catch(function(){

				});
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

			$scope.popup1 = {
			    opened: false
			};

			$scope.open1 = function() {
				$scope.popup1.opened = true;
			};

			$scope.popup2 = {
			    opened: false
			};

			$scope.open2 = function() {
				$scope.popup2.opened = true;
			};

			$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			$scope.format = $scope.formats[1];
			$scope.altInputFormats = ['M!/d!/yyyy'];
		}
	]);
}());
