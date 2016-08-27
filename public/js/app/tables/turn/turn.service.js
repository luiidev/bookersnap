angular.module('turn.service', [])
.factory('TurnDataFactory',function($http,ApiUrl,ApiUrlRoot){
	return {
		getTurns: function(vOptions){
			return $http.get(ApiUrl+"/turns?"+vOptions);
		},
		getTurn : function(vTurn,vOptions){
			return $http.get(ApiUrl+"/turns/"+vTurn+"?"+vOptions);
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
		},
		getTurnZoneTables : function(vZone,vTurn){
			return $http.get(ApiUrl+"/turns/"+vTurn+"/zones/"+vZone+"/tables");
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
.factory('TurnFactory',function(TurnDataFactory,DateFactory,ZoneFactory,BookDateFactory,$q){

	return {
		listTurns : function(options){
			var defered = $q.defer();

			TurnDataFactory.getTurns(options).success(function(data){

				var vTurns = [];

				angular.forEach(data.data,function(turns){
					var vZones = [];

					angular.forEach(turns.zones, function(zones){
						vZones.push(zones.name);
					});

					turns.zones = vZones.join(", ");

					vTurns.push(turns);

				});

				defered.resolve(vTurns);

			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		validateTurn : function(turnData,turnForm,turnDataClone){
			var valTime = {
				hours_ini : DateFactory.timeFormat(turnForm.hours_ini),
				hours_end : DateFactory.timeFormat(turnForm.hours_end),
				type_turn : turnForm.type_turn.id
			} 

			var defered = $q.defer();

			var vParams = getAsUriParameters(valTime);

			TurnDataFactory.searchTurn(vParams).success(function(data){
				
				if (data.data.length == 0 || (turnDataClone.hours_ini == valTime.hours_ini && turnDataClone.hours_end == valTime.hours_end )) {
					defered.resolve(false);
				}else{
					defered.resolve(true);
				}

			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		listZones : function(){
			var defered = $q.defer();
			var params = "with=turns";

			ZoneFactory.getZones(params).success(function(data){

				var zones = [];

				angular.forEach(data.data, function(value, key){
					var turnsData = [];
					angular.forEach(value.turns, function(turns, key){
						turnsData.push(turns.name);
					});

					value.turns_asign = turnsData.join(", ");
					zones.push(value);
				});

				defered.resolve(zones);

			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		saveTurn : function(turnData,option){
			var defered = null;
			var me = this;

			if(option == "create"){
				defered = me.createTurn(turnData);
			}

			return defered;
		},
		createTurn : function(turnData){
			var defered = $q.defer(); 

			TurnDataFactory.createTurn(turnData).success(function(data){
				console.log("createTurn " + angular.toJson(data,true));
				defered.resolve(data);
			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		constructStructureSave: function(turnData,turnForm,turnZoneAdd){
			turnData.hours_ini = DateFactory.timeFormat(turnForm.hours_ini,'HH:mm:ss');
			turnData.hours_end = DateFactory.timeFormat(turnForm.hours_end,'HH:mm:ss');

			turnData.res_type_turn_id = turnForm.type_turn.id;

			var turnZones = [];

			angular.forEach(turnZoneAdd.zones_id, function(zones, key){
				turnZones.push({
					res_zone_id : zones,
					res_turn_rule_id : 1
				});
			});

			turnData.turn_zone = turnZones;

			return turnData;
		},
		deleteZone : function(turnZoneAdd,zoneId){
			var index = turnZoneAdd.zones_id.indexOf(zoneId);

			if(index != -1){
				turnZoneAdd.zones_id.splice(index, 1);
				turnZoneAdd.zones_data.splice(index, 1);
			}	
		},
		getTurn : function(idTurn,options){
			var defered = $q.defer();

			TurnDataFactory.getTurn(idTurn,options).success(function(data){
				data = data.data;
				
				var turnData = {
					name : data.name,
					hours_ini : data.hours_ini,
					hours_end : data.hours_end
				}

				var hour_ini = data.hours_ini.split(":");
				var hour_end = data.hours_end.split(":");

				var turnForm = {
					hours_ini : new Date(1970, 0, 1,hour_ini[0],hour_ini[1],hour_ini[2]),
					hours_end : new Date(1970, 0, 1,hour_end[0],hour_end[1],hour_end[2]),
					type_turn : { id : data.res_type_turn_id, label : ''}
				}

				var turnDataClone = turnData;
				var zonesId = [];
				var dataZones = [];

				angular.forEach(data.turn_zone,function(zones){
					zonesId.push(zones.zone.id);

					var turnsData = [];

					angular.forEach(zones.zone.turns, function(turns, key){
						turnsData.push(turns.name);
					});

					zones.zone.turns_asign = turnsData.join(", ");
					zones.zone.rule = zones.rule;
					dataZones.push(zones.zone);

				});

				var responseData = {
					turnData : turnData,
					turnForm : turnForm,
					turnDataClone : turnDataClone,
					zonesId : zonesId,
					dataZones : dataZones
				}

				defered.resolve(responseData);

			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		getTurnZoneTables : function(idZone,idTurn){
			var defered = $q.defer();

			TurnDataFactory.getTurnZoneTables(idZone,idTurn).success(function(data){
				defered.resolve(data.data);
			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		generatedTimeTable : function(turnData){
			var times = BookDateFactory.rangeDateAvailable(15,turnData);
			return times;
		}

	};

})
;
