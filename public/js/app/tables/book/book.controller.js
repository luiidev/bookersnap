angular.module('book.controller', [])

.controller('BookCtrl', function($uibModal, $scope, orderByFilter, BookFactory, CalendarService, reservationService, BookDataFactory, $state) {

        var fecha_actual = moment().format('YYYY-MM-DD');
        var vm = this;

        vm.fecha_actual = fecha_actual;

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
            date: ''
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
            console.log("filterBook " + angular.toJson(value, true));
            switch (option) {
                case 'turn':
                    BookFactory.addTurnsByFilter(value, vm.bookFilter.typeTurn, vm.turns);
                    break;
                case 'source':
                    BookFactory.addSourcesByFilter(value, vm.bookFilter.sources, vm.sources);
                    break;
                case 'zones':
                    BookFactory.addZonesByFilter(value, vm.bookFilter.zones, vm.zones);
                    break;
            }
        };

        vm.orderBook = function(value) {

            var reservations = BookFactory.filterReservationsAndBlocks(vm.listBook);

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

        vm.changeViewReservation = function() {
            console.log("changeViewReservation");
        };

        vm.openCalendar = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.calendar = true;
        };

        $scope.$watch('vm.bookFilter.date', function(newDate, oldDate) {
            if (newDate !== oldDate) {
                newDate = convertFechaYYMMDD(newDate, "es-ES", {});
                listZones(newDate, true);
                listTurnAvailable(newDate);
            }
        });

        $scope.$watch('vm.listBook', function(newBook, oldBook) {
            if (newBook !== oldBook) {
                console.log("se ejecuto un filtro");
            }

        });

        $scope.$on('resumenBookUpdate', function(evt, data) {
            vm.resumenBook = data;
            // console.log("resumenBookUpdateo", angular.toJson(data, true));
        });

        var init = function() {
            BookFactory.init($scope);
            listTurnAvailable(fecha_actual);
            listSources();
            listZones(fecha_actual, false);
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

        vm.editReservation = function(item) {
            $state.go('mesas.reservation-edit', {
                id: item.reservation.id,
                date: item.reservation.date_reservation
            });
        };

        vm.createReservation = function(data) {
            console.log(data);
            var modalInstance = $uibModal.open({
                templateUrl: 'ModalCreateBookReservation.html',
                controller: 'ModalBookReservationCtrl',
                controllerAs: 'br',
                size: '',
                resolve: {
                    data: function() {
                        return data;
                    },
                    date: function() {
                        return vm.bookFilter.date;
                    }
                }
            });
        };

        init();

    })
    .controller("ModalBookReservationCtrl", function($rootScope, $state, $uibModalInstance, $q, reservationService, $timeout, data, date, FloorFactory, global) {

        var vm = this;
        var auxiliar;

        vm.reservation = {};
        vm.addGuest = true;
        vm.buttonText = 'Agregar a lista de espera';
        vm.title = "Nueva entrada";
        vm.covers = [];

        var listGuest = function() {
            var deferred = $q.defer();
            reservationService.getGuest()
                .then(function(guests) {
                    vm.covers = guests;
                    vm.reservation.covers = 2;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        //Search guest list
        vm.searchGuest = function(name) {
            // console.log(name);
            if (auxiliar) $timeout.cancel(auxiliar);
            if (name === "") {
                vm.guestList = [];
                return;
            }
            var search = function() {
                reservationService.getGuestList(name)
                    .then(function(response) {
                        vm.guestList = response.data.data.data;
                    }).catch(function(error) {
                        message.apiError(error);
                    });
            };

            auxiliar = $timeout(search, 500);
        };

        vm.selectGuest = function(guest) {
            vm.reservation.guest_id = guest.id;
            vm.guest = guest;
            vm.addGuest = false;
        };

        vm.removeGuest = function() {
            vm.reservation.guest_id = null;
            vm.newGuest = null;
            vm.guestList = [];
            vm.addGuest = true;
        };
        //End Search

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        vm.save = function() {
            if (!vm.reservation.guest_id) {
                if (vm.newGuest) {
                    delete vm.reservation.guest_id;
                    vm.reservation.guest = vm.newGuest;
                }
            } else {
                delete vm.reservation.guest;
            }

            vm.reservation.guest = vm.newGuest;
            vm.buttonText = 'Enviando ...';

            save();
        };

        var save = function() {
            reservationService.blackList.key(vm.reservation);
            reservationService.createWaitList(vm.reservation).then(
                function success(response) {
                    global.reservations.add(response.data.data);
                    vm.buttonText = 'Agregar a lista de espera';
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                },
                function error(response) {
                    vm.buttonText = 'Agregar a lista de espera';
                    message.apiError(response.data);
                });
        };

        var update = function() {
            reservationService.blackList.key(vm.reservation);
            reservationService.updateWaitList(vm.reservation).then(
                function success(response) {
                    global.reservations.update(response.data.data);
                    vm.buttonText = 'Agregar a lista de espera';
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                },
                function error(response) {
                    vm.buttonText = 'Agregar a lista de espera';
                    message.apiError(response.data);
                });
        };

        vm.delete = function() {
            var key = reservationService.blackList.key();
            reservationService.deleteWaitList(data.id, {
                key: key
            }).then(
                function success(response) {
                    global.reservations.update(response.data.data);
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                },
                function error(response) {
                    message.apiError(response.data);
                });
        };

        var listResource = function() {
            return $q.all([listGuest()]);
        };

        var parseInfo = function() {
            date = date || moment().format("YYYY-MM-DD");
            vm.info = {
                date: moment(date).format("dddd, MM/DD"),
                time: data.time_text,
                tables: "12"
            };
            console.log(vm.info);
        };

        var init = function() {
            listResource();
            parseInfo();
        };

        init();
    });