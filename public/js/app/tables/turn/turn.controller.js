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

	$scope.turnDataClone = {};//para validar si ha ocurrido algun cambio en la data (editar)

	$scope.turnForm = {
		hours_ini : '',
		hours_end : '',
		type_turn : '',

	};

	$scope.typeTurns = {
		data : ''
	};

	$scope.zoneId = $stateParams.id;

	$scope.turnsList = {};

	$scope.turnZoneAdd = {
		zones_id : [],
		zones_data : []
	};

	var init = function(){
		getTypeTurns();

		//loadDataTurnoEdit();
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

		TurnFactory.saveTurn($scope.turnData,option).then(
			function success(response){
				messageAlert("Success","Turno registrado","success");
				$state.reload();
			},
			function error(response){
				messageErrorApi(response,"Error","warning");
			}
		);
	};

	var loadDataTurnoEdit = function(){
		if ($stateParams.turn != undefined) {

			TurnFactory.getTurn($stateParams.turn).success(function(data){
				
				data = data.data;

				console.log("loadDataTurnoEdit " + angular.toJson(data,true));

				$scope.turnData.name = data.name;
				$scope.turnData.hours_ini = data.hours_ini;
				$scope.turnData.hours_end = data.hours_end;

				var hour_ini = data.hours_ini.split(":");
				var hour_end = data.hours_end.split(":");

				$scope.turnForm.hours_ini = new Date(1970, 0, 1,hour_ini[0],hour_ini[1],hour_ini[2]);
				$scope.turnForm.hours_end = new Date(1970, 0, 1,hour_end[0],hour_end[1],hour_end[2]);

				$scope.turnForm.type_turn = { id : data.type_turn.id , label : ''};

				$scope.turnDataClone = $scope.turnData;

				console.log("loadDataTurnoCloned " + angular.toJson($scope.turnDataClone,true));

				/*angular.forEach(data.days, function(day, key){
					$scope.turnData.days[day.day] = true;
				});*/

			}).error(function(data,status,headers){
				messageErrorApi(data,"Error","warning");
			});
		}
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

	$scope.deleteZone = function(zoneId){
		TurnFactory.deleteZone($scope.turnZoneAdd,zoneId);
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
