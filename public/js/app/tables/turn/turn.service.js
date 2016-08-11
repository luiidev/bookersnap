angular.module('turn.service', [])
.factory('TurnFactory',function($http,ApiUrl,ApiUrlRoot){
	return {
		getTurns: function(){
			return $http.get(ApiUrl+"/turn");
		},
		getTurn : function(vTurn){
			return $http.get(ApiUrl+"/turn/"+vTurn);
		},
		createTurn : function(vData){
			return $http.post(ApiUrl+"/turn",vData);
		},
		updateTurn : function(vData){
			return $http.put(ApiUrl+"/turn/"+vData.id,vData);
		},
		getTurnsAvailables: function(vDate){
			return $http.get(ApiUrl+"/turn/"+vDate+"/availables");
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
