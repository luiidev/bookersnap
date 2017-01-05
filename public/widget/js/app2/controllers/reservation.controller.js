angular.module("App")
    .controller("reservationCtrl", ["$scope", "$window", "$location", "availabilityService", "utiles", "base_url", function(vm, $window, $location, service, utiles, base_url) {

        vm.reservation= {};
        vm.reservation.token = token;
        vm.reservation.guest= {};
        vm.reservation.guest_list = [];
        vm.newGuest = "";

        vm.years = [];
        vm.months = [];
        vm.days = [];

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
            $window.location.href = base_url.get("/confirmed?key=" + key);
        };

        vm.redirectBase = function() {
            $window.location.href = base_url.getWithParam({edit: 1});
        };

        vm.save = function() {
            console.log(vm.reservation);
            vm.loading = true;
            vm.errors = {};
            service.saveReservation(vm.reservation)
                .then(function(response) {
                    redirect(response.data.data);
                }).catch(function(error) {
                    vm.errors = error.data.data;
                    vm.loading = false;
                });
        };

        var runYear = function() {
            y = 2000;
            while (y-- > 1940) {
                vm.years.push(y);
            }
        };

        var runMonth = function() {
            vm.months["01"] = "Enero";
            vm.months["02"] = "Febrero";
            vm.months["03"] = "Marzo";
            vm.months["04"] = "Abril";
            vm.months["05"] = "Mayo";
            vm.months["06"] = "Junio";
            vm.months["07"] = "Julio";
            vm.months["08"] = "Agosto";
            vm.months["09"] = "Septiembre";
            vm.months["10"] = "Octubre";
            vm.months["11"] = "Noviembre";
            vm.months["12"] = "Diciembre";
        };

        vm.changeMonth = function(mes) {
            vm.days.length = 0;

            var j = 0;

            if (mes === ""){
                k = 0;
            } else if (mes == 2){
                k = 28;
            } else if (mes == 4 || mes== 6 || mes == 9 || mes == 11) {
                k = 30;
            } else {
                k = 31;
            }

            while (j++ < k) {
                if (j.toString().length === 1) {
                    vm.days.push("0" + j.toString());
                } else {
                    vm.days.push(j.toString());
                }

            }
        };

        (function Init() {
            runYear();
            runMonth();
        })();

    }]);