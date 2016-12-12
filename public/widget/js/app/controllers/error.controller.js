angular.module("App")
    .controller("errorCtrl", ["$scope", "$timeout", "$window", "$location", function(vm, $timeout, $window, $location) {
        $timeout(function() {
            $window.location.href = $location.protocol() + "://" + $location.host() + "/w/" + microsite;
        }, 3000);
    }]);