angular.module("App")
    .controller("reservationCtrl", ["$scope", "$q", "availabilityService", function(vm, $q, availabilityService) {

        vm.reservation= {};
        vm.reservation.guests = [];
        vm.newGuest = "";

        vm.addGuest =function(event) {
            if (event.keyCode == 13 || event.keyCode == 32) {
                if (vm.newGuest .trim().length > 2) {
                    vm.reservation.guests.push(vm.newGuest .trim());
                    vm.newGuest = "";
                }
            }
        };

        vm.removeGuest = function(i) {
            vm.reservation.guests.splice(i, 1);
        };

        /**
         * Init
         * @return Void
         */
        (function() {

        })();
    }]);