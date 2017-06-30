(function() {
	'use strict';
	angular.module('app').controller('inappOfferCtrl',[
		'$scope','$state','localStorageService','notify','$rootScope','$timeout','$uibModal',
		function($scope,$state,localStorageService,notify,$rootScope,$timeout,$uibModal){
			var adminUserId = localStorageService.getStorageId();
			var rootRef = firebase.database().ref();
			if(!adminUserId){
				window.location.href = "#!/login";
				$rootScope.isUserLoggedIn = false;
			}

			$scope.getInappOffer = function(){
				var inappOfferRef = rootRef.child('inAppOffers');
				inappOfferRef.on('value',function(snapshot){
					$timeout(function () {
						$scope.inappOfferLists = snapshot.val();
					},0);
				},function(err){
					console.log(err);
				});
			};

			$scope.getInappOffer();

			$scope.editInappOffer = function(inappOfferId){
				var size = 'lg';
				var modalInstance = $uibModal.open({
					animation: true,
					ariaLabelledBy: 'modal-title',
					ariaDescribedBy: 'modal-body',
					templateUrl: '../../pages/edit_inapp_offer.html',
      				controller: 'editInappOfferCtrl',
      				controllerAs: '$scope',
					size: size,
					appendTo: '',
					resolve: {
						items: function () {
							return inappOfferId;
						}
					}
				});
			};
		}
	]);
}());
