angular.module("App")
    .controller("reservationCtrl", ["$scope", "$window", "$location", "availabilityService", "utiles", function(vm, $window, $location, service, utiles) {

        vm.reservation= {};
        // vm.reservation.token = $location.search().key; //Nesecita domino para funcionar (.com ...)
        vm.reservation.guest= {};
        vm.reservation.guest_list = [];
        vm.newGuest = "";

        vm.errors = {};

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

        vm.clearErrors = function(key) {
            if (Object.prototype.toString.call(vm.errors[key]) == "[object Array]") {
                vm.errors[key].length = 0;
            }
        };

        var redirect = function(key) {
            $window.location.href = $location.protocol() + "://" + $location.host() + "/w/"+ microsite +"/confirmed?key=" + key;
        };

        vm.save = function() {
            console.log(vm.reservation);
            vm.loading = true;
            vm.errors = {};
            service.saveReservation(vm.reservation)
                .then(function(response) {
                    console.log(response.data.data);
                    redirect(response.data.data);
                }).catch(function(error) {
                    vm.errors = error.data.data;
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