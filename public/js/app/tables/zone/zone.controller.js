angular.module('zone.controller', [])

.controller('ZoneCtrl', function($scope,ZoneFactory) {

	$scope.zonesActive = {};

	$scope.getZones = function(){

		ZoneFactory.getZones().success(function(data){
			
			var vZonesActive = [];
			var vZonesInactive = [];
			
			angular.forEach(data, function(zones) {
				console.log("datas" +JSON.stringify(zones.status));

				var vTables = 0;

				angular.forEach(zones.tables, function(tables) {
					vTables + = 1;
				});

				zones.tables_count = vTables;
				if (zones.status == "0" || zones.status == "2") {
					vZonesInactive.push(zones);
				}else{
					vZonesActive.push(zones);
				}
				
			});

			$scope.zonesActive = vZonesActive;
			$scope.zonesInactive = vZonesInactive;
		});
	};

	$scope.getZones();
});
