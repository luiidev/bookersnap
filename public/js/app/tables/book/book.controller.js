angular.module('book.controller', [])

.controller('BookCtrl', function($uibModal, $scope, orderByFilter, BookFactory, CalendarService, reservationService, BookDataFactory) {
    var vm = this;

    vm.turns = [];
    vm.hoursTurns = []; //Lista de horas segun los turnos
    vm.listBook = []; //Listado del book para los filtros
    vm.listBookMaster = []; //Listado del book original (no se afecta con los filtros)
    vm.sources = [];
    vm.zones = [];

    vm.bookFilter = {
        typeTurn: [],
        sources: []
    };

    //Ordernar book general
    vm.bookOrderBy = {
        general: {
            value: 'time',
            reverse: false
        },
        resBlock: {
            value: '',
            reverse: false,
            status: '+reservation.res_reservation_status_id',
            covers: '+reservation.num_guest',
            guest: '-reservation.guest_filter',
            table: '-reservation.table_filter',
            date: '-reservation.start_date'
        }

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

    vm.orderBook = function(value) {

        var reservations = BookFactory.filterReservationsAndBlocks(vm.listBookMaster);

        switch (value) {
            case 'time':
                vm.bookOrderBy.general.reverse = (vm.bookOrderBy.general.value == value) ? !vm.bookOrderBy.general.reverse : false;
                vm.bookOrderBy.general.value = 'time';
                vm.listBook = orderByFilter(vm.listBookMaster, 'time', vm.bookOrderBy.general.reverse);
                break;
            case 'status':
                vm.bookOrderBy.resBlock.value = 'status';

                var filterStatus = orderByFilter(reservations.reservations, [vm.bookOrderBy.resBlock.status]);
                vm.listBook = filterStatus.concat(reservations.availables);
                vm.bookOrderBy.resBlock.status = (vm.bookOrderBy.resBlock.status === "+reservation.res_reservation_status_id") ? "-reservation.res_reservation_status_id" : "+reservation.res_reservation_status_id";

                break;
            case 'covers':
                vm.bookOrderBy.resBlock.value = "covers";

                var filterCovers = orderByFilter(reservations.reservations, [vm.bookOrderBy.resBlock.covers]);
                vm.listBook = filterCovers.concat(reservations.availables);
                vm.bookOrderBy.resBlock.covers = (vm.bookOrderBy.resBlock.covers === "+reservation.num_guest") ? "-reservation.num_guest" : "+reservation.num_guest";

                break;
            case 'guest':
                vm.bookOrderBy.resBlock.value = "guest";

                var filterGuest = orderByFilter(reservations.reservations, [vm.bookOrderBy.resBlock.guest]);
                vm.listBook = filterGuest.concat(reservations.availables);
                vm.bookOrderBy.resBlock.guest = (vm.bookOrderBy.resBlock.guest === "-reservation.guest_filter") ? "+reservation.guest_filter" : "-reservation.guest_filter";

                break;
            case 'table':
                vm.bookOrderBy.resBlock.value = "table";

                var filterTable = orderByFilter(reservations.reservations, [vm.bookOrderBy.resBlock.table]);
                vm.listBook = filterTable.concat(reservations.availables);
                vm.bookOrderBy.resBlock.table = (vm.bookOrderBy.resBlock.table === "-reservation.table_filter") ? "+reservation.table_filter" : "-reservation.table_filter";

                break;
            case 'date':
                vm.bookOrderBy.resBlock.value = "date";

                var filterDate = orderByFilter(reservations.reservations, [vm.bookOrderBy.resBlock.date]);
                vm.listBook = filterDate.concat(reservations.availables);
                vm.bookOrderBy.resBlock.date = (vm.bookOrderBy.resBlock.date === "-reservation.hours_reservation") ? "+reservation.hours_reservation" : "-reservation.hours_reservation";

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
                var listBook = BookFactory.listBook(vm.hoursTurns, response[0], response[1]);
                vm.listBook = listBook;
                vm.listBookMaster = listBook;
                console.log("generatedListBook " + angular.toJson(vm.listBook, true));
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