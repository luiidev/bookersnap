angular.module("App")
    .controller("errorCtrl", ["$scope", "$timeout", "$window", "$location", "base_url", function(vm, $timeout, $window, $location, base_url) {
        $timeout(function() {
            $window.location.href = base_url.get("");
        }, 3000);
    }]);