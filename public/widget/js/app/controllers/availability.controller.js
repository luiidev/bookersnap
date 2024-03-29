angular.module("App")
    .controller("availabilityCtrl", ["$scope", "$q", "availabilityService", "utiles", "$window", "$location", "_base_url",
         function(vm, $q, availabilityService, utiles, $window, $location, _base_url) {

        vm.form = {};
        vm.result = [];
        vm.availability = {};
        vm.loadingInfo = false;
        vm.message = "";
        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };

        vm.showPrev = false;

        /**
         * HTTP
         */
        vm.searchAvailability = function() {
            var deferred = $q.defer();

            vm.loadingInfo = true;
            // vm.result.length = 0;
            availabilityService.getAvailability(vm.availability)
                .then(function(response) {
                    vm.result = resultFormat(response.data.data);
                    deferred.resolve(vm.result);
                }).catch(function(error) {
                    deferred.reject("Error en la busqueda de disponibilidad");
                    console.log("Error en la busqueda de disponibilidad", error);
                }).finally(function() {
                    vm.loadingInfo = false;
                });

            return deferred.promise;
        };

        vm.saveTemporalReserve = function(item) {
            vm.loadingInfo = true;

            availabilityService.saveTemporalReserve(item.form)
                .then(function(response) {
                    redirect(response.data.data.token);
                }).catch(function(error) {
                    alert("Ocurrio un problema al tratar de reservar, intentelo de nuevo.");
                    console.log("Error en la reserva temporal", error);
                }).finally(function() {
                    vm.loadingInfo = false;
                });
        };
        /**
         * HTTP
         */
        
         var redirect = function(key) {
             $window.location.href = _base_url + "/reserve?key=" + key;
         };

        /**
         * Date picker filter
         */
        vm.disabled = function(date, mode){
            var isHoliday = false;
            for(var i = 0; i < vm.form.daysDisabled.length ; i++) {
              if(areDatesEqual(toDate(vm.form.daysDisabled[i]), date)){
                isHoliday = true;
              }
            }

            return ( mode === 'day' && isHoliday );
       };

      function areDatesEqual(date1, date2) {
        return date1.setHours(0,0,0,0) === date2.setHours(0,0,0,0);
      }

      function toDate(date) {
            return new Date(date.split("-"));
      }
      /**
       * END Date picker filter
       */
      
       /**
        * Format data
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

            vm.availability.num_guests = vm.form.people.some(function(item) {
                return item.value === vm.availability.num_guests;
            }) ?  vm.availability.num_guests  : 1;

            vm.availability.zone_id =  vm.form.zones.some(function(item) {
                return item.id === vm.availability.zone_id;
            }) ?  vm.availability.zone_id  : null;

            vm.availability.hour = utiles.filterHour(vm.form.hours, vm.availability.hour);

            vm.infoDate = moment(date).format("dddd, D [de] MMMM");
            vm.infoAvailability = 'Reservaciones disponibles al ' + vm.infoDate + ' a las ' + vm.availability.hour.option_user + ' para ' + vm.availability.num_guests + ' personas.';

            vm.searchAvailability();
        };
        /**
         * END Format data
         */

        vm.$watch('date', function(newValue, oldValue) {
            if (! moment(newValue).isSame(oldValue) && ! moment(vm.form.date).isSame(newValue)) {
                var date = moment(vm.date).utc().format("YYYY-MM-DD");
                InitModule(date);
            }
        });

        var InitModule = function(date) {
            vm.loadingInfo = true;
            vm.loadingData = true;
            vm.message = "Cargando ...";

            availabilityService.getFormatAvailability(date)
                .then(function(response) {
                    vm.form = response.data.data;
                    vm.date = new Date(vm.form.date.split("-"));

                    defaultData(vm.form.date);

                    vm.loadingData = false;
                }).catch(function() {
                    vm.result.length = 0;
                    vm.message = "Elija otra opcion de busqueda";
                }).finally(function() {
                    vm.loadingInfo = false;
                });
        };

        var searchTemporalReserve = function() {
            var deferred = $q.defer();

            availabilityService.searchTemporalReserve()
                .then(function(response) {
                    vm.prevReserve = response.data.data;
                    if (vm.prevReserve === null) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                }).catch(function(error) {
                    console.log(error);
                    deferred.reject();
                });

            return deferred.promise;
        };

        var cancelTemporalReservation = function() {
            token = "abcdefghijklmnopqrstuvwyz";
            availabilityService.cancelTemporalReservation(token);
        };

        vm.closePrev = function() {
            vm.showPrev = false;
            cancelTemporalReservation();
            InitModule();
        };

        vm.openPrev = function() {
            token = "abcdefghijklmnopqrstuvwyz";
            $window.location.href = _base_url + "/reserve?key=" + token;
        };

        /**
         * Init
         */
        (function() {
            searchTemporalReserve()
                .then(function() {
                    InitModule();
                })
                .catch(function() {
                    vm.showPrev = true;
                });
        })();
    }]);