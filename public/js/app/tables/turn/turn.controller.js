angular.module('turn.controller', ['form.directive'])

.controller('TurnCtrl', function($scope,$stateParams,TurnFactory) {

	$scope.turns = {};
	$scope.zoneId = $stateParams.zone;

	var getTurns = function(){

		if ($stateParams.zone != undefined) {

			TurnFactory.getTurns($stateParams.zone).success(function(data){
				var vTurns = [];

				angular.forEach(data,function(turns){

					var days = turns.days.length;

					turns.status = ((days >=1 && turns.status == 1) ? 1 : 0);

					vTurns.push(turns);

				});

				$scope.turns = vTurns;
	
		
			}).error(function(data,status,headers){

				messageAlert("Error",status,"warning");

			});
		}
	};

	getTurns();
})
.controller('TurnCreateCtrl', function($scope,$stateParams,$state,$filter,TurnFactory,IdMicroSitio) {

	$scope.zoneId = $stateParams.zone;

	$scope.turnData = {
		microsite_id : IdMicroSitio,
		name : '',
		hour_ini : '',
		hour_end : '',
		type : '',
		days : '',
	};

	$scope.turnForm = {
		hour_ini : '',
		hour_end : ''
	};

	$scope.typeTurns = {
		data : ''
	};

	$scope.days = [
		{id : 0, label : 'Domingo',disabled : true},
		{id : 1, label : 'Lunes',disabled : true},
		{id : 2, label : 'Martes',disabled : true},
		{id : 3, label : 'Miercoles',disabled : true},
		{id : 4, label : 'Jueves',disabled : true},
		{id : 5, label : 'Viernes',disabled : true},
		{id : 6, label : 'Sabado',disabled : true},
	];

	var getTypeTurns = function(){
		TurnFactory.getTypeTurns().success(function(data){

			$scope.typeTurns.data = data;
			$scope.turnData.type = data[0];

		}).error(function(msg){
			getTypeTurns();
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
		
		TurnFactory.getDaysTypeTurn($scope.zoneId,$scope.turnData.type.id).success(function(data){
			
			angular.forEach(data, function(day, key){
				$scope.days[day.day].disabled = false;
			});
		}).error(function(data,status,headers){
			messageAlert("Error",status,"warning");
		});
	};

	$scope.validateSaveTurn = function(){
		if ($scope.turnForm.$valid) {
			saveTurn();
		}else{
			messageAlert("Message system","Missing data","info");
		}
	};

	var saveTurn = function(){

		var days = getDaysSelected($scope.turnData.days);

		$scope.turnData.days = days;

		$scope.turnData.hour_ini = $filter('date')($scope.turnForm.hour_ini,'HH:mm:ss');
		$scope.turnData.hour_end = $filter('date')($scope.turnForm.hour_end,'HH:mm:ss');

		TurnFactory.createTurn($scope.zoneId,$scope.turnData).success(function(data){

			console.log("saveTurn " + angular.toJson(data,true));

			messageAlert("Message system","Saved data","success");
			$state.reload();

		}).error(function(data,status,headers){
			messageAlert("Error",status,"warning");
		});
	};

	getTypeTurns();

})
;
