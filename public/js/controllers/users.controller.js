(function() {
	'use strict';
	angular.module('app').controller('usersCtrl',[
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
			$scope.filterData = {
				currentKey : '',
				preKey : '',
				pageLength :10,
				isFistValue: 'true'
			};

			$scope.search={
				name:'Khalil'
			};

			$scope.pageModel={
				viewListModel:true,
				viewDetailsModel:false,
				viewUserDetailsModel:false
			};

			$scope.openListViewModel = function(){
				$scope.pageModel={
					viewListModel:true,
					viewDetailsModel:false,
					viewUserDetailsModel:false
				};
			};

			$scope.getUsersList = function(){
				$scope.isButtonBusy = true;
				var userRef = rootRef.child('users');
				//userRef.orderByKey().limitToFirst($scope.filterData.pageLength).startAt($scope.filterData.currentKey).once('value').then(function(snapshot){
				//userRef.orderByKey().limitToFirst($scope.filterData.pageLength).startAt($scope.filterData.currentKey).once('value').then(function(snapshot){
				/*userRef.orderByChild('name')
					.startAt($scope.filterData.searchText)
					//.endAt($scope.filterData.searchText)
					.once('value').then(function(snapshot){
					//console.log(snapshot.val());
					$timeout(function () {
						$scope.users = snapshot.val();
						$scope.isButtonBusy = false;
					},0);
				}).catch(function(err){
					console.log(err);
				});*/
				userRef.orderByChild('name').startAt($scope.search.name).once('value',function(snapshot){
					console.log('ok');
					$timeout(function () {
						$scope.users=[];
						//console.log(snapshot.val());
						$scope.searchText = $scope.search.name;
						angular.forEach(snapshot.val(),function(val,key){
							val.key = key;
							$scope.users.push(val);
						});
						$scope.isButtonBusy = false;
					},0);
				},function(err){
						console.log(err);
				});
			};

			$scope.getUsersList();

			$scope.userDetails = function(userId){
				var size = 'lg';
				var modalInstance = $uibModal.open({
					animation: true,
					ariaLabelledBy: 'modal-title',
					ariaDescribedBy: 'modal-body',
					templateUrl: '../../pages/userDetails.html',
      				controller: 'userDetailsCtrl',
      				controllerAs: '$scope',
					size: size,
					appendTo: '',
					resolve: {
						items: function () {
							return userId;
						}
					}
				});
			};

			$scope.next = function(key){
				$scope.isButtonBusy = true;
				$scope.filterData.preKey = $scope.filterData.currentKey;
				if($scope.filterData.preKey === ''){
					$scope.preButtonHide = true;
					console.log('1');
				}else{
					$scope.preButtonHide = true;
					console.log('3');
				}
				$scope.filterData.currentKey = key;
				$scope.getUsersList();
			};

			$scope.pre = function(key){
				$scope.isButtonBusy = true;
				$scope.filterData.currentKey = $scope.filterData.preKey;
				if($scope.filterData.preKey === $scope.filterData.currentKey){
					$scope.preButtonHide = false;
				}else{
					$scope.preButtonHide = true;
				}
				$scope.getUsersList();
			};

			$scope.funTest = function(key){
				$scope.value = key;
			};

			$scope.searchData = function(){
				$scope.getUsersList();
			};

			$scope.resetSearchData = function(){
				$scope.search.name='';
				$scope.getUsersList();
			};

		}
	]);
}());
