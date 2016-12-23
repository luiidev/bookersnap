angular.module("App")
    .controller("errorCtrl", ["$scope", "$timeout", "$window", "$location", "_base_url", function(vm, $timeout, $window, $location, _base_url) {
        $timeout(function() {
            $window.location.href = _base_url;
        }, 3000);
    }]);