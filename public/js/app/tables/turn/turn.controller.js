angular.module('turn.controller', ['form.directive'])

.controller('TurnCtrl', function($scope,$stateParams,TurnFactory) {

	$scope.turns = {};

	var init = function(){
		getTurns({
			with : "zones|type_turn"
		});
	};

	var getTurns = function(options){

		options = getAsUriParameters(options);

		TurnFactory.listTurns(options).then(function success(response){
			$scope.turns = response;
		},function error(response){
			messageErrorApi(response,"Error","warning");
		});
	};

	init();
})
.controller('TurnCreateCtrl', function($scope,$stateParams,$state,$filter,$uibModal,TurnFactory,TypeTurnFactory,DateFactory) {

	$scope.turnData = {
		name : '',
		hours_ini : '',
		hours_end : '',
		res_type_turn_id : '',
		status : 1,
		turn_zone : []
		//days : []
	};

	$scope.turnDataClone = {};//para validar si ha ocurrido algun cambio en la data (editar)f

	$scope.turnForm = {
		hours_ini : '',
		hours_end : '',
		type_turn : ''
	};

	$scope.zonesTable = false;//validar si se oculta la lista de zonas (cuando estamos en mesas)

	$scope.typeTurns = {
		data : ''
	};

	$scope.turnsList = {};

	$scope.turnZoneAdd = {
		zones_id : [],
		zones_data : [],
		zonesTables : []//van las tablas y sus reglas, zone_id , tables -> rules
	};

	$scope.zoneSelected = {
		id : '',
		name : '',
		rule : '',
		tables : [],
		timesDefault : [],
		tablesId : [] //cuando marcamos check en la mesa se agrega
	};

	$scope.mesasCheckAll = false;

	var init = function(){
		getTypeTurns();

		loadDataTurnoEdit();
	};

	var getTypeTurns = function(){
		TypeTurnFactory.getTypeTurns().success(function(data){

			$scope.typeTurns.data = data;
			$scope.turnForm.type_turn = data[0];

		}).error(function(data,status,headers){
			messageErrorApi(data,"Error","warning");
		});
	};

	var saveTurn = function(option){

		$scope.turnData = TurnFactory.constructStructureSave($scope.turnData,$scope.turnForm,$scope.turnZoneAdd);

		console.log("saveTurn " + angular.toJson($scope.turnData,true));

		/*TurnFactory.saveTurn($scope.turnData,option).then(
			function success(response){
				messageAlert("Success","Turno registrado","success");
				$state.reload();
			},
			function error(response){
				messageErrorApi(response,"Error","warning");
			}
		);*/
	};

	var loadDataTurnoEdit = function(){
		if ($stateParams.turn != undefined) {

			var params = "with=turn_zone.zone|turn_zone.rule|turn_zone.zone.tables|turn_zone.zone.turns";

			TurnFactory.getTurn($stateParams.turn,params).then(
				function success(data){

					$scope.turnData = data.turnData;
					$scope.turnForm = data.turnForm;
					$scope.turnDataClone = data.turnDataClone;

					$scope.turnZoneAdd.zones_id = data.zonesId;
					$scope.turnZoneAdd.zones_data = data.dataZones;

					$scope.zoneSelected.timesDefault = TurnFactory.generatedTimeTable($scope.turnData);

				},
				function error(data){
					messageErrorApi(data,"Error","warning");
				}
			);
		}
	};

	var addTablesRules = function(){
		var vData = {
			zone_id : $scope.zoneSelected.id,
			tables : []
		}

		angular.forEach($scope.zoneSelected.tables, function(value, key){
			vData.tables.push(value);
		});

		if($scope.turnZoneAdd.zonesTables.length == 0){
			$scope.turnZoneAdd.zonesTables.push(vData);
		}else{

			var existeZone = 0;

			angular.forEach($scope.turnZoneAdd.zonesTables, function(value, key){
				if(value.zone_id == $scope.zoneSelected.id ){
					value = vData;
					existeZone +=1;
					console.log("ya existe " + value.zone_id);
				}
			});

			if(existeZone == 0){
				$scope.turnZoneAdd.zonesTables.push(vData);
			}	
		}

		//console.log("returnBoxZones " + angular.toJson($scope.turnZoneAdd.zonesTables,true));
	};

	$scope.validateSaveTurn = function(option){

		if ($scope.turnForm.$valid) {
			TurnFactory.validateTurn($scope.turnData,$scope.turnForm,$scope.turnDataClone).then(
				function success(response){
					if(response == true){
						messageAlert("Mensaje del sistema","Ya existe este horario","info");
					}

					if ($scope.turnZoneAdd.zones_id.length == 0) {
						messageAlert("Mensaje del sistema","Necesitas asignar minimo una zona","info");
					}

					if(response == false &&  $scope.turnZoneAdd.zones_id.length > 0){
						saveTurn(option);
					}
				},
				function error(response){
					messageErrorApi(response,"Error","warning");
				}
			);
		}else{
			messageAlert("Mensaje del sistema","Faltan datos","info");
			saveTurn(option);
		}
	};

	$scope.showZones = function(){
		$uibModal.open({
			animation: true,
			templateUrl: 'myModalZones.html',
			size: 'lg',
			controller : 'ModalTurnZoneCtrl',
			resolve: {
				turnZoneAdd : function(){
					return $scope.turnZoneAdd;
				}
			}
        });
	};

	$scope.returnBoxZones = function(){

		$scope.zonesTable=false;

		// Al regresar,retornamos la data que hallamos guardado (reglas de las mesas)
		addTablesRules();

		$scope.zoneSelected.tablesId.length = 0;
	};

	$scope.deleteZone = function(zoneId){
		TurnFactory.deleteZone($scope.turnZoneAdd,zoneId);
	};

	$scope.showTables = function(zone){
		$scope.zonesTable = true;

		$scope.zoneSelected.id = zone.id;
		$scope.zoneSelected.name = zone.name;
		//$scope.zoneSelected.rule = zone.rule.name;

		//console.log("showTables " + angular.toJson($scope.zoneSelected,true));

		TurnFactory.getTurnZoneTables(zone.id,$stateParams.turn).then(
			function success(response){
				$scope.zoneSelected.tables = response;
				console.log("getTurnZoneTables " + angular.toJson(response,true));
			},
			function error(response){
				messageErrorApi(response,"Error","warning");
			}
		);
	};

	$scope.selectedAllTables = function(){
	
		TurnFactory.checkAllTableZone($scope.zoneSelected.tablesId,$scope.zoneSelected.tables,$scope.mesasCheckAll);
	
		console.log("selectedAllTables " , angular.toJson($scope.zoneSelected.tablesId,true));
	};

	$scope.editTableAvailability = function(){
		$uibModal.open({
			animation: true,
			templateUrl: 'myModalTableTime.html',
			size: 'lg',
			controller : 'ModalTableTimeCtrl',
			resolve: {
				timesDefault : function(){
					return $scope.zoneSelected.timesDefault;
				},
				tablesId : function(){
					return $scope.zoneSelected.tablesId;
				},
				tablesData : function(){
					return $scope.zoneSelected.tables;
				}
			}
        });
	};

	$scope.selectItemTable = function(table){
		TurnFactory.checkTableZone($scope.zoneSelected.tablesId,table.id);
		console.log("selectItemTable " + angular.toJson($scope.zoneSelected.tablesId,true));
	};

	init();
})
.controller('ModalTableTimeCtrl', function($scope,$uibModalInstance,timesDefault,tablesId,tablesData,TurnFactory) {
	$scope.timesTables = [];

 	$scope.rules = {};
 	$scope.rules.online = false;
 	$scope.rules.disabled = false;
 	$scope.rules.local = false;
 	$scope.rules.dataTemp = [];

 	var tableItem = [];

 	var init = function(){
 		listTime();
 		listTimeTable();
 	};

	var listTime = function(){
		$scope.timesTables = timesDefault;
		//console.log("timesDefault " ,angular.toJson(timesDefault,true));
	};

	var listTimeTable = function(){
		console.log("listTimeTable " ,tablesId.length);

		if(tablesId.length == 1){
			tableItem.push(TurnFactory.getTableZoneTime(tablesData,tablesId[0]));
			//console.log("listTimeTable2 " + angular.toJson(tableItem,true));
		}else{
			
			angular.forEach(tablesId, function(value, key){
				tableItem.push(TurnFactory.getTableZoneTime(tablesData,value));
			});
		}
	};

	var updateTableRules = function(rulesTable){
		
		angular.forEach(tablesData, function(value, key){

			angular.forEach(rulesTable, function(table, key){
				if(table.id == value.id){
					value = table;
				}
			});
			//console.log("updateTableRules " + angular.toJson(value,true));
		});

		console.log("updateTableRules " + angular.toJson(tablesData,true));
	};

	$scope.checkRuleAll = function(option){
		switch(option){
			case "local" :
				$scope.rules.local = true;
				$scope.rules.disabled = false;
				$scope.rules.online = false;
				break;
			case "disabled":
				$scope.rules.disabled = true;
				$scope.rules.local = false;
				$scope.rules.online = false;
				break;
			case "online":
				$scope.rules.online = true;
				$scope.rules.disabled = false;
				$scope.rules.local = false;
				break;
		}
	};

	$scope.checkRule = function(timeIndex,value){
		TurnFactory.checkRuleTable(timeIndex,value,tableItem,$scope.rules.dataTemp);
	};

	$scope.saveRules = function(){
		var rulesTable = TurnFactory.saveRuleTable(tableItem,$scope.rules.dataTemp);
	
		updateTableRules(rulesTable);

		$uibModalInstance.close();
	};

	$scope.closeModal = function(){
		$uibModalInstance.dismiss('cancel');
	};

	init();
})
.controller('ModalTurnZoneCtrl', function($scope,$uibModalInstance,TurnFactory,turnZoneAdd) {

	$scope.cancel = function(){
		$uibModalInstance.dismiss('cancel');
	};

	$scope.zonesList = [];

	var listZones = function(){
		TurnFactory.listZones().then(
			function succes(response){
				var vZones = [];

				angular.forEach(response, function(value, key){
					value.checked = false;

					if(turnZoneAdd.zones_id.indexOf(value.id) != -1){
						value.checked = true;
					}

					vZones.push(value);
				});

				$scope.zonesList = vZones;
			},
			function error(response){
				messageErrorApi(response,"Error","warning");
			}
		);
	};

	$scope.asignZone = function(zone){
		var index = turnZoneAdd.zones_id.indexOf(zone.id);

		if(index == -1){
			turnZoneAdd.zones_id.push(zone.id);
			turnZoneAdd.zones_data.push(zone);
		}else{
			turnZoneAdd.zones_id.splice(index, 1);
			turnZoneAdd.zones_data.splice(index, 1);
		}
	};

	listZones();
})
;
