angular.module("book.controller")

.controller('BookNotificationCtrl', function($scope, ServerNotification) {

    var serverSocket = ServerNotification.getConnection();

    serverSocket.on("b-mesas-floor-res", function(data) {
        $scope.$broadcast("NotifyNewReservation", data);
    });

});