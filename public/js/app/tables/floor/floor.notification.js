angular.module("floor.notify.controller", [])
	.controller('FloorMainCtrl', function($scope, $rootScope, ServerNotification) {

		var serverSocket = ServerNotification.getConnection();

		serverSocket.on("b-mesas-floor-notes", function(data) {
			$rootScope.$broadcast("NotifyFloorNotesReload", data);
		});

		serverSocket.on("b-mesas-floor-upd-res", function(data) {
			$rootScope.$broadcast("NotifyFloorTableReservationReload", data);
		});

		serverSocket.on("b-mesas-config-update", function(data) {
			$rootScope.$broadcast("NotifyFloorConfigUpdateReload", data);
		});

		serverSocket.on("b-mesas-floor-upd-block", function(data) {
			$rootScope.$broadcast("NotifyFloorBlock", data);
		});

	});