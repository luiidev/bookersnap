angular.module('book.controller', [])
    .controller('BookCtrl', function($uibModal, $scope, $stateParams, $location, $timeout, orderByFilter, BookFactory,
        CalendarService, reservationService, BookDataFactory, $state, ConfigurationDataService, BookConfigFactory, FloorFactory) {

        var vm = this;
        vm.fecha_actual = moment().format('YYYY-MM-DD');
        vm.btnRageCalendar = false;

        /**
         * Manejo de rango de fechas
         */

        /**
         * Fecha de inicio (hoy), se aplica UTC,
         * datepicker covierte la zona horaria a utc y agrega/remueve horas
         * @type {[Date | String]}
         */
        var dp_date = moment().utc().toDate();

        vm.startDate = dp_date;
        vm.endDate = dp_date;
        // vm.maxDate = dp_date;

        /**
         * Limpia el casillero de informacion de rango de fechas
         * @return {[Void]}
         */
        vm.clearDateInfo = function() {
            vm.date_info = null;
        };

        /**
         * Rango de fechas restando hacia atras
         * @param  {Integer} start [numero de dias]
         * @param  {Integer} end   [numero de dias]
         * @param  {$event | DOM} event [manipular las clases]
         * @return  void
         */
        vm.changeDateCustom = function(start, end, event, init) {
            vm.startDate = moment().add(end, "days").utc().toDate();
            vm.endDate = moment().add(start, "days").utc().toDate();

            setConfigUserDate(end);

            if (init === true) {
                initDateEvent(event.currentTarget);
            } else {
                fireDateEvent();
            }
        };

        /**
         * Rango de fechas por bloque, esta semana | mes
         * @param  {String} block [semana | mes]
         * @param  {$event | DOM} event [manipular clases]
         * @return  void
         */
        vm.changeDateBlock = function(block, event, init) {
            vm.startDate = moment().startOf(block).utc().toDate();
            vm.endDate = moment().endOf(block).utc().toDate();

            setConfigUserDate(block);

            if (init === true) {
                initDateEvent(event.currentTarget);
            } else {
                fireDateEvent();
            }
        };

        /**
         * Rango de fechas del mes pasado
         * @param  {$event | DOM} event [manipular clases]
         * @return void
         */
        vm.changeDateLastMonth = function(event, init) {
            var date = moment().startOf('month').subtract(1, "days");
            vm.startDate = date.startOf('month').utc().toDate();
            vm.endDate = date.endOf('month').utc().toDate();

            setConfigUserDate('last-month');

            if (init === true) {
                initDateEvent(event.currentTarget);
            } else {
                fireDateEvent();
            }
        };

        /**
         * Mostrar calendario de rango de fechas
         * @param  {$event | DOM} event [manipular clases]
         * @return void
         */
        vm.showDateRange = function(event) {
            setConfigUserDate('range');
            initDateEvent(event.currentTarget, true);
            vm.btnRageCalendar = true;
        };

        /**
         * Manipulacion de clases y dom
         * @type {DOM} element [manipulacion de clases]
         * @type {Boolean} dp_range [mostrar o esconder calendario]
         */
        var checkElem = angular.element('<i class="zmdi zmdi-check zmdi-hc-fw pull-right"></i>');
        var selectDpMenu = function(element) {
            var list = document.querySelectorAll(".list-group .list-group-item");
            angular.element(list).removeClass("active");
            angular.forEach(list, function(item) {
                var check = item.querySelector(".zmdi");
                angular.element(check).remove();
            });
            var current = angular.element(element).addClass("active").append(checkElem);
        };

        var initDateEvent = function(element, dp_range) {
            selectDpMenu(element);
            if (!dp_range) hideRangeCalendar();
            vm.dp_range = !dp_range ? false : true;
            fireDateEvent();
        };

        /**
         * Cambio de fecha de fin por accion del usuario | click en calendario
         * @return void
         */
        vm.changeDateEnd = function(userClick) {
            if (userClick) {
                hideRangeCalendar();
                fireDateEvent();
            }
        };

        var hideRangeCalendar = function() {
            angular.element(document.querySelector("[bs-toggle-click]")).click();
        };

        var fireDateEvent = function() {

            var date_start = convertFechaYYMMDD(vm.startDate, "es-ES", {});
            var date_end = convertFechaYYMMDD(vm.endDate, "es-ES", {});

            updateUrl(date_start, date_end, false);
        };

        /**
         * End
         */

        /**
         *  Data para validacion de alerta para conteo de lista de invitados
         */
        var guest_list_count = function(reservations) {
            reservations.reduce(function(data, item, i) {
                if (!item.reservation) return data;
                Object.assign(item.reservation, {
                    men: 0,
                    women: 0,
                    children: 0
                });
                item.reservation.guest_list.reduce(function(reservation, item) {
                    if (item.type_person === 1) {
                        reservation.men++;
                    } else if (item.type_person === 2) {
                        reservation.women++;
                    } else if (item.type_person === 3) {
                        reservation.children++;
                    }
                    return reservation;
                }, item.reservation);
            }, this);
        };
        /**
         * END
         */

        vm.turns = [];
        vm.hoursTurns = []; //Lista de horas segun los turnos
        vm.listBook = []; //Listado del book para los filtros
        vm.listBookReserva = []; //Listado del book,solo reservaciones
        vm.listBookMaster = []; //Listado del book original (no se afecta con los filtros)
        vm.sources = [];
        vm.zones = [];
        vm.statusReservation = []; //Listado de status para reservaciones       

        vm.bookFilter = {
            typeTurn: [],
            sources: [],
            zones: [],
            noStatus: [],
            blocks: true,
            date: '',
            options: {
                turnAll: false,
                sourcesAll: false,
                zonesAll: false,
                noStatusFree: true,
                noStatusCancel: true,
                blocks: true,
            },
            text: '',
            search_text: '',
            numGuest: {
                data: [],
                selected: 0,
                textMore: '+',
            },
            params_url: null
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
            },
            reservation: {
                time: 'time.desc',
                status: 'status.desc',
                covers: 'covers.desc',
                guest: 'guest.desc',
                table: 'table.desc'
            }
        };

        //vm.hideFields = {};

        //Book View (Reservaciones)
        vm.bookView = false;

        //Cabecera del book
        vm.resumenBook = {
            reservations: 0,
            pax: 0,
            ingresos: 0,
            conversion: 0
        };

        //MDS
        vm.mds = '';

        //Configuracion de reservaciones - modulo config
        vm.configReservation = null;

        //Data default localStorage configuracion del usuario 
        vm.configUserDefault = {
            reservationView: false,
            rangeDate: {
                hoy: false,
                week: false, //esta semana
                lastSevenDays: false, //ultimos 7 dias
                lastThirtyDays: false, //ultimos 30 dias
                thisMonth: false, //este mes
                lastMonth: false, //mes pasado
                range: false //rango de fechas
            },
            url: null,
            filters: {
                turns: [],
                status: [],
                sources: [],
                zones: [],
            },
            order: 'time.asc',
            page_size: 30,
            page: 1,
            fields: {
                consume: true,
                messages: true,
                listguests: true,
                source: true
            }
        };

        //Fechas formato string (2016-11-24) , para los filtros
        vm.datesText = {
            start_date: '',
            end_date: ''
        };

        //Notas turnos
        vm.notesBox = false;
        vm.notesBoxValida = false;

        vm.notesData = {
            texto: '',
            res_type_turn_id: ''
        };

        vm.notesSave = false; // se activa cuando creamos notas

        var validaNumGuestClick = false;
        var validaUpdateBookRes;
        var timeoutNotes;

        //para la paginacion de reservaciones
        vm.paginate_reservation = {
            page: 1,
            total_pages: 0,
            page_size: 10,
            selected: 1,
            max_size: 5,
            options: []
        };

        /*Filtros de ajustes en footer */
        vm.filterAjustes = function(option) {
            switch (option) {
                case 'show.released':
                    vm.filterBook('released', {
                        "id": 5
                    });
                    break;
                case 'show.canceled':
                    vm.filterBook('canceled', {
                        "id": 6
                    });
                    break;
                case 'show.blocks':
                    vm.filterBook('blocks', null);
                    break;
                case 'fields.consume':
                    vm.changeShowFieldsReservations('consume');
                    break;
                case 'fields.messages':
                    vm.changeShowFieldsReservations('messages');
                    break;
                case 'fields.listguests':
                    vm.changeShowFieldsReservations('listguests');
                    break;
                case 'fields.source':
                    vm.changeShowFieldsReservations('source');
                    break;
            }
        };

        vm.showFieldReservation = function(option) {
            var result = true;
            switch (option) {
                case 'consume':
                    result = vm.configUserDefault.fields.consume;
                    break;
                case 'messages':
                    result = vm.configUserDefault.fields.messages;
                    break;
                case 'listguests':
                    result = vm.configUserDefault.fields.listguests;
                    break;
                case 'source':
                    result = vm.configUserDefault.fields.source;
                    break;
                default:
            }
            return result;
        };

        /* Cambio de estados para Ocultar campos de reservacion */
        vm.changeShowFieldsReservations = function(option) {
            switch (option) {
                case 'consume':
                    vm.configUserDefault.fields.consume = !vm.configUserDefault.fields.consume;
                    break;
                case 'messages':
                    vm.configUserDefault.fields.messages = !vm.configUserDefault.fields.messages;
                    break;
                case 'listguests':
                    vm.configUserDefault.fields.listguests = !vm.configUserDefault.fields.listguests;
                    break;
                case 'source':
                    vm.configUserDefault.fields.source = !vm.configUserDefault.fields.source;
                    break;
            }
            BookConfigFactory.save();
        };

        /* Modificar opciones de filtro de Book reservations */
        vm.filterBook = function(option, value) {

            switch (option) {

                case 'released':
                    vm.configUserDefault.show.released = !vm.configUserDefault.show.released;
                    BookFactory.addNoStatusByFilter(value, vm.bookFilter.noStatus, vm.status, vm.configUserDefault.show.released);
                    vm.configUserDefault.filters.status = vm.bookFilter.noStatus;
                    break;
                case 'canceled':
                    vm.configUserDefault.show.canceled = !vm.configUserDefault.show.canceled;
                    BookFactory.addNoStatusByFilter(value, vm.bookFilter.noStatus, vm.status, vm.configUserDefault.show.canceled);
                    vm.configUserDefault.filters.status = vm.bookFilter.noStatus;
                    break;
                case 'blocks':
                    vm.configUserDefault.show.blocks = !vm.configUserDefault.show.blocks;
                    vm.bookFilter.blocks = vm.configUserDefault.show.blocks;
                    break;
                case 'turn':
                    if (value !== "all") {
                        if (value.turn === null) {
                            return;
                        }
                    }
                    vm.bookFilter.options.turnAll = (value == "all") ? !vm.bookFilter.options.turnAll : vm.bookFilter.options.turnAll;
                    BookFactory.addTurnsByFilter(value, vm.bookFilter.typeTurn, vm.turns, vm.bookFilter.options.turnAll);
                    vm.configUserDefault.filters.turns = vm.bookFilter.typeTurn;
                    break;
                case 'source':
                    vm.bookFilter.options.sourcesAll = (value == "all") ? !vm.bookFilter.options.sourcesAll : vm.bookFilter.options.sourcesAll;
                    BookFactory.addSourcesByFilter(value, vm.bookFilter.sources, vm.sources, vm.bookFilter.options.sourcesAll);
                    vm.configUserDefault.filters.sources = vm.bookFilter.sources;
                    break;
                case 'zones':
                    vm.bookFilter.options.zonesAll = (value == "all") ? !vm.bookFilter.options.zonesAll : vm.bookFilter.options.zonesAll;
                    BookFactory.addZonesByFilter(value, vm.bookFilter.zones, vm.zones, vm.bookFilter.options.zonesAll);
                    vm.configUserDefault.filters.zones = vm.bookFilter.zones;
                    break;
                case 'reservations':
                    vm.orderBook(value);
                    break;
                default:
                    vm.orderBook('time');
                    break;
            }

            BookConfigFactory.save();

            if (option !== "reservations" && option !== "time") {
                vm.searchReservations();
            }
        };

        vm.orderBook = function(value) {

            if (value === vm.bookOrderBy.resBlock.value && vm.bookView === true) {
                return;
            }

            if (vm.bookView === true && value !== "reservations") {
                setOrderBookReservation(value, true);
                return;
            }

            var reservations = BookFactory.filterReservationsAndBlocks(vm.listBook, vm.bookView);
            var pos = value.indexOf(".");
            value = value.substring(0, pos);
            switch (value) {
                case 'time':
                    vm.bookOrderBy.general.reverse = (vm.bookOrderBy.general.value == value) ? !vm.bookOrderBy.general.reverse : false;
                    vm.bookOrderBy.general.value = 'time';
                    vm.listBook = orderByFilter(vm.listBook, 'time', vm.bookOrderBy.general.reverse);
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
                    // vm.bookOrderBy.resBlock.date = (vm.bookOrderBy.resBlock.date === "-reservation.hours_reservation") ? "+reservation.hours_reservation" : "-reservation.hours_reservation";

                    break;
            }
        };

        vm.openCalendar = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.calendar = true;
        };

        //Habilita modo reserva
        vm.changeBookView = function(reloadUrl) {
            var date_ini = $stateParams.date;

            if (vm.bookView === false) {
                vm.bookOrderBy.general.reverse = true;
                vm.filterBook('time', 'time');
                date_ini = vm.fecha_actual;
            }

            vm.configUserDefault.reservationView = vm.bookView;
            BookConfigFactory.save();
            if (reloadUrl === true) {
                updateUrl(date_ini, $stateParams.date_end, false);
            }
        };

        //Actualiza la reservacion cuando clickeamos
        vm.numGuestChange = function(type, option, value) {

            vm.blockClickBook();
            if (validaUpdateBookRes) $timeout.cancel(validaUpdateBookRes);

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

            vm.resumenBook.ingresos = (type == "-") ? vm.resumenBook.ingresos - 1 : vm.resumenBook.ingresos + 1;

            validaUpdateBookRes = $timeout(function() {
                var resUpdate = {
                    id: value.reservation.id,
                    num_people_1: value.reservation.num_people_1,
                    num_people_2: value.reservation.num_people_2,
                    num_people_3: value.reservation.num_people_3
                };
                updateReservationBook(resUpdate);
            }, 1000);
        };

        vm.blockClickBook = function() {
            validaNumGuestClick = true;
            $timeout(function() {
                validaNumGuestClick = false;
            }, 500);
        };

        vm.updateStatusReservation = function(reservation, status) {
            vm.blockClickBook();

            var resUpdate = {
                id: reservation.id,
                res_reservation_status_id: status
            };

            updateReservationBook(resUpdate);
        };

        vm.updateConsumeReservation = function(reservation) {
            vm.blockClickBook();

            if (validaUpdateBookRes) $timeout.cancel(validaUpdateBookRes);

            validaUpdateBookRes = $timeout(function() {
                var resUpdate = {
                    id: reservation.id,
                    consume: reservation.consume,
                };
                updateReservationBook(resUpdate);
            }, 1000);
        };

        vm.saveNotes = function(turn) {

            if (timeoutNotes) $timeout.cancel(timeoutNotes);

            vm.notesData.id = turn.notes.id;
            vm.notesData.res_type_turn_id = turn.id;
            vm.notesData.texto = turn.notes.texto;
            vm.notesData.date_add = turn.notes.date_add;

            timeoutNotes = $timeout(function() {
                reservationService.blackList.key(vm.notesData);

                FloorFactory.createNotes(vm.notesData).then(
                    function success(response) {
                        vm.notesSave = true;
                    },
                    function error(response) {
                        message.apiError(response);
                        console.error("saveNotes " + angular.toJson(response, true));
                    }
                );
            }, 1000);
        };

        vm.readNotes = function(notification) {
            vm.notesBoxValida = true;
            vm.notesNotification = false;
        };

        vm.listenNotes = function(notification) {
            vm.notesBoxValida = false;
            vm.notesNotification = false;
        };

        vm.editReservation = function(item) {
            if (validaNumGuestClick === true) {
                return;
            }
            $state.go('mesas.book-reservation-edit', {
                id: item.reservation.id,
                date: item.reservation.date_reservation
            });
        };

        vm.createReservation = function(data) {
            if (data.block === null) {
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
            } else {
                $state.go('mesas.floor.blockEdit', {
                    date: data.block.start_date,
                    block_id: data.block.id
                });
            }
        };

        vm.checkGuestList = function(reservation) {
            vm.blockClickBook();

            var modalInstance = $uibModal.open({
                templateUrl: 'ModalCheckGuestList.html',
                controller: 'ModalCheckGuestListBookCtrl',
                controllerAs: 'gl',
                size: 'md',
                resolve: {
                    reservation: function() {
                        return reservation;
                    },
                    configuration: function() {
                        return vm.configReservation;
                    }
                }
            });
        };

        vm.mailReservartion = function(reservation) {
            vm.blockClickBook();
            var modalInstance = $uibModal.open({
                templateUrl: 'ModalMailReservation.html',
                controller: 'ModalMailReservationCtrl',
                controllerAs: 'vm',
                size: '',
                resolve: {
                    reservation: function() {
                        return reservation;
                    }
                }
            });
        };

        vm.changeResultPagination = function() {
            vm.paginate_reservation.page_size = vm.paginate_reservation.selectedPageSize.id;
            vm.configUserDefault.page_size = vm.paginate_reservation.page_size;
            vm.changePagination();
        };

        vm.changePagination = function() {
            vm.paginate_reservation.page = vm.paginate_reservation.selected;
            vm.configUserDefault.page = vm.paginate_reservation.page;
            setDatesText(vm.startDate, vm.endDate);
            var params_url = paramsFilterReservation(true);
            pushParamsUrl(params_url);
            setUrlNavigationConfig(null);
            BookConfigFactory.save();
            generatedListBookPagination(vm.datesText.start_date, vm.datesText.end_date);
        };

        vm.searchReservations = function() {
            if (vm.bookView === true) {
                vm.changePagination();
            } else {
                setUrlNavigationConfig(null);
            }
        };

        $scope.$on("NotifyBookConfigReload", function(evt, message) {
            alert(message + " Se requiere volver a cargar la página.");
            location.reload();
        });

        $scope.$on("NotifyNewReservation", function(evt, data) {

            var response = addNewReservation(data.data, data.action);
            // if (response === true) {
            //     if (!reservationService.blackList.contains(data.key)) {
            //         // alertMultiple("Notificación", data.user_msg, "info", null);
            //         // generatedHeaderInfoBook(vm.datesText.start_date, vm.datesText.end_date);
            //     }
            // }
        });

        $scope.$watch('vm.bookFilter.date', function(newDate, oldDate) {
            if (newDate !== oldDate) {
                newDate = convertFechaYYMMDD(newDate, "es-ES", {});
                updateUrl(newDate, $stateParams.date_end, true);
            }
        });

        $scope.$watch("vm.listBook", guest_list_count, true, vm.listBook.reservation);

        $scope.$on('resumenBookUpdate', function(evt, data) {
            vm.resumenBook = data;
        });

        $scope.$on("floorNotesReload", function(evt, note) {
            if (!reservationService.blackList.contains(note.key)) {
                angular.forEach(vm.turns, function(typeTurn) {
                    if (typeTurn.turn) {
                        if (note.data.res_type_turn_id == typeTurn.turn.res_type_turn_id) {
                            typeTurn.notes = typeTurn.notes ? typeTurn.notes : {};
                            typeTurn.notes.texto = note.data.texto;
                        }
                    }
                });

                if (!vm.notesBoxValida) {
                    vm.notesNotification = true;
                }

                $scope.$apply();
            }
        });

        var init = function() {
            BookFactory.init($scope);
            loadConfigViewReservation();
            listNumGuest();
            listResultsPagination();
        };

        var setUrlNavigationConfig = function(url) {
            url = paramsFilterReservation(true);
            vm.configUserDefault.url = url;
            BookConfigFactory.setConfig(vm.configUserDefault);
        };

        var listNumGuest = function() {
            vm.bookFilter.numGuest.data.push({
                id: 0,
                text: 'Todos'
            });

            for (var i = 1; i <= 22; i++) {
                var text = (i === 1) ? " invitado" : " invitados";
                vm.bookFilter.numGuest.data.push({
                    id: i,
                    text: i + text
                });
            }
            vm.bookFilter.numGuest.selected = vm.bookFilter.numGuest.data[0];
        };

        var listResultsPagination = function() {
            vm.paginate_reservation.optionsPageSise = [];
            var index = 0;
            var value = 0;
            for (var i = 0; i <= 10; i++) {
                value = value + 10;
                vm.paginate_reservation.optionsPageSise.push({
                    id: value,
                    text: value + ' Reservaciones por página'
                });
                if (value == vm.configUserDefault.page_size) {
                    index = i;
                }
            }
            vm.paginate_reservation.selected = vm.configUserDefault.page;
            vm.paginate_reservation.page_size = vm.configUserDefault.page_size;
            vm.paginate_reservation.selectedPageSize = vm.paginate_reservation.optionsPageSise[index];
        };

        var getSortByFilterReservation = function() {
            var order = "";
            switch (vm.bookOrderBy.resBlock.value) {
                case 'time':
                    order = vm.bookOrderBy.reservation.time;
                    break;
                case 'status':
                    order = vm.bookOrderBy.reservation.status;
                    break;
                case 'covers':
                    order = vm.bookOrderBy.reservation.covers;
                    break;
                case 'guest':
                    order = vm.bookOrderBy.reservation.guest;
                    break;
                case 'table':
                    order = vm.bookOrderBy.reservation.table;
                    break;
                default:
                    break;
            }
            return order;
        };

        var paramsFilterReservation = function(filter) {
            var orderSortBy = getSortByFilterReservation();
            var params_url = {
                date: vm.datesText.start_date,
                date_end: vm.datesText.end_date,
                /*status: ($stateParams.status === undefined || vm.bookFilter.status.toString() !== "") ? vm.bookFilter.status.toString() : $stateParams.status,
                blocks: ($stateParams.blocks === undefined || vm.bookFilter.blocks == true) ? vm.bookFilter.blocks.toString() : $stateParams.blocks,*/
                turns: ($stateParams.turns === undefined || vm.bookFilter.typeTurn.toString() !== "") ? vm.bookFilter.typeTurn.toString() : $stateParams.turns,
                zones: ($stateParams.zones === undefined || vm.bookFilter.zones.toString() !== "") ? vm.bookFilter.zones.toString() : $stateParams.zones,
                sources: ($stateParams.sources === undefined || vm.bookFilter.sources.toString() !== "") ? vm.bookFilter.sources.toString() : $stateParams.sources,
                search_text: ($stateParams.search_text === undefined || vm.bookFilter.search_text !== "") ? vm.bookFilter.search_text : $stateParams.search_text,
                sort: ($stateParams.sort === undefined || orderSortBy !== "") ? orderSortBy : $stateParams.sort
            };

            if (params_url.start_date === "") {
                delete params_url.start_date;
            }

            if (params_url.search_text === "") {
                delete params_url.search_text;
            }

            if (params_url.status === "") {
                delete params_url.status;
            }
            if (params_url.blocks === "") {
                delete params_url.blocks;
            }

            if (params_url.turns === "") {
                delete params_url.turns;
            }
            if (params_url.zones === "") {
                delete params_url.zones;
            }

            if (params_url.sources === "") {
                delete params_url.sources;
            }

            if (params_url.sort === "") {
                delete params_url.sort;
            }

            if (filter === true) {
                if (vm.bookFilter.search_text === "") {
                    delete params_url.search_text;
                }

                if (vm.bookFilter.zones.length <= 0) {
                    delete params_url.zones;
                }

                if (vm.bookFilter.sources.length <= 0) {
                    delete params_url.sources;
                }

                if (vm.bookFilter.typeTurn.length <= 0) {
                    delete params_url.turns;
                }
            }

            vm.bookFilter.params_url = params_url;

            return vm.bookFilter.params_url;
        };

        var pushParamsUrl = function(params) {
            var url = $location.absUrl();
            var index = url.indexOf("?");
            url = url.substring(0, index);

            params = getAsUriParameters(params);
            history.replaceState('', 'Pagina', url + "?" + params);
        };

        var setOrderBookReservation = function(option, search) {

            var orderVal = validateOrderBy(option);
            var order = orderVal.split(".");

            var order_type = (order[1] === "asc") ? "desc" : "asc";
            switch (order[0]) {
                case 'time':
                    vm.bookOrderBy.reservation.time = (search === true) ? order[0] + "." + order_type : orderVal;
                    vm.bookOrderBy.resBlock.value = "time";
                    break;
                case 'status':
                    vm.bookOrderBy.reservation.status = (search === true) ? order[0] + "." + order_type : orderVal;
                    vm.bookOrderBy.resBlock.value = 'status';
                    break;
                case 'covers':
                    vm.bookOrderBy.reservation.covers = (search === true) ? order[0] + "." + order_type : orderVal;
                    vm.bookOrderBy.resBlock.value = "covers";
                    break;
                case 'guest':
                    vm.bookOrderBy.reservation.guest = (search === true) ? order[0] + "." + order_type : orderVal;
                    vm.bookOrderBy.resBlock.value = "guest";
                    break;
                case 'table':
                    vm.bookOrderBy.reservation.table = (search === true) ? order[0] + "." + order_type : orderVal;
                    vm.bookOrderBy.resBlock.value = "table";
                    break;
                case 'date':
                    //vm.bookOrderBy.resBlock.value = (vm.bookOrderBy.resBlock.value === "time" || vm.bookOrderBy.resBlock.value === "time.asc") ? "time.desc" : "time.asc";
                    break;
            }

            if (search === true) {
                vm.searchReservations();
            }
        };

        var validateOrderBy = function(value) {
            var pos = value.indexOf(".");
            if (pos < 0) {
                value = value + ".asc";
            }
            return value;
        };

        var setDatesText = function(startDate, endDate) {
            vm.datesText.start_date = (typeof startDate === 'string') ? startDate : convertFechaYYMMDD(startDate, "es-ES", {});
            vm.datesText.end_date = (endDate !== null) ? convertFechaYYMMDD(endDate, "es-ES", {}) : '';
        };

        var defaultConfigCalendar = function() {
            vm.configUserDefault.rangeDate.hoy = false;
            vm.configUserDefault.rangeDate.week = false;
            vm.configUserDefault.rangeDate.lastSevenDays = false;
            vm.configUserDefault.rangeDate.lastThirtyDays = false;
            vm.configUserDefault.rangeDate.thisMonth = false;
            vm.configUserDefault.rangeDate.lastMonth = false;
            vm.configUserDefault.rangeDate.range = false;
        };

        var setConfigUserDate = function(date) {
            defaultConfigCalendar();
            switch (date) {
                case 0:
                    vm.configUserDefault.rangeDate.hoy = true;
                    break;
                case 'week':
                    vm.configUserDefault.rangeDate.week = true;
                    break;
                case -7:
                    vm.configUserDefault.rangeDate.lastSevenDays = true;
                    break;
                case -30:
                    vm.configUserDefault.rangeDate.lastThirtyDays = true;
                    break;
                case 'month':
                    vm.configUserDefault.rangeDate.thisMonth = true;
                    break;
                case 'last-month':
                    vm.configUserDefault.rangeDate.lastMonth = true;
                    break;
                case 'range':
                    vm.configUserDefault.rangeDate.range = true;
                    break;
            }

            BookConfigFactory.setConfig(vm.configUserDefault);
        };

        var loadConfigViewReservation = function() {

            vm.configUserDefault = BookConfigFactory.getConfig();
            vm.bookFilter.noStatus = vm.configUserDefault.filters.status;
            vm.bookFilter.blocks = vm.configUserDefault.show.blocks;

            vm.fecha_actual = ($stateParams.date === undefined || $stateParams.date === "") ? vm.fecha_actual : $stateParams.date;

            vm.bookView = vm.configUserDefault.reservationView;
            vm.paginate_reservation.page_size = vm.configUserDefault.page_size;
            vm.paginate_reservation.selected = vm.configUserDefault.page;
            vm.paginate_reservation.page = vm.configUserDefault.page;

            if (vm.bookView === false) {
                listTurnAvailable(vm.fecha_actual, null, true);
                setDateBookFilter(vm.fecha_actual);
                setDatesText(vm.fecha_actual, null);
            } else {

                if (vm.configUserDefault.rangeDate.hoy === true) {
                    vm.changeDateCustom(0, 0, null, false);
                }

                if (vm.configUserDefault.rangeDate.week === true) {
                    vm.changeDateBlock('week', null, false);
                }

                if (vm.configUserDefault.rangeDate.lastSevenDays === true) {
                    vm.changeDateCustom(0, -7, null, false);
                }

                if (vm.configUserDefault.rangeDate.lastThirtyDays === true) {
                    vm.changeDateCustom(0, -30, null, false);
                }

                if (vm.configUserDefault.rangeDate.thisMonth === true) {
                    vm.changeDateBlock('month', null, false);
                }

                if (vm.configUserDefault.rangeDate.lastMonth === true) {
                    vm.changeDateLastMonth(null, false);
                }

                //console.log("loadConfigViewReservation " + angular.toJson(vm.configUserDefault, true));

                if ($stateParams.sort !== undefined) {
                    setOrderBookReservation($stateParams.sort, false);
                }

                vm.startDate = ($stateParams.date === undefined) ? vm.startDate : convertFechaToDate($stateParams.date);
                vm.endDate = ($stateParams.date_end === undefined || vm.endDate === undefined) ? vm.startDate : convertFechaToDate($stateParams.date_end);

                setDatesText(vm.startDate, vm.endDate);

                listTurnAvailable(vm.datesText.start_date, vm.datesText.end_date, true, function() {
                    setParamsUrlFilters();
                });

            }
        };

        //Asigna los parametros del filtro ,obtenidos por la url
        var setParamsUrlFilters = function() {
            vm.bookFilter.search_text = ($stateParams.search_text !== undefined) ? $stateParams.search_text : "";

            if ($stateParams.turns !== undefined && $stateParams.turns !== "") {

                var turnsUrl = $stateParams.turns.split(",");
                turnsUrl = BookFactory.parseTurnIdToObjectFilter(turnsUrl);

                vm.bookFilter.options.turnAll = false;

                angular.forEach(turnsUrl, function(value) {
                    BookFactory.addTurnsByFilter(value, vm.bookFilter.typeTurn, vm.turns, vm.bookFilter.options.turnAll);
                });
            }

            if ($stateParams.sources !== undefined && $stateParams.sources !== "") {
                var sourcesUrl = $stateParams.sources.split(",");
                sourcesUrl = BookFactory.parseSourceIdToObjectFilter(sourcesUrl);

                vm.bookFilter.options.sourcesAll = false;

                angular.forEach(sourcesUrl, function(value) {
                    BookFactory.addSourcesByFilter(value, vm.bookFilter.sources, vm.sources, vm.bookFilter.options.sourcesAll);
                });
            }

            if ($stateParams.zones !== undefined && $stateParams.zones !== "") {
                var zonesUrl = $stateParams.zones.split(",");
                zonesUrl = BookFactory.parseZoneIdToObjectFilter(zonesUrl);

                vm.bookFilter.options.zonesAll = false;

                angular.forEach(zonesUrl, function(value) {
                    BookFactory.addZonesByFilter(value, vm.bookFilter.zones, vm.zones, vm.bookFilter.options.zonesAll);
                });
            }
        };

        //Asigna la fecha al objeto date (calendario por defecto de busquedas)
        var setDateBookFilter = function(date) {
            vm.bookFilter.date = convertFechaToDate(date);
        };

        var updateUrl = function(date, date_end, reload) {
            if (reload === true) {
                setDateBookFilter(date);
            }

            if (vm.bookView === false) {
                $location.url("/mesas/book?date=" + date);
            } else {
                date_end = (date_end === undefined) ? convertFechaYYMMDD(vm.endDate, "es-ES", {}) : date_end;

                var url = "/mesas/book?date=" + date + "&date_end=" + date_end;
                var params_url = (vm.bookFilter.params_url === null) ? paramsFilterReservation(false) : vm.bookFilter.params_url;

                delete params_url.date_end;
                delete params_url.date;
                url = url + "&" + getAsUriParameters(params_url);

                $location.url(url);
            }
        };

        var reloadPageByUrl = function(params) {
            console.log("reloadPageByUrl", params);
            //setUrlNavigationConfig("");
            $location.url("/mesas/book?" + params);
        };

        var listTurnAvailable = function(date, date_end, reload, action) {
            action = (typeof action == "function") ? action : function() {};

            var params = {
                date: date,
                date_end: (date_end === null) ? date : date_end,
            };

            if (vm.bookView === false) {
                generatedListBook(params, action);
            } else {
                generatedListBookHistory(params, action);
            }
        };

        var generatedListBook = function(params, action) {
            var params_final = getAsUriParameters(params);

            BookDataFactory.getBook(params_final).then(
                function success(response) {
                    response = response.data;

                    vm.status = response.data.status;
                    vm.turns = response.data.shifts;
                    vm.sources = response.data.sourceTypes;
                    vm.zones = response.data.zones;

                    listHoursTurns(vm.turns, response.data);
                    action();
                },
                function error(response) {
                    console.error("listTurnAvailable ", angular.toJson(response, true));
                }
            );
        };

        var generatedListBookHistory = function(params, action) {

            params.page_size = vm.paginate_reservation.page_size;
            var params_url = (vm.bookFilter.params_url === null) ? paramsFilterReservation(false) : vm.bookFilter.params_url;

            params.page = vm.paginate_reservation.page;
            params.turns = (params_url.turns === undefined) ? "" : params_url.turns;
            params.sources = (params_url.sources === undefined) ? "" : params_url.sources;
            params.zones = (params_url.zones === undefined) ? "" : params_url.zones;
            params.nstatus = (vm.bookFilter.noStatus === undefined) ? "" : vm.bookFilter.noStatus;
            params.sort = (params_url.sort === undefined) ? "time" : params_url.sort;

            if (params_url.search_text !== undefined) {
                params.search_text = params_url.search_text;
            }

            var params_final = getAsUriParameters(params);

            BookDataFactory.getBookHistory(params_final).then(
                function success(response) {
                    response = response.data;
                    vm.turns = response.data.shifts;
                    vm.sources = response.data.sourceTypes;
                    vm.zones = response.data.zones;
                    vm.status = response.data.status;

                    listHoursTurns(vm.turns, response.data);
                    action();
                },
                function error(response) {
                    console.error("listTurnAvailable ", angular.toJson(response, true));
                }
            );
        };

        var generatedListBookPagination = function(date, date_end) {

            var params = {
                date: date,
                date_end: (date_end === null) ? date : date_end,
            };

            params.page_size = vm.paginate_reservation.page_size;
            var params_url = (vm.bookFilter.params_url === null) ? paramsFilterReservation(false) : vm.bookFilter.params_url;

            params.page = vm.paginate_reservation.page;
            params.turns = (params_url.turns === undefined) ? "" : params_url.turns;
            params.sources = (params_url.sources === undefined) ? "" : params_url.sources;
            params.zones = (params_url.zones === undefined) ? "" : params_url.zones;
            params.nstatus = (vm.bookFilter.noStatus === undefined) ? "" : vm.bookFilter.noStatus.toString();
            params.sort = (params_url.sort === undefined) ? "time" : params_url.sort;

            if (params_url.search_text !== undefined) {
                params.search_text = params_url.search_text;
            }

            var params_final = getAsUriParameters(params);

            BookDataFactory.getBookReservations(params_final).then(
                function success(response) {
                    response = response.data;
                    response.data.config = vm.configReservation;
                    listHoursTurns(vm.turns, response.data);
                },
                function error(response) {
                    console.error("listTurnAvailable ", angular.toJson(response, true));
                }
            );
        };

        var listHoursTurns = function(turns, data) {
            reservationService.getHours(turns).then(
                function success(response) {
                    vm.hoursTurns = response.hours;
                    vm.configReservation = data.config;

                    var listBook = [];

                    if (vm.bookView === true) {
                        listBook = BookFactory.listBookReservation(data.reservations);
                        vm.listBookReserva = listBook;
                    } else {
                        listBook = BookFactory.listBook(vm.hoursTurns, vm.bookView, data.reservations, data.blocks, data.availabilityTables);
                        vm.listBook = listBook;
                        vm.listBookMaster = listBook;
                    }

                    vm.resumenBook.reservations = data.stadistics.TOTAL;
                    vm.resumenBook.pax = data.stadistics.PAX;
                    vm.resumenBook.ingresos = data.stadistics.PAX_INGRESO;
                    vm.resumenBook.conversion = data.stadistics.CONVERSION;
                    vm.mds = data.stadistics.MESAS_OCUPADAS + " / " + data.stadistics.MESAS_RESERVADAS;

                    vm.paginate_reservation.total_pages = data.reservations.last_page * vm.paginate_reservation.page_size;

                    BookFactory.setConfigReservation(vm.configReservation);
                    vm.fecha_actual = moment().format('YYYY-MM-DD');
                },
                function error(response) {
                    console.error("getHours " + angular.toJson(response, true));
                }
            );
        };

        var updateReservationBook = function(data) {
            reservationService.blackList.key(data);
            reservationService.patchReservation(data).then(
                function success(response) {
                    console.log("updateReservationBook " + angular.toJson(response.data, true));
                },
                function error(response) {
                    console.error("updateReservationBook " + angular.toJson(response.data, true));
                }
            );
        };

        var listStatusReservation = function() {
            reservationService.getStatuses().then(
                function success(response) {
                    vm.statusReservation = response.data.data;
                },
                function error(response) {
                    console.log("listStatusReservation " + angular.toJson(response.data, true));
                }
            );
        };

        var addNewReservation = function(reservation, action) {

            var date_calendar = convertFechaYYMMDD(vm.bookFilter.date, "es-ES", {});

            var dates = {
                start_date: (vm.bookView === true) ? $stateParams.date : date_calendar,
                end_date: (vm.bookView === true) ? $stateParams.date_end : date_calendar
            };

            reservation = (Array.isArray(reservation) === true) ? reservation[0] : reservation;

            var response = BookFactory.addNewReservation(dates, vm.hoursTurns, vm.listBook, vm.listBookMaster, reservation, action);

            return response;
        };

        init();

    })
    .controller("ModalBookReservationCtrl", function($rootScope, $state, $uibModalInstance, $q, reservationService, reservationHelper, $timeout, data, date, FloorFactory, global, $table) {

        var vm = this;
        var auxiliar;

        vm.reservation = {};
        vm.reservation.status_id = 1;
        vm.reservation.tables = [];
        vm.addGuest = true;
        vm.buttonText = 'Agregar a lista de espera';
        vm.title = "Nueva entrada";
        vm.covers = [];
        vm.guestList = [];

        var tables, blocks;

        date = date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD");

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

        var loadZones = function() {
            var deferred = $q.defer();
            reservationService.getZones(date, true)
                .then(function(response) {
                    deferred.resolve(response.data.data);
                }).catch(function(error) {
                    message.apiError(error);
                });

            return deferred.promise;
        };

        var loadBlocks = function() {
            var deferred = $q.defer();

            reservationService.getBlocks(date, true)
                .then(function(response) {
                    blocks = response.data.data;
                    deferred.resolve(response.data.data);
                }).catch(function(error) {
                    message.apiError(error);
                });

            return deferred.promise;
        };

        //Search guest list
        vm.searchGuest = function(name) {
            if (auxiliar) $timeout.cancel(auxiliar);
            if (!name) {
                vm.guestList.length = 0;
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

            if (vm.reservation.tables.length === 0) {
                return vm.redirectReservation();
            }

            vm.reservation.date = date;
            vm.reservation.hour = data.time;

            vm.reservation.guest = vm.newGuest;
            vm.buttonText = 'Enviando ...';

            save();
        };

        var save = function() {
            vm.waitingResponse = true;
            reservationService.blackList.key(vm.reservation);
            reservationService.save(vm.reservation).then(
                function success(response) {
                    $rootScope.$broadcast("addReservationList", response.data.data);
                    vm.waitingResponse = false;
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                },
                function error(error) {
                    vm.waitingResponse = false;
                    message.apiError(error);
                });
        };

        var listResource = function() {
            return $q.all([
                loadZones(),
                loadBlocks(),
                listGuest()
            ]).then(function(data) {
                tables = reservationHelper.loadTable(data[0]).tables;
                parseInfo();
            });
        };

        var parseInfo = function() {
            vm.info = {
                date: moment(date).format("dddd, MM/DD"),
                time: data.time_text,
            };
            vm.suggestTables();
        };

        vm.suggestTables = function() {
            var table = $table.tablesSuggestedDinamyc(tables, blocks, vm.reservation.covers, data.time);
            vm.reservation.duration = $table.duration(vm.reservation.covers);
            if (table) {
                vm.reservation.tables = [table.id];
                vm.info.table = true;
            } else {
                vm.reservation.tables = null;
                vm.info.table = false;
            }

            vm.info.tableName = table ? "MESA " + table.name : "No hay mesas para " + vm.reservation.covers;
        };

        vm.redirectReservation = function() {
            $uibModalInstance.dismiss('cancel');

            $state.go("mesas.book-reservation-add-params", {
                date: date,
                tables: [{
                    id: (vm.reservation.tables !== null) ? vm.reservation.tables[0] : null
                }],
                hour: data.time,
                guest: vm.reservation.covers
            });
        };

        var init = function() {
            listResource();
        };

        init();
    })
    .controller("ModalCheckGuestListBookCtrl", ["$uibModalInstance", "$q", "reservationService", "reservation", "configuration", function($uibModalInstance, $q, reservationService, reservation, configuration) {

        var vm = this;
        vm.guestListAdd = [];
        vm.person = {
            man: {
                quantity: 0,
                auxiliar: 0,
                min: 0
            },
            woman: {
                quantity: 0,
                auxiliar: 0,
                min: 0
            },
            children: {
                quantity: 0,
                auxiliar: 0,
                min: 0
            },
            total: 0
        };

        var person = {
            man: 1,
            woman: 2,
            children: 3
        };

        vm.changeArrived = function(item) {
            if (!item.arrived) item.type_person = null;
            vm.countPerson();
        };

        vm.addGuest = function() {
            var guest = {
                name: vm.newGuest,
                arrived: 0,
                type_person: null
            };
            vm.guestListAdd.push(guest);
            vm.newGuest = null;
        };

        vm.countPerson = function(item, key) {
            vm.person.man.quantity = 0;
            vm.person.woman.quantity = 0;
            vm.person.children.quantity = 0;
            vm.person.man.auxiliar = vm.person.man.min;
            vm.person.woman.auxiliar = vm.person.woman.min;
            vm.person.children.auxiliar = vm.person.children.min;
            vm.person.total = 0;
            angular.forEach(vm.guestList, function(item) {
                if (!item.status) return;
                if (item.type_person === 1) {
                    vm.person.man.quantity++;
                    if (vm.person.man.quantity > vm.person.man.min) {
                        vm.person.man.auxiliar = vm.person.man.quantity;
                    }
                } else if (item.type_person === 2) {
                    vm.person.woman.quantity++;
                    if (vm.person.woman.quantity > vm.person.woman.min) {
                        vm.person.woman.auxiliar = vm.person.woman.quantity;
                    }
                } else if (item.type_person === 3) {
                    vm.person.children.quantity++;
                    if (vm.person.children.quantity > vm.person.children.min) {
                        vm.person.children.auxiliar = vm.person.children.quantity;
                    }
                }

                vm.person.total += item.arrived;
            });

            angular.forEach(vm.guestListAdd, function(item) {
                if (item.type_person === 1) {
                    vm.person.man.quantity++;
                    if (vm.person.man.quantity > vm.person.man.min) {
                        vm.person.man.auxiliar = vm.person.man.quantity;
                    }
                } else if (item.type_person === 2) {
                    vm.person.woman.quantity++;
                    if (vm.person.woman.quantity > vm.person.woman.min) {
                        vm.person.woman.auxiliar = vm.person.woman.quantity;
                    }
                } else if (item.type_person === 3) {
                    vm.person.children.quantity++;
                    if (vm.person.children.quantity > vm.person.children.min) {
                        vm.person.children.auxiliar = vm.person.children.quantity;
                    }
                }

                vm.person.total += item.arrived;
            });
        };

        vm.changePerson = function(item, key) {
            var auxiliar = item[key];

            item.man = 0;
            item.woman = 0;
            item.children = 0;
            item[key] = auxiliar;

            if (item[key] === 0) {
                item.type_person = null;
                item.arrived = 0;
            } else {
                item.type_person = person[key];
                item.arrived = 1;
            }

            vm.countPerson();
        };

        var initList = function() {
            angular.forEach(vm.guestList, function(item) {
                if (item.type_person === 1) {
                    item.man = 1;
                } else if (item.type_person === 2) {
                    item.woman = 1;
                } else if (item.type_person === 3) {
                    item.children = 1;
                }
            });

            angular.forEach(vm.guestListAdd, function(item) {
                if (item.type_person === 1) {
                    item.man = 1;
                } else if (item.type_person === 2) {
                    item.woman = 1;
                } else if (item.type_person === 3) {
                    item.children = 1;
                }
            });

            vm.countPerson();
        };

        vm.removeGuestListAdd = function(i) {
            vm.guestListAdd.splice(i, 1);
            vm.countPerson();
        };

        vm.removeGuestList = function(item) {
            item.status = 0;
            item.arrived = 0;
            item.type_person = null;
            vm.countPerson();
        };

        vm.save = function() {
            vm.waitingResponse = true;
            reservationService.guestList(reservation.id, {
                guest_list: vm.guestList,
                guest_list_add: vm.guestListAdd
            }).then(
                function success(response) {
                    angular.forEach(response.data.data, function(value, key) {
                        reservation[key] = value;
                    });
                    message.success("Se actualizo lista de invitados");
                    vm.waitingResponse = false;
                    vm.cancel();
                },
                function error(error) {
                    message.apiError(error);
                    vm.waitingResponse = false;
                });
        };

        vm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        var initModule = function() {
            vm.configPeople = configuration.status_people_1 + configuration.status_people_2 + configuration.status_people_3;
            vm.configuration = configuration;
            vm.person.man.min = reservation.num_people_1 * 1;
            vm.person.woman.min = reservation.num_people_2 * 1;
            vm.person.children.min = reservation.num_people_3 * 1;

            vm.guestList = angular.copy(reservation.guest_list);
            initList();
        };

        (function init() {
            initModule();
        })();
    }]);