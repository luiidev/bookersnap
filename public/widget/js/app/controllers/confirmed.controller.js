angular.module("App")
    .controller("confirmedCtrl", ["$scope", "$window", "$location", "availabilityService", function(vm, $window, $location, availabilityService) {
        // vm.token = $location.search().key; //Nesecita domino para funcionar (.com ...)

        vm.cancel = function() {
            availabilityService.cancelReservation(vm.token)
                .then(function() {
                    redirect();
                }).catch(function() {
                    alert("Ocurrio un problema al intentar cancelar la reservacion, intentelo de nuevo por favor.");
                });
        };

        var redirect = function() {
            $window.location.href = $location.protocol() + "://" + $location.host() + "/w/" + microsite;
        };
    }]);