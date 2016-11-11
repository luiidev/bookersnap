angular.module('availability.controller', [])
    .controller('AvailabilityController', ['AvailabilityService', 'ReservationTemporalService', function(AvailabilityService, ReservationTemporalService) {
        var vm = this;
        vm.dateMin = moment().add(1, 'day').format('YYYY-MM-DD');
        vm.dateMax = moment().add(7, 'day').format('YYYY-MM-DD');
        vm.format = 'yyyy-MM-dd';

        vm.hours = [{
            option: "17:00:00"
        }, {
            option: "17:15:00"
        }, {
            option: "17:30:00"
        }];

        vm.zones = [{
            id: null,
            option: "All"
        }, {
            id: 1,
            option: "Zona 1"
        }, {
            id: 2,
            option: "Zona 2"
        }];

        vm.guests = [{
            id: 2,
            option: "2 Guest"
        }, {
            id: 3,
            option: "3 Guest"
        }, {
            id: 4,
            option: "4 Guest"
        }];

        vm.configuration = {
            zone: null,
            hour: "17:00:00",
            date: moment().format('YYYY-MM-DD'),
            num_guest: 2
        };

        vm.getAvailability = function(config) {
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
        };

        vm.openCalendar = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        };

    }]);