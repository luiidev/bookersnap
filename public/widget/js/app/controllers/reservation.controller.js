angular.module("App")
    .controller("reservationCtrl", ["$scope", "$location", "availabilityService", function(vm, $location, service) {

        vm.reservation= {};
        // vm.reservation.token = $location.search().key; //Nesecita domino para funcionar (.com ...)
        vm.reservation.token = 123456789;
        vm.reservation.guest= {};
        vm.reservation.guest_list = [];
        vm.newGuest = "";

        vm.loading = false;

        vm.addGuest =function(event) {
            if (event.keyCode == 13 || event.keyCode == 32) {
                if (vm.newGuest .trim().length > 2) {
                    vm.reservation.guest_list.push(vm.newGuest .trim());
                    vm.newGuest = "";
                }
            }
        };

        vm.removeGuest = function(i) {
            vm.reservation.guest_list.splice(i, 1);
        };

        vm.save = function() {
            console.log(vm.reservation);
            vm.loading = true;
            service.saveReservation(vm.reservation)
                .then(function(response) {
                    alert("Se registro su reservacion")
                    console.log(response.data);
                }).catch(function(error) {
                    console.log(error);
                }).finally(function() {
                    vm.loading = false;
                });
        };

        /**
         * Init
         * @return Void
         */
        (function() {

        })();
    }]);