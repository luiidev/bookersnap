angular.module('book.controller', [])

.controller('BookCtrl', function($uibModal, $scope, BookFactory, CalendarService, reservationService, BookDataFactory) {
    var vm = this;

    vm.turns = [];
    vm.hoursTurns = []; //Lista de horas segun los turnos
    vm.listBook = []; //Listado del book 
    vm.sources = [];
    vm.zones = [];

    vm.bookFilter = {
        typeTurn: [],
        sources: []
    };

    var fecha_actual = moment().format('YYYY-MM-DD');

    vm.filterBook = function(option, value) {
        switch (option) {
            case 'turn':
                BookFactory.addTurnsByFilter(value, vm.bookFilter.typeTurn, vm.turns);
                break;
            case 'source':
                BookFactory.addSourcesByFilter(value, vm.bookFilter.sources, vm.sources);
                break;
        }
    };

    var init = function() {
        listTurnAvailable();
        listSources();
        listZones();
    };

    var listTurnAvailable = function() {
        BookDataFactory.getTypeTurns(fecha_actual).then(
            function success(response) {
                response = response.data.data;
                vm.turns = response;

                listHoursTurns(vm.turns);
            },
            function error(response) {
                console.error("listTypeTurns " + angular.toJson(response, true));
            });
    };

    var listHoursTurns = function(turns) {
        reservationService.getHours(turns).then(
            function success(response) {
                vm.hoursTurns = response.hours;
                generatedListBook(fecha_actual);
            },
            function error(response) {
                console.error("getHours " + angular.toJson(response, true));
            }
        );
    };

    var generatedListBook = function(date) {
        var params = getAsUriParameters({
            date: date
        });

        BookFactory.listReservationAndBlocks(true, params).then(
            function success(response) {
                vm.listBook = BookFactory.listBook(vm.hoursTurns, response[0], response[1]);
            },
            function error(response) {
                console.error("listReservationAndBlocks " + angular.toJson(response, true));
            }
        );
    };

    var listSources = function() {
        BookDataFactory.getSources(false).then(
            function success(response) {
                response = response.data.data;
                vm.sources = response;
            },
            function error(response) {
                console.error("listSources " + angular.toJson(response, true));
            });
    };

    var listZones = function() {
        var params = {
            date_ini: fecha_actual,
            date_end: getAsUriParameters({}),
            reload: false
        };

        BookDataFactory.getZones(params).then(
            function success(response) {
                response = response.data.data;
                vm.zones = response;
            },
            function error(response) {
                console.error("listZones " + angular.toJson(response, true));
            });
    };

    init();

});