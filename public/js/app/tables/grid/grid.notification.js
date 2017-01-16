angular.module("grid.controller")

.controller('GridNotificationCtrl', function($scope, ServerNotification) {

    var serverSocket = ServerNotification.getConnection();

    serverSocket.on("b-mesas-floor-res", function(data) {
        $scope.$broadcast("NotifyNewReservation", data);
    });

    serverSocket.on("b-mesas-floor-upd-block", function(data) {
        $scope.$broadcast("NotifyNewBlock", data);
    });

    serverSocket.on("b-mesas-floor-notes", function(data) {
        $scope.$broadcast("floorNotesReload", data);
    });


});