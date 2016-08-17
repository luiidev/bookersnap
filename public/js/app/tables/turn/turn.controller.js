angular.module('turn.controller', ['form.directive'])

.controller('TurnCtrl', function($scope,$stateParams,TurnFactory) {

	$scope.turns = {};

	var getTurns = function(){

		TurnFactory.getTurns().success(function(data){
			var vTurns = [];

			console.log("getTurnss " + angular.toJson(data.data,true));

			angular.forEach(data.data,function(turns){

				//var days = turns.days.length;

				//turns.status = ((days >=1 && turns.status == 1) ? 1 : 0);

				vTurns.push(turns);

			});

			$scope.turns = vTurns;

		}).error(function(data,status,headers){

			messageErrorApi(data,"Error","warning");

		});
		
	};

	getTurns();
})
.controller('TurnCreateCtrl', function($scope,$stateParams,$state,$filter,TurnFactory,TypeTurnFactory,IdMicroSitio,DateFactory) {

	$scope.turnData = {
		microsite_id : IdMicroSitio,
		name : '',
		hours_ini : '',
		hours_end : '',
		type_turn : ''
		//days : []
	};

	$scope.turnDataClone = {};//para validar si ha ocurrido algun cambio en la data (editar)

	$scope.turnForm = {
		hours_ini : '',
		hours_end : ''
	};

	$scope.typeTurns = {
		data : ''
	};

	$scope.zoneId = $stateParams.id;

	$scope.days = [
		{id : 0, label : 'Domingo',disabled : false},
		{id : 1, label : 'Lunes',disabled : false},
		{id : 2, label : 'Martes',disabled : false},
		{id : 3, label : 'Miercoles',disabled : false},
		{id : 4, label : 'Jueves',disabled : false},
		{id : 5, label : 'Viernes',disabled : false},
		{id : 6, label : 'Sabado',disabled : false},
	];

	$scope.turnsList = {};

	var getTurns = function(){

		TurnFactory.getTurns($scope.zoneId).success(function(data){
			var vTurns = [];

			angular.forEach(data.data,function(turns){

				var days = getDayTextTurn(turns.days,"short");
				turns.days_short = days.join();
				vTurns.push(turns);

			});

			$scope.turnsList = vTurns;

		}).error(function(data,status,headers){

			messageErrorApi(data,"Error","warning");

		});	
	};

	var getDayTextTurn = function(days,option){
		var daysText = [];

		angular.forEach(days, function(value, key){
			var day = getDayText(value.day,option);
			daysText.push(day);

		});

		return daysText;
	};

	var getTypeTurns = function(){
		TypeTurnFactory.getTypeTurns().success(function(data){

			$scope.typeTurns.data = data;
			$scope.turnData.type_turn = data[0];

		}).error(function(data,status,headers){
			messageErrorApi(data,"Error","warning");
		});
	};

	var getDaysSelected = function(days){
		var daysData = [];

		angular.forEach(days, function(data,key){
			if(data){
				daysData.push({ day : key});
			}
		});
		return daysData;
	};

	$scope.getDaysTypeTurn = function(){
		
		TypeTurnFactory.getDaysTypeTurn($scope.turnData.type_turn.id).success(function(data){
			
			angular.forEach(data, function(day, key){
				$scope.days[day.day].disabled = false;
			});
			
		}).error(function(data,status,headers){
			messageAlert("Error",status,"warning");
		});
	};

	$scope.validateSaveTurn = function(option){
		if ($scope.turnForm.$valid) {
			validateTurnByTime(option);
		}else{
			messageAlert("Mensaje del sistema","Faltan datos","info");
		}
	};

	var validateTurnByTime = function(option){

		var valTime = {
			hours_ini : DateFactory.timeFormat($scope.turnForm.hours_ini),
			hours_end : DateFactory.timeFormat($scope.turnForm.hours_end),
			type_turn : $scope.turnData.type_turn.id
		} 

		var vParams = getAsUriParameters(valTime);

		TurnFactory.searchTurn(vParams).success(function(data){
			console.log(data.data.length);
			if (data.data.length == 0 || ($scope.turnDataClone.hours_ini == valTime.hours_ini && $scope.turnDataClone.hours_end == valTime.hours_end )) {
				saveTurn(option);
			}else{
				messageAlert("Mensaje del sistema","Ya existe este horario","info");
			}
		}).error(function(data,status,headers){
			messageErrorApi(data,"Error","warning");
		});
	};

	var saveTurn = function(option){

		//var days = getDaysSelected($scope.turnData.days);
		//$scope.turnData.days = days;

		$scope.turnData.hours_ini = DateFactory.timeFormat($scope.turnForm.hours_ini,'HH:mm:ss');
		$scope.turnData.hours_end = DateFactory.timeFormat($scope.turnForm.hours_end,'HH:mm:ss');

		if (option == "create") {

			console.log("saveTurn " + angular.toJson($scope.turnData,true));

			TurnFactory.createTurn($scope.turnData).success(function(data){

				messageAlert("Mensaje del sistema","Turno guardado","success");

				$state.reload();

			}).error(function(data,status,headers){
				messageErrorApi(data,"Error","warning");
			});

		}else{

			$scope.turnData.id = $stateParams.turn;

			TurnFactory.updateTurn($scope.turnData).success(function(data){

				console.log("updateTurn " + angular.toJson(data,true));

				messageAlert("Mensaje del sistema","Turno editado","success");

				$state.go('turn');

			}).error(function(data,status,headers){
				messageErrorApi(data,"Error","warning");
			});
		}
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

				$scope.turnData.type_turn = { id : data.type_turn.id , label : ''};

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

	getTypeTurns();

	//$scope.getDaysTypeTurn();

	//getTurns();

	loadDataTurnoEdit();

})
;
