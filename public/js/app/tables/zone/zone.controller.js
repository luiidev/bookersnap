angular.module('zone.controller', ['ngDraggable'])

.controller('ZoneCtrl', function($scope,ZoneFactory) {

	$scope.zonesActive = {};
	$scope.zonesInactive = {};

	$scope.getZones = function(){

		ZoneFactory.getZones().success(function(data){
			
			var vZonesActive = [];
			var vZonesInactive = [];
			
			angular.forEach(data, function(zones) {

				var zonesTables = getTablesCount(zones);

				if (zones.status == "0" || zones.status == "2") {
					vZonesInactive.push(zonesTables);
				}else{
					vZonesActive.push(zonesTables);
				}
				
			});

			$scope.zonesActive = vZonesActive;
			$scope.zonesInactive = vZonesInactive;
		});
	};

	var getTablesCount = function(zones){
		var vTables = 0;

		angular.forEach(zones.tables, function(tables) {
			vTables + = 1;
		});

		zones.tables_count = vTables;

		return zones;
	};

	$scope.getZones();
})
.controller('ZoneCreateCtrl', function($scope,ZoneFactory) {
	$scope.squareTables1 = [];
	$scope.squareTables2 = [];
	$scope.squareTables3 = [];

	$scope.roundTables1 = [];
	$scope.roundTables2 = [];
	$scope.roundTables3 = [];

	$scope.rectTables1 = [];
	$scope.rectTables2 = [];
	$scope.rectTables3 = [];

	$scope.type = "";

	$scope.centerAnchor = true;

	$scope.toggleCenterAnchor = function () {
		$scope.centerAnchor = !$scope.centerAnchor
	}

	$scope.onDragComplete=function(data,evt,type){
		console.log("drag success tipo :"+ type);
		$scope.type = type;
		selectTableTypeDrag(data,type);
	}

	$scope.onDropComplete=function(data,evt){
		console.log("drop success, data:" + $scope.type);

		selectTableTypeDrop(data,$scope.type);
		$scope.type = "";
	}

	var selectTableTypeDrag = function(data,type){
		var index = 0;

		switch(type) {
			case 's1':
				index = $scope.squareTables1.indexOf(data);
				if (index > -1) {
					$scope.squareTables1.splice(index, 1);
				}
			
			break;

			case 's2':
				index = $scope.squareTables2.indexOf(data);
				if (index > -1) {
					$scope.squareTables2.splice(index, 1);
				}
			
			break;

			case 's3':
				index = $scope.squareTables3.indexOf(data);
				if (index > -1) {
					$scope.squareTables3.splice(index, 1);
				}
			
			break;

			case 'r1':
				index = $scope.roundTables1.indexOf(data);
				if (index > -1) {
					$scope.roundTables1.splice(index, 1);
				}
			
			break;

			case 'r2':
				index = $scope.roundTables2.indexOf(data);
				if (index > -1) {
					$scope.roundTables2.splice(index, 1);
				}
			
			break;

			case 'r3':
				index = $scope.roundTables3.indexOf(data);
				if (index > -1) {
					$scope.roundTables3.splice(index, 1);
				}
			
			break;

			case 're1':
				index = $scope.rectTables1.indexOf(data);
				if (index > -1) {
					$scope.rectTables1.splice(index, 1);
				}
			
			break;

			case 're2':
				index = $scope.rectTables2.indexOf(data);
				if (index > -1) {
					$scope.rectTables2.splice(index, 1);
				}
			
			break;

			case 're3':
				index = $scope.rectTables3.indexOf(data);
				if (index > -1) {
					$scope.rectTables3.splice(index, 1);
				}
			
			break;
			
		}
	};

	var selectTableTypeDrop = function(data,type){
		var index = 0;

		switch(type) {
			case 's1':
				index = $scope.squareTables1.indexOf(data);
				if (index == -1)
					$scope.squareTables1.push(data);
			
			break;

			case 's2':
				index = $scope.squareTables2.indexOf(data);
				if (index == -1)
					$scope.squareTables2.push(data);
			break;

			case 's3':
				index = $scope.squareTables3.indexOf(data);
				if (index == -1)
					$scope.squareTables3.push(data);
			
			break;

			case 'r1':
				index = $scope.roundTables1.indexOf(data);
				if (index == -1)
					$scope.roundTables1.push(data);
			
			break;

			case 'r2':
				index = $scope.roundTables2.indexOf(data);
				if (index == -1)
					$scope.roundTables2.push(data);
			break;

			case 'r3':
				index = $scope.roundTables3.indexOf(data);
				if (index == -1)
					$scope.roundTables3.push(data);
			break;

			case 're1':
				index = $scope.rectTables1.indexOf(data);
				if (index == -1)
					$scope.rectTables1.push(data);
			break;

			case 're2':
				index = $scope.rectTables2.indexOf(data);
				if (index == -1)
					$scope.rectTables2.push(data);
			break;

			case 're3':
				index = $scope.rectTables3.indexOf(data);
				if (index == -1)
					$scope.rectTables3.push(data);
			break;
			default:
			break;

			
		}

	}
         
})

;
