angular.module("App")
    .controller("confirmedCtrl", ["$scope", "$window", "$location", "availabilityService", "base_url", function(vm, $window, $location, availabilityService, base_url) {
 
        vm.cancel = function() {
            availabilityService.cancelReservation(token)
                .then(function() {
                    redirect();
                }).catch(function() {
                    alert("Ocurrio un problema al intentar cancelar la reservacion, intentelo de nuevo por favor.");
                });
        };

        var redirect = function() {
            $window.location.href = base_url.get("");
        };
    }]);