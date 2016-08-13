angular.module('turn.service', [])
.factory('TurnFactory',function($http,ApiUrl,ApiUrlRoot){
	return {
		getTurns: function(vZone){
			return $http.get(ApiUrl+"/zones/"+vZone+"/turns");
		},
		getTurn : function(vTurn){
			return $http.get(ApiUrl+"/turns/"+vTurn);
		},
		createTurn : function(vData,vZone){
			return $http.post(ApiUrl+"/zones/"+vZone+"/turns",vData);
		},
		updateTurn : function(vData){
			return $http.put(ApiUrl+"/turns/"+vData.id,vData);
		},
		getTurnsAvailables: function(vDate){
			return $http.get(ApiUrl+"/turns/"+vDate+"/availables");
		},
	};
})
.factory('TypeTurnFactory',function($http,ApiUrl,ApiUrlRoot){

	return {
		getTypeTurns : function(){
			return $http.get(ApiUrlRoot+"/type-turn");
		},
		getDaysTypeTurn : function(vTypeTurn){
			return $http.get(ApiUrl+"/type-turn/"+vTypeTurn+"/days");
		}

	};

})
;
