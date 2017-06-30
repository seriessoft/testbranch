(function() {
	'use strict';
	angular.module('app').controller('giftOfferCtrl',[
		'$scope','$state','localStorageService','notify','$rootScope','$timeout','$uibModal',
		function($scope,$state,localStorageService,notify,$rootScope,$timeout,$uibModal){
			var adminUserId = localStorageService.getStorageId();
			var rootRef = firebase.database().ref();
			var storeRef = firebase.storage().ref();
			if(!adminUserId){
				window.location.href = "#!/login";
				$rootScope.isUserLoggedIn = false;
			}
			$scope.getGiftOffer = function(){
				var giftOfferRef = rootRef.child('giftOffer');
				giftOfferRef.on('value',function(snapshot){
					$timeout(function () {
						$scope.giftOfferLists = snapshot.val();
						angular.forEach($scope.giftOfferLists,function(val,key){
							var currentD = new Date().getTime();
							var startD = new Date(val.startDate).getTime();
							var endD = new Date(val.endDate).getTime();
							if(currentD <= endD && currentD >= startD){
								$scope.giftOfferLists[key].isDateValied = true;
							}else{
								$scope.giftOfferLists[key].isDateValied = false;
							}
						});
					},0);
				},function(err){
					console.log(err);
				});
			};

			$scope.getGiftOffer();

			$scope.editGiftOffer = function(giftOfferId){
				var size = 'lg';
				var modalInstance = $uibModal.open({
					templateUrl: '../../pages/edit_gift_offer.html',
					controller: 'editGiftOfferCtrl',
					controllerAs: '$scope',
					size: size,
					appendTo: '',
					resolve: {
						items: function () {
							return giftOfferId;
						}
					}
				});
			};

			/*$scope.applyToAllUser = function(){
				$scope.isButtonBusy = true;
				var userRef = rootRef.child('users');
				userRef.once('value').then(function(snap){
					$timeout(function(){
						var data = snap.val();
						$scope.isButtonBusy = false;
						angular.forEach(data,function(val,key){
							userRef.child(key).child('isGiftOfferAvailable').set("true");
						});
					},0);
				}).catch(function(err){
					console.log(err);
				});
			};*/

			$scope.lastKey = false;


			var applyToAllUserFunction = function (startAt){
				if($scope.lastKey === startAt){
					notify('Offer Apply Successfully');
					$scope.isButtonBusy = false;
					return true;
				}else{
					$scope.lastKey = startAt;
				}
				var userRef = rootRef.child('users');
				userRef.orderByKey()
					.limitToFirst(1000)
					.startAt(startAt)
					.once('value').then(function(snap){
						$timeout(function(){
							var data = snap.val();
							if(data){
								var dataLength = snap.numChildren();
								var i = 1;
								angular.forEach(data,function(val,key){
									userRef.child(key).child('isGiftOfferAvailable').set("true");
									if(dataLength === i){
										startAt = parseInt(startAt) + 1;
										startAt= ""+startAt;
										applyToAllUserFunction(key);
									}
									i++;
								});

							}else{
								notify('Offer Apply Successfully');
								$scope.isButtonBusy = false;
							}
						},0);
					}).catch(function(err){
						notify('Something Wrong Please Apply Later');
						$scope.isButtonBusy = false;
						return false;
					});
			};

			$scope.applyToAllUser = function(){
				$scope.isButtonBusy = true;
				applyToAllUserFunction("");
			};

			var cancelToAllUserFunction = function (startAt){
				if($scope.lastKey === startAt){
					notify('Offer Cancel Successfully');
					$scope.isButtonBusy = false;
					return true;
				}else{
					$scope.lastKey = startAt;
				}
				var userRef = rootRef.child('users');
				userRef.orderByKey()
					.limitToFirst(1000)
					.startAt(startAt)
					.once('value').then(function(snap){
						$timeout(function(){
							var data = snap.val();
							if(data){
								var dataLength = snap.numChildren();
								var i = 1;
								angular.forEach(data,function(val,key){
									userRef.child(key).child('isGiftOfferAvailable').set("false");
									if(dataLength === i){
										startAt = parseInt(startAt) + 1;
										startAt= ""+startAt;
										cancelToAllUserFunction(key);
									}
									i++;
								});

							}else{
								notify('Offer Cancel Successfully');
								$scope.isButtonBusy = false;
							}
						},0);
					}).catch(function(err){
						notify('Something Wrong Please Cancel Later');
						$scope.isButtonBusy = false;
						return false;
					});
			};

			$scope.cancelToAllUser = function(){
				$scope.isButtonBusy = true;
				cancelToAllUserFunction("");
			};
		}
	]);
}());
