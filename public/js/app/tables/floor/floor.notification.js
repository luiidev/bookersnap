angular.module("floor.notify.controller", [])

.controller('FloorMainCtrl', function($scope, ServerNotification) {

    var serverSocket = ServerNotification.getConnection();

    serverSocket.on("b-mesas-floor-notes", function(data) {
        $scope.$broadcast("floorNotesReload", data);
    });

    serverSocket.on("b-mesas-floor-res", function(data) {
        $scope.$broadcast("NotifyFloorTableReservationReload", data);
    });

    serverSocket.on("b-mesas-config-update", function(data) {
        $scope.$broadcast("NotifyFloorConfigUpdateReload", data.user_msg);
    });

    serverSocket.on("b-mesas-floor-server", function(data) {
        $scope.$broadcast("NotifyFloorTableServerReload", data);
    });

    serverSocket.on("b-mesas-floor-upd-block", function(data) {
        $scope.$broadcast("NotifyFloorBlock", data);
    });

});