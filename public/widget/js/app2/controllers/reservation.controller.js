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
                    if (error.data === null) {
                        vm.loading = false;
                        return alert("Ocurrio un problema vuelva a intentarlo.");
                    }
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
            vm.months = [
                { id: "01", label: "Enero" },
                { id: "02", label: "Febrero" },
                { id: "03", label: "Marzo" },
                { id: "04", label: "Abril" },
                { id: "05", label: "Mayo" },
                { id: "06", label: "Junio" },
                { id: "07", label: "Julio" },
                { id: "08", label: "Agosto" },
                { id: "09", label: "Septiembre" },
                { id: "10", label: "Octubre" },
                { id: "11", label: "Noviembre" },
                { id: "12", label: "Diciembre" }
            ];
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

            if (vm.days.indexOf(vm.day) === -1) {
                vm.day = undefined;
            }

            validDate();
        };

        vm.changeDay = function(mes) {
            validDate();
        };

        vm.changeYear = function(mes) {
            validDate();
        };

        var validDate = function () {
            if (vm.year ===undefined || vm.month ===undefined || vm.day === undefined) {
                vm.reservation.guest.birthdate = null;
            } else {
                var date = new Date(vm.year + "/" + vm.month + "/" + vm.day);

                if ( isNaN(date.getTime()) ) {
                    vm.reservation.guest.birthdate = null;
                } else {
                    vm.reservation.guest.birthdate = moment(date).format("YYYY-MM-DD");
                }
            }
        };

        (function Init() {
            runYear();
            runMonth();
        })();

    }]);