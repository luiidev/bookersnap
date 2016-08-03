angular.module('turn.service', [])
.factory('TurnFactory',function($http,ApiUrl,ApiUrlRoot){
	return {
		getTurns: function(vZone){
			return $http.get(ApiUrl+"/zone/"+vZone+"/turn"); 
		},
		createTurn : function(vZone,vData){
			return $http.post(ApiUrl+"/zone/"+vZone+"/turn",vData); 
		},
		getTypeTurns : function(){
			return $http.get(ApiUrlRoot+"/type-turn"); 
		},
		getDaysTypeTurn : function(vZone,vTypeTurn){
			return $http.get(ApiUrl+"/zone/"+vZone+"/type-turn/"+vTypeTurn+"/days"); 
		},
	};

})