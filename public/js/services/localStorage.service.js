(function() {
	'use strict';
	angular.module('app').factory('localStorageService',['$localStorage','$sessionStorage',function($localStorage,$sessionStorage){

		$localStorage=$localStorage.$default({
			userId:""
		});

		var _setStorageId=function(uId){

			$localStorage.userId=uId;
		};

		var _getStorageid=function(){
			
			return $localStorage.userId;
		};

		var _deleteStorageId = function(){
			return delete $localStorage.userId;
		};


		return{
			setStorageId:_setStorageId,
			getStorageId:_getStorageid,
			deleteStorageId:_deleteStorageId
		};
	}]);
}());
