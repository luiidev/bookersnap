angular.module('turn.service', [])
.factory('TurnFactory',function($http,ApiUrl,ApiUrlRoot){
	return {
		getTurns: function(){
			return $http.get(ApiUrl+"/turns");
		},
		getTurn : function(vTurn){
			return $http.get(ApiUrl+"/turns/"+vTurn);
		},
		createTurn : function(vData){
			return $http.post(ApiUrl+"/turns",vData);
		},
		updateTurn : function(vData){
			return $http.put(ApiUrl+"/turns/"+vData.id,vData);
		},
		getTurnsAvailables: function(vDate){
			return $http.get(ApiUrl+"/turns/"+vDate+"/availables");
		},
		searchTurn : function(vData){
			return $http.get(ApiUrl+"/turns/search?"+vData);
		}
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
.factory('DateFactory',function($http,$filter){

	return {
		timeFormat : function(time){
			return $filter('date')(time,'HH:mm:ss');
		}
	}

})
;
