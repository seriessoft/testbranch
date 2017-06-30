(function() {
	'use strict';
	angular.module('app').controller('editGiftOfferCtrl',[
		'$scope','$state','localStorageService','notify','$rootScope','$timeout','$uibModalInstance','items','$filter','Upload',
		function($scope,$state,localStorageService,notify,$rootScope,$timeout,$uibModalInstance,items,$filter,Upload){
			var adminUserId = localStorageService.getStorageId();
			var giftOfferId = items;
			var rootRef = firebase.database().ref();
			var storeRef = firebase.storage().ref();
			if(!adminUserId){
				window.location.href = "#!/login";
				$rootScope.isUserLoggedIn = false;
			}
			if(giftOfferId){
				var giftOfferRef = rootRef.child('giftOffer').child(giftOfferId);
				giftOfferRef.once('value', function(snapshot) {
					$timeout(function () {
						$scope.giftOfferDetail = snapshot.val();
						$scope.giftOfferDetail.coin = parseInt($scope.giftOfferDetail.coin);
						$scope.giftOfferDetail.startDate = new Date($scope.giftOfferDetail.startDate);
						$scope.giftOfferDetail.endDate = new Date($scope.giftOfferDetail.endDate);
					},0);
				});
			}
			$scope.uploadImage = function(giftImage,OldImageName){
				if(giftImage){
					var fileName = new Date().getTime()+'_'+giftImage.name;
					if(storeRef.child('giftOffer').child(fileName).put(giftImage)){
						//$timeout(function(){
							return fileName;
							/*if(OldImageName){
								console.log(OldImageName);
								storeRef.child('giftOffer/'+OldImageName).delete().then(function(response){
									$timeout(function(){
										return true;
									},0);
								}).catch(function(error){
									console.log(error);
									$timeout(function(){
										return true;
									},0);
								});
							}else{
								$timeout(function(){
									return true;
								},0);
							}*/
					//	},0);
					}else{
						console.log('image not deleted');
					}

				}else{
					return OldImageName;
				}
			};

			//$scope.ok = function (picFile) {
			$scope.ok = function () {
				$scope.isButtonBusy = true;
				var data = $scope.giftOfferDetail;
				//console.log(data);
				//$scope.giftOfferDetail.imageName = $scope.uploadImage(picFile,$scope.giftOfferDetail.imageName);
				//data.coin = ""+data.coin;
				data.startDate = $filter('date')(data.startDate, "yyyy-MM-dd");
				data.endDate = $filter('date')(data.endDate, "yyyy-MM-dd");
				var giftOfferRef = rootRef.child('giftOffer').child(giftOfferId);
				//console.log(data);
				giftOfferRef.set(data);
				notify('Gift offer update successfully.');
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
