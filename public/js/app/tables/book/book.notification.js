angular.module("book.controller")

.controller('BookNotificationCtrl', function($scope, ServerNotification) {

    var serverSocket = ServerNotification.getConnection();

    serverSocket.on("b-mesas-floor-res", function(data) {
        $scope.$broadcast("NotifyNewReservation", data);
    });

    serverSocket.on("b-mesas-floor-notes", function(data) {
        $scope.$broadcast("floorNotesReload", data);
    });

    serverSocket.on("b-mesas-config-update", function(data) {
        $scope.$broadcast("NotifyBookConfigReload", data.user_msg);
    });

});