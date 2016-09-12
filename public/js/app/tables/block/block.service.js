angular.module('block.service', [])
.factory('BlockFactory',function($http,ApiUrl){
	return {
		getAllBlock: function(vDate){
				return $http.get(ApiUrl+"/blocks/tables?"+vDate); 
		},
		getBlock: function(vDate){
				return $http.get(ApiUrl+"/blocks/"+vDate); 
		},
		addNewBlock: function(data){

				return $http({url:ApiUrl+"/blocks", method: "POST", data: data}).then(function successCallback(response) {
						    return response;
						  }, function errorCallback(response) {
						  	return response;
						  })

		},
		editBlock: function(variablesUrl, data){
				return $http({url: ApiUrl + "/blocks" + variablesUrl, method: "PUT", data: data}); 
		}
	};

});