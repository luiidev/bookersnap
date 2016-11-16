angular.module('availability.controller', [])
    .controller('AvailabilityController', ['AvailabilityService', 'ReservationTemporalService', '$scope', function(AvailabilityService, ReservationTemporalService, $scope) {
        var vm = this;

        //Variables
        vm.dateMin = moment().format(vm.format);
        vm.date = new Date();
        vm.format = 'yyyy-MM-dd';

        vm.configuration = {
            date: moment(vm.Date).format('YYYY-MM-DD'),
            hour: null,
            num_guest: null,
            zone: null,
        };

        //Funciones
        vm.getAvailability = getAvailability;
        vm.openCalendar = openCalendar;
        vm.changeHour = changeHour;
        vm.reservationTemporal = reservationTemporal;
        vm.searchEventAvailability = searchEventAvailability;

        function getZones() {
            AvailabilityService.getZones(vm.configuration).then(function success(response) {
                vm.zones = response;
                vm.configuration.zone = vm.zones.length > 0 ? vm.zones[0].id : null;
            }, function success(response) {
                messageErrorApi(response.data, "Error", "warning");
            });
        }

        function getHours() {
            AvailabilityService.getHours(vm.configuration).then(function success(response) {
                vm.hours = response;
                vm.configuration.hour = vm.hours.length > 0 ? vm.hours[0] : null;
                getEvents();
            }, function success(response) {
                messageErrorApi(response.data, "Error", "warning");
            });
        }

        function getEvents() {
            vm.loadingSearchEvent = true;
            AvailabilityService.getEvents(vm.configuration).then(function success(response) {
                vm.events = response;
                console.log(vm.events);
                vm.loadingSearchEvent = false;
            }, function success(response) {
                messageErrorApi(response.data, "Error", "warning");
                vm.loadingSearchEvent = false;
            });
        }

        function getGuest() {
            AvailabilityService.getConfig().then(function success(response) {
                vm.guests = AvailabilityService.getGuest(response.max_people);
                vm.configuration.num_guest = vm.guests.length > 0 ? 1 : null;
            }, function success(response) {
                messageErrorApi(response.data, "Error", "warning");
            });
        }

        function getAvailability() {
            vm.loadingSearch = true;
            console.log(vm.configuration);
            AvailabilityService.getAvailability(vm.configuration).then(function success(response) {
                vm.availabilities = response;
                console.log(vm.availabilities);
                vm.loadingSearch = false;
            }, function error(response) {
                messageErrorApi(response.data, "Error", "warning");
                vm.loadingSearch = false;
            });
        }


        function openCalendar($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        }

        function changeHour(hour) {
            getEvents();
        }

        function reservationTemporal(hour) {
            console.log(hour);
        }

        function searchEventAvailability(event) {
            console.log(event, vm.configuration);
        }

        $scope.$watch('vm.date', function(newValue, oldValue) {
            if (!moment(newValue).isSame(oldValue)) {
                vm.configuration.date = moment(newValue).format('YYYY-MM-DD');
                getHours();
                getZones();
            }
        });

        (function init() {
            getZones();
            getGuest();
            getHours();
        })();

    }]);