angular.module('availability.controller', [])
    .controller('AvailabilityController', ['AvailabilityService', 'ReservationTemporalService', '$scope', function(AvailabilityService, ReservationTemporalService, $scope) {
        var vm = this;

        //Variables
        vm.dateMin = moment().add(1, 'day').format('YYYY-MM-DD');
        vm.dateMax = moment().add(7, 'day').format('YYYY-MM-DD');
        vm.format = 'yyyy-MM-dd';
        // vm.hours = [{
        //     option: "17:00:00"
        // }, {
        //     option: "17:15:00"
        // }, {
        //     option: "17:30:00"
        // }];

        vm.configuration = {
            zone: null,
            date: moment().format('YYYY-MM-DD'),
            num_guest: 2,
        };

        //Funciones
        vm.getAvailability = getAvailability;
        vm.openCalendar = openCalendar;
        // vm.changeDate = changeDate;


        function getZones(config) {
            AvailabilityService.getZones(config).then(function success(response) {
                vm.zones = response;
            }, function success(response) {
                messageErrorApi(response.data, "Error", "warning");
            });
        }

        function getHours(config) {
            AvailabilityService.getHours(config).then(function success(response) {
                //Falta revizar next day
                vm.hours = response;
                vm.configuration.hour = vm.hours[0].option;
                vm.configuration.nextDay = vm.hours[0].next_day;
            }, function success(response) {
                messageErrorApi(response.data, "Error", "warning");
            });
        }

        function getEvents(config) {
            AvailabilityService.getEvents(config).then(function success(response) {
                //Falta revizar next day
                vm.events = response;
                console.log(vm.events);
            }, function success(response) {
                messageErrorApi(response.data, "Error", "warning");
            });
        }

        function getGuest() {
            AvailabilityService.getConfig().then(function success(response) {
                vm.guests = AvailabilityService.getGuest(response.max_people);
            }, function success(response) {
                messageErrorApi(response.data, "Error", "warning");
            });
        }

        function getAvailability(config) {
            config.date = moment(config.date).format('YYYY-MM-DD');
            vm.loadingSearch = true;
            AvailabilityService.getAvailability(config).then(function success(response) {
                vm.availabilities = response;
                console.log(vm.availabilities);
                vm.loadingSearch = false;
            }, function error(response) {
                messageErrorApi(response.data, "Error", "warning");
                vm.loadingSearch = false;
            });
        }

        $scope.$watch('vm.configuration.date', function(newValue, oldValue) {
            var newValueDate = moment(newValue).format('YYYY-MM-DD');
            var oldValueDate = moment(oldValue).format('YYYY-MM-DD');
            if (newValueDate !== oldValueDate) {
                vm.configuration.date = newValueDate;
                getZones(vm.configuration);
                getHours(vm.configuration);
                getEvents(vm.configuration);
            }
        });

        function openCalendar($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        }

        // function changeDate(date) {
        //     getZones(date);
        //     getHours(date, vm.configuration.zone);
        // }

        function init() {
            getZones(vm.configuration);
            getGuest();
            getHours(vm.configuration);
        }

        init();

    }]);