angular.module('zone.controller', [])

.controller('ZoneCtrl', function($scope,ZoneFactory) {

	$scope.zones = {};

	$scope.getZones = function(){

		ZoneFactory.getZones().success(function(data){
			console.log(JSON.stringify(data));
		});
	};

	$scope.getZones();
});
