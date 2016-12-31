angular.module("App")
    .controller("availabilityCtrl", ["$scope", "$q", "availabilityService", "utiles", "$window", "base_url", "$storage",
        function(vm, $q, availabilityService, utiles, $window, base_url, $storage) {

        var storage = $storage.instance;
        vm.form = {};
        vm.result = [];
        vm.availability = {};
        vm.loadingInfo = false;
        vm.message = "";

        vm.selectedPeople = {};
        vm.selectedZone = {};
        vm.selectedHour = {};
        vm.selectedEvent= {};

        vm.promotion = {};

        vm.minDate = new Date();
        vm.date = new Date();

        /**
         * Variables de apollo
         */
         var zoneColapse = true;
         vm.case = 0;

        /**
         *  HTTP 
         */
         vm.searchAvailability = function() {
            var deferred = $q.defer();

            vm.loadingInfo = true;
            // vm.result.length = 0;
            availabilityService.getAvailability(vm.availability)
                .then(function(response) {
                    vm.result = resultFormat(response.data.data);
                    showResult();
                    deferred.resolve(vm.result);
                }).catch(function(error) {
                    deferred.reject("Error en la busqueda de disponibilidad");
                    console.log("Error en la busqueda de disponibilidad", error);
                }).finally(function() {
                    vm.loadingInfo = false;
                    vm.infoAvailability = 'Reservaciones disponibles al ' + vm.infoDate + ' a las ' + vm.availability.hour.option_user + ' para ' + vm.availability.num_guests + ' personas.';
                });

             return deferred.promise;
         };

         vm.saveTemporalReserve = function(item) {
             vm.loadingInfo = true;

             availabilityService.saveTemporalReserve(item.form)
                 .then(function(response) {
                     storage._token  = response.data.data.token;
                     redirect();
                 }).catch(function(error) {
                     alert("Ocurrio un problema al tratar de reservar, intentelo de nuevo.");
                     console.log("Error en la reserva temporal", error);
                 }).finally(function() {
                     vm.loadingInfo = false;
                 });
         };
        /**
         * end HTTP
         */
        
        var redirect = function(key) {
            $window.location.href = base_url.get("/reserve?key=" + storage._token);
        };

        var showResult = function() {
            $("#first").fadeOut(100, function() {
                $("#two").fadeIn(100);
            });
            vm.case = 2;
        };
        
        vm.returnSearch = function() {
            $("#two").fadeOut(100, function() {
                $("#first").fadeIn(100);
            });
            vm.case = 1;
        };

       /**
        * Date picker filter
        */
        vm.disabled = function(date, mode){
            if(! vm.daysDisabled ) return;
            var isHoliday = false;
            for(var i = 0; i < vm.daysDisabled.length ; i++) {
              if(areDatesEqual(toDate(vm.daysDisabled[i]), date)){
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
         * Selects
         */
        
        vm.zoneColapse = function(event) {
            if (!zoneColapse) {
                event.stopPropagation();
            }
        };

        vm.selectPeople = function(guest) {
            vm.availability.num_guests = guest.value;
            vm.selectedPeople = guest;
        };

        vm.selectZone  = function(zone) {
            vm.availability.zone_id = zone.id;
            vm.selectedZone = zone; 
        };

        vm.selectHour = function(hour, event) {
            if (hour === null || hour === undefined) {
                vm.availability.hour = {};
                vm.selectedHour = {}; 
                vm.selectedEvent = {};
            } else {
                vm.availability.hour = hour;
                vm.selectedHour = hour; 

                if (event === null || event === undefined) {
                    if (hour.events) {
                        if (hour.events.length) {
                            vm.selectedEvent = hour.events[0];
                        } else {
                            vm.selectedEvent = {};
                        }
                    } else {
                        vm.selectedEvent = {};
                    }
                } else {
                    vm.selectedEvent = event;
                }
            }
        };
        /**
         * END Selects
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

         var findObject = function(array, func) {
            var object = null;
            for (var i = 0; i <= array.length -1; i++) {
                var result = func(array[i]);
                if (result === true) {
                    return array[i];
                }
            }

            return object;
         };

         var defaultData = function(date) {
            zoneColapse = true;

            // Default Date
             vm.availability.date = date;

             // Default num guests
             var find_people = findObject(vm.form.people, function(item) {
                return item.value == vm.selectedPeople.value;
             });

             if (find_people !== null) {
                vm.selectPeople(find_people);
             } else {
                if (vm.form.people.length) {
                    if (vm.form.people[1]) {
                        vm.selectPeople(vm.form.people[1]);
                    } else {
                        vm.selectPeople(vm.form.people[0]);
                    }
                }
             }

             // Default zone
             if (vm.form.zones.length === 1) {
                vm.selectZone(vm.form.zones[0]);
                zoneColapse = false;
             } else {
                var find_zone = findObject(vm.form.zones, function(item) {
                   return item.id == vm.selectedZone.id;
                });

                if (find_zone !== null) {
                   vm.selectZone(find_zone);
                } else {
                   if (vm.form.zones.length) {
                       vm.selectZone(vm.form.zones[0]);
                   }
                }
             }

            // Default hour
            vm.selectHour(utiles.filterHour(vm.form.hours, vm.availability.hour));

            // Date detail
             vm.infoDate = moment(date).format("dddd, D [de] MMMM");

             // vm.searchAvailability();
         };
         /**
          * END Format data
          */

        var InitModule = function(date) {
            vm.case = 1;
            vm.loadingInfo = true;
            vm.loadingData = true;
            vm.message = "Cargando ...";

            availabilityService.getFormatAvailability(date)
                .then(function(response) {
                    vm.form = response.data.data;
                    vm.daysDisabled = vm.form.daysDisabled;
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

        vm.$watch("date", function(newValue, oldValue) {
            if (! moment(newValue).isSame(oldValue) && ! moment(vm.form.date).isSame(newValue)) {
                var date = moment(vm.date).utc().format("YYYY-MM-DD");
                InitModule(date);
            }
        });

        var searchTemporalReserve = function() {
            var deferred = $q.defer();

            if (!$storage.existToken() || base_url.has("edit") ) {
                deferred.reject();
                return deferred.promise;
            }

            availabilityService.searchTemporalReserve()
                .then(function(response) {
                    vm.prevReserve = response.data.data;
                    if (vm.prevReserve !== null) {
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
            availabilityService.cancelTemporalReservation();
        };

        vm.closePrev = function() {
            vm.showPrev = false;
            cancelTemporalReservation();
            InitModule();
        };

        vm.openPrev = function() {
            if ($storage.existToken()) {
                $window.location.href = base_url.get("/reserve?key=" + storage._token);
            } else {
                InitModule();
            }
        };

        vm.promotionDisplay = function(item, evt) {
            vm.promotion.imageUrl = item.image ? "url(" + item.image + ")" : null; 
            vm.promotion.description = item.description || null;
            vm.promotion.display = true;
            angular.element(document.querySelector("#event")).css({top: evt.pageY - (vm.promotion.imageUrl ? 270 : 120) });
        };

        vm.promotionHide = function() {
            vm.promotion.display = false;
        };

        vm.changeMonth = function(date_ini, month, year, instance, select) {
            date_fin = moment(date_ini).endOf('months').format("YYYY-MM-DD");
            console.log(instance);
            var search = {
                date_ini: date_ini,
                date_fin: date_fin
            };

            availabilityService.getDaysDisabled(search)
                .then(function(response) {
                    vm.daysDisabled = response.data.data;
                }).finally(function(){
                    instance.refreshView();
                    if ( moment(date_ini).month() == moment(vm.date).month() ) {
                        select(moment(vm.date).toDate());
                    }
                    console.log(vm.date);
                    // instance.render();
                });
        };

        (function Init() {
            searchTemporalReserve()
                .then(function() {
                    vm.showPrev = true;
                })
                .catch(function() {
                    InitModule();
                });
        })();

    }]);