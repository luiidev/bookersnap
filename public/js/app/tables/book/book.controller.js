angular.module('book.controller', [])

.controller('BookCtrl', function($uibModal, $scope, $stateParams, $location, orderByFilter, BookFactory, CalendarService, reservationService, BookDataFactory) {

    var fecha_actual = moment().format('YYYY-MM-DD');
    var vm = this;

    vm.turns = [];
    vm.hoursTurns = []; //Lista de horas segun los turnos
    vm.listBook = []; //Listado del book para los filtros
    vm.listBookMaster = []; //Listado del book original (no se afecta con los filtros)
    vm.sources = [];
    vm.zones = [];

    vm.bookFilter = {
        typeTurn: [],
        sources: [],
        zones: [],
        date: '',
        options: {
            turnAll: false,
            sourcesAll: false,
            zonesAll: false
        }
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
    //Book View (Reservaciones)
    vm.bookView = false;

    vm.resumenBook = {
        reservations: 0,
        pax: 0,
        ingresos: 0,
        conversion: 0
    };

    vm.filterBook = function(option, value) {
        switch (option) {
            case 'turn':
                vm.bookFilter.options.turnAll = (value == "all") ? !vm.bookFilter.options.turnAll : vm.bookFilter.options.turnAll;
                BookFactory.addTurnsByFilter(value, vm.bookFilter.typeTurn, vm.turns, vm.bookFilter.options.turnAll);
                break;
            case 'source':
                vm.bookFilter.options.sourcesAll = (value == "all") ? !vm.bookFilter.options.sourcesAll : vm.bookFilter.options.sourcesAll;
                BookFactory.addSourcesByFilter(value, vm.bookFilter.sources, vm.sources, vm.bookFilter.options.sourcesAll);
                break;
            case 'zones':
                vm.bookFilter.options.zonesAll = (value == "all") ? !vm.bookFilter.options.zonesAll : vm.bookFilter.options.zonesAll;
                BookFactory.addZonesByFilter(value, vm.bookFilter.zones, vm.zones, vm.bookFilter.options.zonesAll);
                break;
            case 'reservations':
                vm.orderBook(value);
                break;
            default:
                vm.orderBook('time');
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
            case 'reservations':
                var filterRes = orderByFilter(reservations.reservations, [vm.bookOrderBy.resBlock.date]);
                vm.listBook = filterRes;
                vm.bookOrderBy.resBlock.date = (vm.bookOrderBy.resBlock.date === "-reservation.hours_reservation") ? "+reservation.hours_reservation" : "-reservation.hours_reservation";

                break;
        }
    };

    vm.openCalendar = function($event, opened) {
        $event.preventDefault();
        $event.stopPropagation();
        vm.calendar = true;
    };

    vm.changeBookView = function() {
        if (vm.bookView === true) {
            vm.filterBook('reservations', 'reservations');
        } else {
            vm.bookOrderBy.general.reverse = true;
            vm.filterBook('time', 'time');
        }
    };

    vm.numGuestChange = function(type, option, value) {
        console.log("numGuestChange " + angular.toJson(value, true));
        switch (option) {
            case 'men':
                value.reservation.num_people_1 = (type == "-") ? value.reservation.num_people_1 - 1 : value.reservation.num_people_1 + 1;
                value.reservation.num_people_1 = (value.reservation.num_people_1 <= 0) ? 0 : value.reservation.num_people_1;
                break;
            case 'women':
                value.reservation.num_people_2 = (type == "-") ? value.reservation.num_people_2 - 1 : value.reservation.num_people_2 + 1;
                value.reservation.num_people_2 = (value.reservation.num_people_2 <= 0) ? 0 : value.reservation.num_people_2;
                break;
            case 'child':
                value.reservation.num_people_3 = (type == "-") ? value.reservation.num_people_3 - 1 : value.reservation.num_people_3 + 1;
                value.reservation.num_people_3 = (value.reservation.num_people_3 <= 0) ? 0 : value.reservation.num_people_3;
                break;
        }

        vm.resumenBook = BookFactory.getResumenBook(vm.listBook);
    };

    $scope.$watch('vm.bookFilter.date', function(newDate, oldDate) {
        if (newDate !== oldDate) {
            newDate = convertFechaYYMMDD(newDate, "es-ES", {});
            listZones(newDate, true);
            listTurnAvailable(newDate);

            updateUrl(newDate);
        }
    });

    $scope.$watch('vm.listBook', function(newBook, oldBook) {
        if (newBook !== oldBook) {
            console.log("se ejecuto un filtro");
        }
    });

    $scope.$on('resumenBookUpdate', function(evt, data) {
        vm.resumenBook = data;
    });

    var init = function() {
        fecha_actual = ($stateParams.date === undefined || $stateParams.date === "") ? fecha_actual : $stateParams.date;
        updateUrl(fecha_actual);

        BookFactory.init($scope);
        listTurnAvailable(fecha_actual);
        listSources();
        listZones(fecha_actual, false);
    };

    var updateUrl = function(date) {
        vm.bookFilter.date = convertFechaToDate(date);
        $location.url("/mesas/book/" + date);
    };

    var listTurnAvailable = function(date) {
        BookDataFactory.getTypeTurns(date).then(
            function success(response) {
                response = response.data.data;
                vm.turns = response;

                listHoursTurns(vm.turns, date);
            },
            function error(response) {
                console.error("listTypeTurns " + angular.toJson(response, true));
            });
    };

    var listHoursTurns = function(turns, date) {
        reservationService.getHours(turns).then(
            function success(response) {
                vm.hoursTurns = response.hours;
                generatedListBook(date);
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

                //vm.resumenBook = BookFactory.getResumenBook(listBook);
                console.log("generatedListBook " + angular.toJson(vm.resumenBook, true));
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

    var listZones = function(date, reload) {
        var params = {
            date_ini: date,
            date_end: getAsUriParameters({}),
            reload: reload
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