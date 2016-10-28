angular.module("floor.notify.controller", [])
	.controller('NotificationCtrl', function($scope, $rootScope, ServerNotification) {

		var serverSocket = ServerNotification.getConnection();

		serverSocket.on("b-mesas-floor-notes", function(data) {
			$rootScope.$broadcast("NotifyFloorNotesReload", data);
		});

		serverSocket.on("b-mesas-floor-upd-res", function(data) {
			$rootScope.$broadcast("NotifyFloorTableReservationReload", data);
		});

	});