angular.module("App")
    .controller("availabilityCtrl", ["$scope", "$q", "availabilityService", "utiles", function(vm, $q, availabilityService, utiles) {

        var date = moment().format("YYYY-MM-DD");
        vm.date = moment().toDate();
        vm.guests = [];
        vm.zones = [];
        vm.hours = [];
        vm.result = [];
        vm.availability = {};
        vm.loadingInfo = false;
        vm.message = "";
        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };

        /**
         * HTTP
         */

        var loadGuests = function() {
            var deferred = $q.defer();
            availabilityService.getGuests(10)
                .then(function(response) {
                    vm.guests = response;
                    deferred.resolve(vm.guests);
                })
                .catch(function(error) {
                    deferred.reject("Error de carga de invitados");
                    console.log("Error de carga de invitados", error);
                });
            return deferred.promise;
        };

        var loadZones = function(date) {
            var deferred = $q.defer();
            availabilityService.getZones(date)
                .then(function(response) {
                    vm.zones = response.data.data;
                    deferred.resolve(vm.zones);
                })
                .catch(function(error) {
                    deferred.reject("Error de carga de zonas");
                    console.log("Error de carga de zonas", error);
                });
            return deferred.promise;
        };

        var loadHours = function(date) {
            var deferred = $q.defer();
            availabilityService.getHours({
                    date: date
                })
                .then(function(response) {
                    vm.hours = response.data.data;
                    deferred.resolve(vm.hours);
                })
                .catch(function(error) {
                    deferred.reject("Error de carga de horas de disponibilidad");
                    console.log("Error de carga de horas de disponibilidad", error);
                });
            return deferred.promise;
        };

        vm.searchAvailability = function() {
            var deferred = $q.defer();

            vm.loadingInfo = true;
            // vm.result.length = 0;
            availabilityService.getAvailability(vm.availability)
                .then(function(response) {
                    vm.result = resultFormat(response.data.data);
                    deferred.resolve(vm.result);
                    vm.loadingInfo = false;
                })
                .catch(function(error) {
                    vm.loadingInfo = false;
                    deferred.reject("Error en la busqueda de disponibilidad");
                    console.log("Error en la busqueda de disponibilidad", error);
                });
            return deferred.promise;
        };

        /**
         * HTTP
         */

        var resultFormat = function(items) {
            angular.forEach(items, function(item) {
                if (item.hour !== null) {
                    item.hour_format = moment(item.hour, "HH:mm:ss").format("h:mm A");
                } else {
                    item.hour_format = "No disponible";
                }
            });

            return items;
        };

        var defaultData = function(date) {
            vm.availability.date = date;
            vm.availability.num_guests = vm.availability.num_guests || 2;
            vm.availability.zone_id = vm.availability.zone_id || null;
            vm.availability.hour = utiles.filterHour(vm.hours, vm.availability.hour);
            vm.infoDate = moment(date).format("dddd, D [de] MMMM");
            vm.infoAvailability = 'Reservaciones disponibles al ' + vm.infoDate + ' a las ' + vm.availability.hour.option_user + ' para ' + vm.availability.num_guests + ' personas.';
            // console.log(vm.availability);
            vm.searchAvailability();
        };

        vm.$watch('date', function(newValue, oldValue) {
            if (!moment(newValue).isSame(oldValue)) {
                var date = moment(vm.date).utc().format("YYYY-MM-DD");
                InitModule(date);
            }
        });

        var InitModule = function(date) {
            vm.loadingInfo = true;
            vm.loadingData = true;
            vm.message = "Cargando ...";

            $q.all([
                loadGuests(),
                loadZones(date),
                loadHours(date)
            ]).then(function() {
                defaultData(date);

                vm.loadingInfo = false;
                vm.loadingData = false;
            }).catch(function() {
                vm.loadingInfo = false;
                // vm.result.length = 0;
                vm.message = "Elija otra opcion de busqueda";
            });
        };

        /**
         * Init
         * @param  {String} date Fecha de inicio
         * @return Void
         */
        (function(date) {
            InitModule(date);
        })(date);
    }]);