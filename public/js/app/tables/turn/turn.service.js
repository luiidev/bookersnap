angular.module('turn.service', [])
.factory('TurnFactory',function($http,ApiUrl,ApiUrlRoot){
	return {
		getTurns: function(vZone){
			return $http.get(ApiUrl+"/zone/"+vZone+"/turn"); 
		},
		getTurn : function(vZone,vTurn){
			return $http.get(ApiUrl+"/zone/"+vZone+"/turn/"+vTurn); 
		},
		createTurn : function(vZone,vData){
			return $http.post(ApiUrl+"/zone/"+vZone+"/turn",vData); 
		},
		updateTurn : function(vZone,vData){
			return $http.put(ApiUrl+"/zone/"+vZone+"/turn",vData); 
		}
	};

})
.factory('TypeTurnFactory',function($http,ApiUrl,ApiUrlRoot){

	return {
		getTypeTurns : function(){
			return $http.get(ApiUrlRoot+"/type-turn"); 
		},
		getDaysTypeTurn : function(vZone,vTypeTurn){
			return $http.get(ApiUrl+"/zone/"+vZone+"/type-turn/"+vTypeTurn+"/days"); 
		}

	};

})
;