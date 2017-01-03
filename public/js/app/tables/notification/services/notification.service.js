angular.module("materialAdmin")
    .factory('notificationService', ["$http", "ApiUrlMesas", function($http, ApiUrlMesas) {
        return {
            getNotifications: function(page) {
                return $http.get(page ? page : ApiUrlMesas + "/notification");
            },
            clearNotifications: function() {
                return $http.put(ApiUrlMesas + "/notification");
            }
        };
    }]);