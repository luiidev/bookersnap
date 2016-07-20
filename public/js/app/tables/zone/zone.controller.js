angular.module('zone.controller', [])

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
});
