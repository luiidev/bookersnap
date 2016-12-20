angular.module("App")
    .controller("availabilityCtrl", ["$scope", "$q", "availabilityService", function(vm, $q, availabilityService) {

        vm.form = {};
        vm.result = [];
        vm.availability = {};
        vm.loadingInfo = false;
        vm.message = "";
        vm.dateOptions = {
            showWeeks: false,
            startingDay: 1
        };

        vm.selectedPeople = {};
        vm.selectedZone = {};

        vm.minDate = new Date();
        vm.date = new Date();

      /**
       * Date picker filter
       */
        vm.disabled = function(date, mode){
            if(! vm.form.daysDisabled ) return;
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
         * Selects
         */
        vm.selectPeople = function(guest) {
            vm.availability.num_guests = guest.value;
            vm.selectedPeople = guest;
        };

        vm.selectZone  = function(zone) {
            vm.availability.zone_id = zone.option;
            vm.selectedZone = zone; 
        };

        vm.selectHour = function(hour, event) {
            vm.availability.hour = hour;
            vm.selectedHour = hour; 
            if (event === null || event === undefined) {
                if (hour.events.length) {
                    vm.selectedEvent = hour.events[0];
                } else {
                    vm.selectedEvent = {};
                }
            }
console.log(vm.selectedEvent);
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
             vm.availability.date = date;

             var find_people = findObject(vm.form.people, function(item) {
                return item.value == vm.selectedPeople.value;
             });

             if (find_people !== null) {
                vm.selectPeople(find_people);
             } else {
                if (vm.form.people.length) {
                    vm.selectPeople(vm.form.people[0]);
                }
             }

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

             vm.selectHour(vm.form.hours[0]);

             // vm.availability.hour = utiles.filterHour(vm.form.hours, vm.availability.hour);

             vm.infoDate = moment(date).format("dddd, D [de] MMMM");

             // vm.searchAvailability();
         };
         /**
          * END Format data
          */

        var InitModule = function(date) {
            vm.loadingInfo = true;
            vm.loadingData = true;
            vm.message = "Cargando ...";

            availabilityService.getFormatAvailability(date)
                .then(function(response) {
                    vm.form = response.data.data;
                    vm.date = new Date(vm.form.date.split("-"));
                    console.log(vm.form);
                    defaultData(vm.form.date);

                    vm.loadingData = false;
                }).catch(function() {
                    vm.result.length = 0;
                    vm.message = "Elija otra opcion de busqueda";
                }).finally(function() {
                    vm.loadingInfo = false;
                });
        };

        vm.$watch("date", function(newValue, oldValue){
            console.log("changeHour");
            if (! moment(newValue).isSame(oldValue) && ! moment(vm.form.date).isSame(newValue)) {
                var date = moment(vm.date).utc().format("YYYY-MM-DD");
                InitModule(date);
            }
        });



        (function() {
            // searchTemporalReserve()
            //     .then(function() {
                    InitModule();
                // })
                // .catch(function() {
                //     vm.showPrev = true;
                // });
        })();

    }]);