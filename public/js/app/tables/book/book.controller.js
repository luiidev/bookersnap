angular.module('book.controller', [])
    .controller('BookCtrl', function($uibModal, $scope, $stateParams, $location, $timeout, orderByFilter, BookFactory,
        CalendarService, reservationService, BookDataFactory, $state, ConfigurationDataService, BookConfigFactory, FloorFactory) {

        var vm = this;
        vm.fecha_actual = moment().format('YYYY-MM-DD');

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
        vm.maxDate = dp_date;

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

            //vm.changePagination(date_start, date_end);
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
        vm.listBookMaster = []; //Listado del book original (no se afecta con los filtros)
        vm.sources = [];
        vm.zones = [];
        vm.statusReservation = []; //Listado de status para reservaciones

        vm.bookFilter = {
            typeTurn: [],
            sources: [],
            zones: [],
            date: '',
            options: {
                turnAll: false,
                sourcesAll: false,
                zonesAll: false
            },
            text: '',
            search_text: ''
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
            page_size: 2,
            selected: 1
        };

        vm.filterBook = function(option, value) {

            switch (option) {
                case 'turn':
                    if (value !== "all") {
                        if (value.turn === null) {
                            return;
                        }
                    }
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

            var reservations = BookFactory.filterReservationsAndBlocks(vm.listBook, vm.bookView);

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
                    vm.bookOrderBy.resBlock.date = (vm.bookOrderBy.resBlock.date === "-reservation.hours_reservation") ? "+reservation.hours_reservation" : "-reservation.hours_reservation";

                    break;
            }
        };

        vm.openCalendar = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.calendar = true;
        };

        vm.changeBookView = function(reloadUrl) {

            if (vm.bookView === true) {
                vm.filterBook('reservations', 'reservations');
            } else {
                vm.bookOrderBy.general.reverse = true;
                vm.filterBook('time', 'time');
            }

            vm.configUserDefault.reservationView = vm.bookView;

            BookConfigFactory.setConfig(vm.configUserDefault);

            if (reloadUrl === true) {
                updateUrl($stateParams.date, $stateParams.date_end, false);
            }
            //console.log("changeBookView " + angular.toJson(vm.hoursTurns, true));
        };

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

            vm.resumenBook = BookFactory.getResumenBook(vm.listBook);

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
                size: 'lg',
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

        vm.changePagination = function() {
            vm.paginate_reservation.page = vm.paginate_reservation.selected;

            setDatesText(vm.startDate, vm.endDate);

            var params_url = paramsFilterReservation(true);

            pushParamsUrl(params_url);

            generatedListBook(vm.datesText.start_date, vm.datesText.end_date);
        };

        vm.searchReservations = function() {
            if (vm.bookView === true) {
                vm.paginate_reservation.selected = 1;
                vm.changePagination();
            }
        };

        var paramsFilterReservation = function(filter) {
            var params_url = {
                date: vm.datesText.start_date,
                date_end: vm.datesText.end_date,
                turns: ($stateParams.turns === undefined || $stateParams.turns === "") ? vm.bookFilter.typeTurn.toString() : $stateParams.turns,
                zones: ($stateParams.zones === undefined || $stateParams.zones === "") ? vm.bookFilter.zones.toString() : $stateParams.zones,
                sources: ($stateParams.sources === undefined || $stateParams.sources === "") ? vm.bookFilter.sources.toString() : $stateParams.sources,
                search_text: ($stateParams.search_text === undefined || vm.bookFilter.search_text !== "") ? vm.bookFilter.search_text : $stateParams.search_text
            };

            if (params_url.start_date === "") {
                delete params_url.start_date;
            }

            if (params_url.search_text === "") {
                delete params_url.search_text;
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

            return params_url;
        };

        var pushParamsUrl = function(params) {
            var url = $location.absUrl();
            var index = url.indexOf("?");
            url = url.substring(0, index);

            params = getAsUriParameters(params);
            history.replaceState('', 'Pagina', url + "?" + params);
        };

        $scope.$on("NotifyBookConfigReload", function(evt, message) {
            alert(message + " Se requiere volver a cargar la página.");
            location.reload();
        });

        $scope.$on("NotifyNewReservation", function(evt, data) {

            var response = addNewReservation(data.data, data.action);
            if (response === true) {
                if (!reservationService.blackList.contains(data.key)) {
                    alertMultiple("Notificación", data.user_msg, "info", null);
                }
            }
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
            listSources();
            listStatusReservation();
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
            var config = BookConfigFactory.getConfig();

            vm.configUserDefault = (config === null) ? vm.configUserDefault : config;
            vm.fecha_actual = ($stateParams.date === undefined || $stateParams.date === "") ? vm.fecha_actual : $stateParams.date;

            vm.bookView = vm.configUserDefault.reservationView;

            if (vm.bookView === false) {
                listTurnAvailable(vm.fecha_actual, null, true);
                listZones(vm.fecha_actual, '', true);

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

                vm.startDate = ($stateParams.date !== undefined || $stateParams.date === "") ? vm.startDate : convertFechaToDate($stateParams.date);
                vm.endDate = ($stateParams.date_end !== undefined || $stateParams.date_end === "") ? vm.endDate : convertFechaToDate($stateParams.date_end);

                setDatesText(vm.startDate, vm.endDate);

                listTurnAvailable(vm.datesText.start_date, vm.datesText.end_date, true, function() {
                    setParamsUrlFilters();
                });

                listZones(vm.datesText.start_date, vm.datesText.end_date, true);

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

                var params_url = paramsFilterReservation(false);
                delete params_url.date_end;
                delete params_url.date;
                //console.log("loadConfigViewReservation " + angular.toJson(params_url, true));
                url = url + "&" + getAsUriParameters(params_url);

                $location.url(url);
            }
        };

        var listTurnAvailable = function(date, date_end, reload, action) {
            action = (typeof action == "function") ? action : function() {};

            BookDataFactory.getTypeTurns(date, reload).then(
                function success(response) {
                    response = response;
                    vm.turns = response;
                    listHoursTurns(vm.turns, date, date_end);
                    action();
                },
                function error(response) {
                    console.error("listTypeTurns " + angular.toJson(response, true));
                });
        };

        var listHoursTurns = function(turns, date, date_end) {
            reservationService.getHours(turns).then(
                function success(response) {
                    vm.hoursTurns = response.hours;
                    generatedListBook(date, date_end);
                },
                function error(response) {
                    console.error("getHours " + angular.toJson(response, true));
                }
            );
        };

        var generatedListBook = function(date, date_end) {
            var params = {
                date: date,
                date_end: (date_end === null) ? date : date_end,
            };

            if (vm.bookView === true) {
                params.page_size = vm.paginate_reservation.page_size;

                var params_url = paramsFilterReservation(false);

                params.page = vm.paginate_reservation.page;
                params.turns = (params_url.turns === undefined) ? "" : params_url.turns;
                params.sources = (params_url.sources === undefined) ? "" : params_url.sources;
                params.zones = (params_url.zones === undefined) ? "" : params_url.zones;

                if (params_url.search_text !== undefined) {
                    params.search_text = params_url.search_text;
                }
            }

            params = getAsUriParameters(params);

            //console.log("generatedListBook " + params);

            BookFactory.listReservationAndBlocks(true, params).then(
                function success(response) {
                    var listBook = BookFactory.listBook(vm.hoursTurns, vm.bookView, response[0], response[1], response[3]);
                    vm.listBook = listBook;
                    vm.listBookMaster = listBook;
                    vm.configReservation = response[2];

                    vm.paginate_reservation.total_pages = response[0].last_page * vm.paginate_reservation.page_size;

                    BookFactory.setConfigReservation(vm.configReservation);
                    vm.fecha_actual = moment().format('YYYY-MM-DD');

                    if (date == vm.fecha_actual) {
                        vm.mds = BookFactory.calculateMDS(vm.listBook, vm.zones);
                    }

                    if (vm.bookView === true) {
                        vm.changeBookView(false);
                    }
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

        var listZones = function(date, date_end, reload) {
            var params = {
                date_ini: date,
                date_end: '',
                reload: reload
            };

            if (date_end !== null) {
                params.date_end = getAsUriParameters({
                    date_end: date_end
                });
            }

            BookDataFactory.getZones(params).then(
                function success(response) {
                    response = response.data.data;
                    vm.zones = response;
                },
                function error(response) {
                    console.error("listZones " + angular.toJson(response, true));
                });
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
            console.log(date);
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
            console.log(name);
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
            reservationService.blackList.key(vm.reservation);
            reservationService.save(vm.reservation).then(
                function success(response) {
                    $rootScope.$broadcast("addReservationList", response.data.data);
                    vm.buttonText = 'Agregar a lista de espera';
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                },
                function error(error) {
                    vm.buttonText = 'Agregar a lista de espera';
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

            vm.info.tableName = table ? table.name : "No hay mesas para " + vm.reservation.covers;

            console.log("suggestTables " + angular.toJson(tables, true));
        };

        vm.redirectReservation = function() {
            $uibModalInstance.dismiss('cancel');
            $state.go("mesas.book-reservation-add", {
                date: date,
                tables: [{
                    id: vm.reservation.table_id
                }]
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
            vm.person.man.min = reservation.num_people_1;
            vm.person.woman.min = reservation.num_people_2;
            vm.person.children.min = reservation.num_people_3;

            vm.guestList = angular.copy(reservation.guest_list);
            initList();
        };

        (function init() {
            initModule();
        })();
    }]);