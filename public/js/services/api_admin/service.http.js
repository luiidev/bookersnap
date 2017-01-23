angular.module("httpApp", [])
    .factory("http", ["$http", function($http) {
        var service = {
            get: function(url, params) {
                return $http.get(url, {params: params});
            },
            post: function(url, data, config) {
                return $http.post(url, data, config);
            },
            put: function(url, data, config) {
                return $http.put(url, data, config);
            },
            delete: function(url, data, config) {
                return $http.delete(url, data, config);
            }
        };

        return service;
    }]);