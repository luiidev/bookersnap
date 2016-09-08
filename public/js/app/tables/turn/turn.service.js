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
			}else{
				defered = me.editTurn(turnData);
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
		editTurn : function(turnData){
			var defered = $q.defer(); 

			TurnDataFactory.updateTurn(turnData).success(function(data){
				console.log("editTurn " + angular.toJson(data,true));
				defered.resolve(data);
			}).error(function(data,status,headers){
				defered.reject(data);
			});

			return defered.promise;
		},
		constructStructureSave: function(turnData,turnForm,turnZoneAdd){
			turnData.hours_ini = turnForm.hours_ini.time_original;
			turnData.hours_end = turnForm.hours_end.time_original;

			turnData.res_type_turn_id = turnForm.type_turn.id;

			var turnZones = [];
			var self = this;

			angular.forEach(turnZoneAdd.zones_id, function(zones, key){

				var turnRuleId = self.getTurnRuleId(turnZoneAdd.zonesTables,zones);

				if(turnRuleId === null || turnRuleId === ""){
					turnZones.push({
						res_zone_id : zones,
						res_turn_rule_id : 1,
						tables : []
					});
				}else{
					turnZones.push({
						res_zone_id : zones,
						res_turn_rule_id : turnRuleId,
						tables : self.getTablesZoneRules(turnZoneAdd.zonesTables,zones)
					});
				}
				
			});

			turnData.turn_zone = turnZones;

			return turnData;
		},
		getTurnRuleId : function(zonesTables,zoneId){
			var turnRuleId = null;
			angular.forEach(zonesTables, function(value, key){
				if(value.zone_id == zoneId){
					turnRuleId = value.res_turn_rule_id;
				}
			});
			return turnRuleId;
		},
		getTablesZoneRules : function(zonesTables,zoneId){
			var data = {};
			angular.forEach(zonesTables, function(value, key){
				if(value.zone_id == zoneId){

					/*angular.forEach(value.tables, function(tables){
						delete tables.rules_disabled;
						delete tables.rules_local;
						delete tables.rules_online;
						delete tables.res_turn_rule_id;
					});*/
	
					data = value.tables;
				}
			});
			return data;
		},
		deleteZone : function(turnZoneAdd,zoneId){
			var index = turnZoneAdd.zones_id.indexOf(zoneId);

			if(index != -1){
				turnZoneAdd.zones_id.splice(index, 1);
				turnZoneAdd.zones_data.splice(index, 1);
			}

			angular.forEach(turnZoneAdd.zonesTables, function(zone,key){
				if(zone.zone_id == zoneId){
					turnZoneAdd.zonesTables.splice(key,1);
				}
			});

			console.log("deleteZone " + angular.toJson(turnZoneAdd,true));
		},
		getTurn : function(idTurn,options,listAvailability){
			var defered = $q.defer();
			var self = this;

			TurnDataFactory.getTurn(idTurn,options).success(function(data){
				data = data.data;
		
				var turnData = {
					id : data.id,
					name : data.name,
					hours_ini : data.hours_ini,
					hours_end : data.hours_end
				}

				var hour_ini = self.getIndexHour(data.hours_ini);
				var hour_end = self.getIndexHour(data.hours_end,1);//esto pendiente

				/*if(moment(data.hour_ini).(data.hour_end)){
					alert("dsd");
				}*/

				var turnForm = {
					hours_ini : { index : hour_ini,time_original :data.hours_ini,time : listAvailability[hour_ini].time },
					hours_end : { index : hour_end , time_original : data.hours_end,time : listAvailability[hour_end].time },
					type_turn : { id : data.res_type_turn_id, label : ''}
				}

				console.log("turnForm " + angular.toJson(turnForm,true));

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
		getTurnZoneTables : function(idZone,idTurn,option,turnZoneAdd,turnForm,zoneSelected){
			var defered = $q.defer();
			var self = this;

			var tablesZoneExists = self.searchZoneByZoneAdd(turnZoneAdd.zonesTables,idZone);

			if(tablesZoneExists != null){
				defered.resolve(tablesZoneExists.tables);
			}else{

				self.addRulesTable(zoneSelected,turnZoneAdd);

				if(option == "edit"){
					TurnDataFactory.getTurnZoneTables(idZone,idTurn).success(function(data){
						//data = self.checkRuleTableAll(data.data,1,turnForm);
						defered.resolve(data.data);
					}).error(function(data,status,headers){
						defered.reject(data);
					});
				}else{
					ZoneFactory.getTables(idZone).success(function(data){

						data = self.checkRuleTableAll(data.data,1,turnForm);
						defered.resolve(data);

					}).error(function(data,status,headers){
						defered.reject(data);
					});
				}

			}
			
			return defered.promise;
		},
		searchZoneByZoneAdd : function(zonesTablesAdd,idZone){
			var tablesZone = null;

			angular.forEach(zonesTablesAdd, function(data, key){
				if(data.zone_id == idZone){
					tablesZone = data;
					//console.log("searchZoneByZoneAdd " + angular.toJson(data,true));
				}
				
			});

			return tablesZone;
		},
		generatedTimeTable : function(turnData){
			/*var times = BookDateFactory.rangeDateAvailable(15,turnData);
			var timesFinal = [];
			var self = this;

			angular.forEach(times, function(value, key){

				var index = self.getIndexHour(value);
				value = replaceText(value,["AM","PM"," "],"");

				timesFinal.push({
					time : value,
					index : index
				});
	
			});

			return timesFinal;*/	
		},
		getIndexHour : function(value,nextday = 0){
			var hourIndex = value.indexOf(":");
			var min = value.substr(hourIndex);

			hourIndex = parseInt(value.substr(0,hourIndex));

			min = min.replace(":","");
			min = min.replace("AM","");
			min = min.replace("PM","");
			min = parseInt(min);

			var index = hourIndex * 4;

			if(min == 15){
				index +=1;
			}else if(min == 30){
				index +=2;
			}else if(min == 45){
				index +=3;
			}

			index = index + 96 * nextday;
			return index;
		},
		checkTableZone : function(tablesId,idTable){
			var index = tablesId.indexOf(idTable);

			if(index == -1){
				tablesId.push(idTable);
			}else{
				tablesId.splice(index,1);
			}
		},
		checkAllTableZone : function(tablesId,tables,option){
			
			if(option == true){
				tablesId.length = 0;
			}

			angular.forEach(tables, function(table, key){
				var index = tablesId.indexOf(table.id);
				if(index == -1){
					tablesId.push(table.id);
				}else{
					tablesId.splice(index,1);
				}
			});
		},
		getTableZoneTime : function(tables,idTable){
			var data = "";

			angular.forEach(tables, function(table, key){
				if(table.id == idTable){
					data = table;
				}
			});

			return data;
		},
		checkRuleTable : function(indexTime,rule,tableItem,rulesDataTemp){

			var jsonData = angular.toJson(rulesDataTemp);

			if(rulesDataTemp.length == 0 || jsonData.indexOf(indexTime) == -1){
				rulesDataTemp.push({
					rule_id : rule,
					index_time : indexTime	
				});
			}else{
				angular.forEach(rulesDataTemp, function(rules, key){
					if(rules.index_time == indexTime){
						rules.rule_id = rule;	
					}
				});
			}
		},
		saveRuleTable : function(tableItem,rulesDataTemp){
			angular.forEach(tableItem, function(table, key){
				angular.forEach(table.availability, function(rules, key){

					angular.forEach(rulesDataTemp, function(rulesTemp){

						if(key == rulesTemp.index_time){
							rules.rule_id = rulesTemp.rule_id;

							console.log("saveRuleTable " + angular.toJson(rules,true));
						}
						
					});

				});
				
			});

			return tableItem;
		},
		listHour : function(hourIni,hourEnd,availabilityTime){

		    var listTime = [];

		    angular.forEach(availabilityTime, function(value, key){

		    	if(value.index >= hourIni && value.index <= hourEnd){
		    		listTime.push({
		    			time : value.time,
		    			time_original : value.time_original,
		    			index : value.index
		    		});
		    	}

		    });

		    return listTime;
		},
		initAvailability : function(){
			var times = [];

			for (i = 0; i <120; i++) {
				var time = i * 60 * 15;
				var nextday = (i < 96) ? 0 : 1;

				var time_original = moment.utc(time*1000).format('HH:mm');

				if( i >= 52 && i < 96){
					var a = (i - 48) * 60 * 15;
					time = moment.utc(a*1000).format('HH:mm') +" PM";
				}else if(i <52){
					time = moment.utc(time*1000).format('HH:mm') +" AM";
				}else{
					time = moment.utc(time*1000).format('HH:mm') +" AM";
				}
	
				times.push({
					time : time,
					time_original : time_original,
					rule_id : "-1",
					nextday : nextday,
					index : i
				});
			};

			return times;
		},
		checkRuleTableAll : function(tables,rule,turnForm){
			var self = this;

			angular.forEach(tables,function(data){

				data = self.updateTextAvailabilityTable(data,rule,turnForm);

				angular.forEach(data.availability,function(rules){
					rules.rule_id = rule;
				});	

			});
		
			return tables;
		},
		updateTextAvailabilityTable : function(table,rule,turnForm){

			table.rules_disabled = "";
			table.rules_local = "";
			table.rules_online = "";

			table.res_turn_rule_id = rule;
	
			switch(rule){
				case 0:
					table.rules_disabled = turnForm.hours_ini.time +" - "+ turnForm.hours_end.time;
					break;
				case 1:
					table.rules_local = turnForm.hours_ini.time +" - "+ turnForm.hours_end.time;
					break;
				case 2:
					table.rules_online = turnForm.hours_ini.time +" - "+ turnForm.hours_end.time;
					break;
			}

			return table;
		},
		addRulesTable : function(zoneSelected,turnZoneAdd){
			var vData = {
				zone_id : zoneSelected.id,
				res_turn_rule_id : zoneSelected.rule,
				tables : []
			}

			angular.forEach(zoneSelected.tables, function(value, key){
				vData.tables.push(value);
			});

			if(turnZoneAdd.zonesTables.length == 0){
				turnZoneAdd.zonesTables.push(vData);
			}else{

				var existeZone = 0;

				angular.forEach(turnZoneAdd.zonesTables, function(value, key){
					if(value.zone_id == zoneSelected.id ){ 
						//value = vData;
						turnZoneAdd.zonesTables.splice(key,1);
						turnZoneAdd.zonesTables.push(vData);

						existeZone +=1;
					}
				});

				if(existeZone == 0){
					turnZoneAdd.zonesTables.push(vData);
				}	
			}
		}

	};

})
;
