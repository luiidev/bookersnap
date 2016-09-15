angular.module('server.service', [])
	.factory('ServerFactory', function($http, ApiUrlMesas) {
		return {
			getAllServer: function(){
				return $http.get(ApiUrlMesas+"/servers"); 
			},
			addServer: function(data){
				return $http({url:ApiUrlMesas+"/servers", method: "POST", data: data}).then(function successCallback(response) {
						    return response;
						  }, function errorCallback(response) {
						  	return response;
						  })
			},
			updateServer: function(data, id_server){
				return $http({url:ApiUrlMesas+"/servers/"+id_server, method: "PUT", data: data}).then(function successCallback(response) {
						    return response;
						  }, function errorCallback(response) {
						  	return response;
						  })
			},
			deleteServer: function(id_server){
				return $http({url:ApiUrlMesas+"/servers/"+id_server, method: "DELETE"}).then(function successCallback(response) {
						    return response;
						  }, function errorCallback(response) {
						  	return response;
						  })
			},
		}
	})
	.factory('ColorFactory', function() {
		return {
			getColor: function(){
				 return colors = [
				 	{ colorHexadecimal: "#9F7421"},
				 	{ colorHexadecimal: "#82d1d3"},
				 	{ colorHexadecimal: "#7c004c"},
				 	{ colorHexadecimal: "#e176ce"},
				 	{ colorHexadecimal: "#7e3c91"},
				 	{ colorHexadecimal: "#b30011"},
				 	{ colorHexadecimal: "#1e9084"},
				 	{ colorHexadecimal: "#ffffe8"},
				 	{ colorHexadecimal: "#eead00"},
				 	{ colorHexadecimal: "#ff6138"},
				 	{ colorHexadecimal: "#007fff"},
				 	{ colorHexadecimal: "#ffc4b5"},
				 	{ colorHexadecimal: "#a9d4ff"},
				 	{ colorHexadecimal: "#30c6bd"},
				 	{ colorHexadecimal: "#5fefe7"},
				 	{ colorHexadecimal: "#ffc26b"},
				 	{ colorHexadecimal: "#00aeef"},
				 	{ colorHexadecimal: "#cdc3ff"},
				 	{ colorHexadecimal: "#9be4ff"},
				 	{ colorHexadecimal: "#aa0d71"},
				 	{ colorHexadecimal: "#e891d7"},
				 	{ colorHexadecimal: "#fc00ff"},
				 	{ colorHexadecimal: "#901eac"},
				 	{ colorHexadecimal: "#c41200"},
				 	{ colorHexadecimal: "#ffffff"},
				 	{ colorHexadecimal: "#2c3e50"},
				 	{ colorHexadecimal: "#ab7714"},
				 	{ colorHexadecimal: "#755e33"},
				 	{ colorHexadecimal: "#83ff5a"},
				 	{ colorHexadecimal: "#2085d8"},
				 	];
			},
		}
	});