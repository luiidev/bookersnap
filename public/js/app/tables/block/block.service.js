angular.module('block.service', [])
.factory('BlockFactory',function($http,ApiUrlMesas){
	return {
		getAllBlock: function(vDate){
				return $http.get(ApiUrlMesas+"/blocks/tables?"+vDate); 
		},
		getBlock: function(vDate){
				return $http.get(ApiUrlMesas+"/blocks/"+vDate); 
		},
		addNewBlock: function(data){

				return $http({url:ApiUrlMesas+"/blocks", method: "POST", data: data}).then(function successCallback(response) {
						    return response;
						  }, function errorCallback(response) {
						  	return response;
						  })

		},
		editBlock: function(variablesUrl, data){
				return $http({url: ApiUrlMesas + "/blocks" + variablesUrl, method: "PUT", data: data}); 
		},
		coverList: function (){
			return {
	            dataMin : [],
	            selectedMin : '',
	            dataMax : [],
	            selectedMax : ''
        	};
		},
		boxTables: function (){
			return {
	            items : true,
	            item : false
        	};
		}

	};

});