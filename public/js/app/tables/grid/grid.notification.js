angular.module("grid.controller")

.controller('GridNotificationCtrl', function($scope, ServerNotification) {

    var serverSocket = ServerNotification.getConnection();


});