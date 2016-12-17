angular.module("App")
    .controller("reservationCtrl", ["$scope", "$window", "$location", "availabilityService", "utiles", "_base_url", function(vm, $window, $location, service, utiles, _base_url) {

        vm.reservation= {};
        vm.reservation.token = token;
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
            $window.location.href = _base_url  +"/confirmed?key=" + key;
        };

        vm.redirectBase = function() {
            $window.location.href = _base_url;
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

    }]);