angular.module('server.service', [])
	.factory('ServerFactory', function($http, ApiUrlMesas) {
		return {
			getAllServer: function(){
				return $http.get(ApiUrlMesas+"/servers"); 
			},
		}
	})