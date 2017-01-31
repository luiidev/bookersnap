/**
 * Paso 2
 * Llenar datos personales para completar la reservacion
 */

angular.module("App")
    .controller("reservationCtrl", ["$scope", "$window", "$location", "availabilityService", "utiles", "base_url", function(vm, $window, $location, service, utiles, base_url) {
        /**
         * Objeto de reservacion
         */
        vm.reservation= {};
        vm.reservation.token = token;
        vm.reservation.guest= {};
        vm.reservation.guest_list = [];

        vm.newGuest = ""; // Input para agregar a lista de invitados

        vm.years = [];
        vm.months = [];
        vm.days = [];

        vm.errors = {}; // mensaje de error

        vm.loading = false;

        /**
         * Agregar a lista de invitados
         */
        vm.addGuest =function(event) {
            if (event.keyCode == 13 || event.keyCode == 32) {
                if (vm.newGuest .trim().length > 2) {
                    vm.reservation.guest_list.push(vm.newGuest .trim());
                    vm.newGuest = "";
                }
            }
        };

        /**
         * Remover de lista de invitados
         */
        vm.removeGuest = function(i) {
            vm.reservation.guest_list.splice(i, 1);
        };

        /**
         * Limpiar errores de validacion
         */
        vm.clearErrors = function(key) {
            if (Object.prototype.toString.call(vm.errors[key]) == "[object Array]") {
                vm.errors[key].length = 0;
            }
        };

        /**
         * Redireccionar hacia pagina de confirmacion de reservacion
         */
        var redirect = function(key) {
            $window.location.href = base_url.get("/confirmed?key=" + key);
        };

        /**
         * Redireccionar hacia el formulario de buscar disponiibilidad por que se agoto el tiempo para reservar
         */
        vm.redirectBase = function() {
            alert("El tiempo para completar la reservacion a terminado.");
            $window.location.href = base_url.url();
        };

        /**
         * Redireccionar hacia el formulario de diponibilidad con opcion de edicion
         */
        vm.redirectBaseEdit = function() {
            $window.location.href = base_url.getWithParam({edit: 1});
        };

        vm.save = function() {
            vm.loading = true;
            vm.errors = {};
            service.saveReservation(vm.reservation)
                .then(function(response) {
                    redirect(response.data.data);
                }).catch(function(error) {
                    console.log(error);
                    if (error.data === null || error.status == 500) {
                        vm.loading = false;
                        return alert("Ocurrio un problema vuelva a intentarlo.");
                    }
                    vm.errors = error.data.data;
                    vm.loading = false;
                });
        };

        /**
         * Llenar select de año
         */
        var runYear = function() {
            y = 2000;
            while (y-- > 1940) {
                vm.years.push(y);
            }
        };

        /**
         * Lennar select de mes
         * @return {[type]} [description]
         */
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

        /**
         * Cambio de mes, resetea los dias disponibles en ese mes
         */
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

        /**
         * Validar que la fecha seleccionada sea valida
         */
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