angular.module('floor.controller', [])

.controller('FloorCtrl', function($scope, $rootScope, $timeout, $q, $uibModal, reservationHelper, reservationService, TypeTurnFactory,
        FloorFactory, FloorDataFactory, ServerDataFactory, $table, $window, screenHelper, screenSizeFloor, TypeFilterDataFactory, ServerNotification) {

        var vm = this;
        var fecha_actual = getFechaActual();

        vm.fecha_actual = fecha_actual;
        vm.typeTurns = [];

        vm.zones = [];
        var blocks = [];
        var reservations = [];
        var eventEstablished = {};

        /**
         * Variable de apoyo para saber que evento ejecutar en arrastre de objeto a un mesa
         */

        vm.titulo = "Floor";
        vm.colorsSelect = [];

        vm.flagSelectedZone = 0;

        //Notas turnos
        vm.notesBox = false;
        vm.notesBoxValida = false;
        vm.notesData = {
            texto: '',
            res_type_turn_id: ''
        };
        vm.notesNotify = false; //se activa cuando llega notificaciones de notas
        vm.notesSave = false; // se activa cuando creamos notas

        var timeoutNotes;
        var openNotesTimeOut;

        var serverSocket = ServerNotification.getConnection();

        vm.fecha_actual = fecha_actual;
        vm.typeTurns = [];

        $scope.$on("floorEventEstablish", function(evt, eventDrop, data) {
            eventEstablished.event = eventDrop;
            eventEstablished.data = data;
        });

        $scope.$on("floorClearSelected", function() {
            $table.clearSelected(vm.zones);
        });

        $scope.$on("floorTablesSelected", function(evt, tables) {
            $table.tablesSelected(vm.zones, tables);
        });

        $scope.$on("floorZoneIndexSelected", function(evt, tables) {
            var index = $table.getZoneIndexForTable(vm.zones, tables);
            if (index !== null) vm.tabSelectedZone(index);
        });

        $scope.$on("floorReload", function() {
            loadBlocksReservations()
                .then(function() {
                    if (vm.showTime) {
                        var event = $table.lastTimeEvent();
                        if (event) showTimeCustom(event);
                    }
                });
        });

        /*$scope.$on("listadoTypeTurnos", function() {
            alert("hola ");
        });*/

        vm.eventEstablish = function(eventDrop) {
            eventEstablished.event = eventDrop;
            eventEstablished.data = null;
        };

        vm.findTableForServer = function(tables) {
            var index = $table.getZoneIndexForTable(vm.zones, tables);
            if (index !== null) vm.tabSelectedZone(index);
        };

        vm.tabSelectedZone = function(value) {
            FloorFactory.setNavegationTabZone(value);
            vm.flagSelectedZone = value;
        };

        var listTypeTurns = function() {
            FloorFactory.listTurnosActivos(vm.fecha_actual).then(
                function success(response) {
                    vm.typeTurns = response;
                    TypeFilterDataFactory.setTypeTurnItems(response);
                    $rootScope.$broadcast("floorListadoTypeTurnos");
                },
                function error(error) {
                    message.apiError(error);
                }
            );
        };

        var getServers = function() {
            ServerDataFactory.listadoServers()
                .then(function success(servers) {
                    //////////////////////////////////////////////////////////////
                    $table.setColorTable(vm.zones, servers);
                    //////////////////////////////////////////////////////////////
                    ServerDataFactory.setServerItems(servers);
                    //console.log(angular.toJson(servers, true));
                    /* Se cargan los colores que ya fueron asignados  */
                    angular.forEach(servers, function(server, m) {
                        ServerDataFactory.setColorItems(server.color);
                    });
                }, function error(error) {
                    message.apiError(error);
                });
        };

        var loadBlocks = function() {
            var deferred = $q.defer();
            reservationService.getBlocks(null, true)
                .then(function(response) {
                    blocks = response.data.data;
                    deferred.resolve();
                }).catch(function(error) {
                    message.apiError(error, "No se pudo cargar las reservaciones");
                }).finally(function() {
                    //////////////////////////////////////////////////////////////
                    $table.setBorderColorForReservation(vm.zones, blocks);
                    //////////////////////////////////////////////////////////////
                });
            return deferred.promise;
        };

        var loadReservations = function() {
            var deferred = $q.defer();
            FloorDataFactory.getReservas(true)
                .then(function(response) {
                    reservations = response.data.data;
                    deferred.resolve();
                }).catch(function(error) {
                    message.apiError(error, "No se pudo cargar las reservaciones");
                });
            return deferred.promise;
        };

        var loadBlocksReservations = function() {
            return $q.all([loadBlocks(), loadReservations()]);
        };

        var loadZones = function(date) {
            reservationService.getZones(date)
                .then(function(response) {
                    var zones = response.data.data;
                    vm.zones = reservationHelper.loadTable(zones);
                    FloorFactory.setDataZonesTables(zones);
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    getServers();
                    loadBlocksReservations()
                        .then(function() {
                            var event = $table.lastTimeEvent();
                            if (event) {
                                showTimeCustom(event);
                                vm.showTime = true;
                        }
                    });
                });
        };

        vm.mostrarDetail = function(index, data) {
            var estado = FloorFactory.isEditServer();
            if (estado === false) {
                modalInstancesDetail(index, data);
            } else {
                storeTables(index, data);
            }
        };

        function modalInstancesDetail(index, data) {
            var modalInstance = $uibModal.open({
                templateUrl: 'myModalContentDetail.html',
                controller: 'DetailInstanceCtrl',
                controllerAs: 'vmd',
                size: '',
                resolve: {
                    content: function() {
                        return {
                            zoneName: vm.zones[index].name,
                            table: data,
                            blocks: blocks,
                            zones: vm.zones
                        };
                    }
                }
            });
        }

        vm.handConfiguration = function(obj) {
            var cantidades = {
                men: vm.numpeople.num_men,
                women: vm.numpeople.num_women,
                children: vm.numpeople.num_children
            };

            modalInstancesConfiguration(cantidades, obj);
        };

        function modalInstancesConfiguration(cantidades, obj) {
            var modalInstance = $uibModal.open({
                templateUrl: 'modalConfiguration.html',
                controller: 'ConfigurationInstanceCtrl',
                controllerAs: 'vmc',
                size: 'lg',
                resolve: {
                    num: function() {
                        return cantidades;
                    },
                    table: function() {
                        return obj;
                    },
                    eventEstablished: function() {
                        return eventEstablished;
                    }
                }
            });
        }

        function storeTables(num, table) {
            $scope.$apply(function() {
                table.selected = !table.selected;

                if (!table.selected) {
                    ServerDataFactory.delTableServerItem(table);
                } else {
                    ServerDataFactory.setTableServerItems(table);
                }
            });
        }

        var sizeLienzo = function() {
            vm.size = screenHelper.size(screenSizeFloor);
            vm.fontSize = (14 * vm.size / screenSizeFloor.minSize + "px");
        };

        vm.openNotes = function() {
            vm.notesBox = !vm.notesBox;
            if (openNotesTimeOut) $timeout.cancel(openNotesTimeOut);

            openNotesTimeOut = $timeout(function() {
                vm.notesBoxValida = true;

            }, 500);
        };

        var closeNotes = function() {
            angular.element($window).bind('click', function(e) {

                var container = $(".box-tab-notas");

                if (container.has(e.target).length === 0 && vm.notesBoxValida === true) {

                    $scope.$apply(function() {
                        vm.notesBox = false;
                        vm.notesBoxValida = false;
                    });
                }
            });
        };

        var onSocketNotes = function() {
            serverSocket.on("b-mesas-floor-notes", function(data) {
                console.log("onSocketNotes " + angular.toJson(data, true));
                if (!vm.notesBox) {
                    vm.notesNotify = true;
                    vm.notesNotification = true;
                    listTypeTurns();
                }

            });
        };

        vm.saveNotes = function(turn) {
            if (timeoutNotes) $timeout.cancel(timeoutNotes);
            vm.notesData.id = turn.notes.id;
            vm.notesData.res_type_turn_id = turn.id;
            vm.notesData.texto = turn.notes.texto;
            vm.notesData.date_add = turn.notes.date_add;

            timeoutNotes = $timeout(function() {
                FloorFactory.createNotes(vm.notesData).then(
                    function success(response) {
                        vm.notesSave = true;
                        console.log("saveNotes success " + angular.toJson(response, true));
                    },
                    function error(response) {
                        console.error("saveNotes " + angular.toJson(response, true));
                    }
                );
            }, 1000);
        };

        angular.element($window).bind('resize', function() {
            sizeLienzo();
            $scope.$digest();
        });


        //////////////////////////////////////////////////////////////
        // Filtro de mesas recomendas, bloquedas
        //  y ocupadas en el rango de hora que se
        //  pretende ocupar
        //////////////////////////////////////////////////////////////
        vm.tableFilter = function(num) {
            $scope.$apply(function() {
                vm.filter = true;
                $table.tableFilter(vm.zones, blocks, num);
            });
        };

        vm.tableFilterClear = function() {
            $scope.$apply(function() {
                vm.filter = false;
                $table.tableFilterClear(vm.zones, blocks);
            });
        };
        /////////////////////// END /////////////////////////////

        //////////////////////////////////////////////////////////////
        // Filtro y muestra de caja de tiempo
        //////////////////////////////////////////////////////////////
        var updateTime;
        vm.hideTimes = function() {
            vm.showTime = false;
            $table.lastTimeEvent("reset");
            if (updateTime) $timeout.cancel(updateTime);
        };

        vm.showTimeSeated = function() {
            if (updateTime) $timeout.cancel(updateTime);

            $table.makeTime(vm.zones, blocks, reservations, "seated");
            vm.showTime = true;

            updateTime = $timeout(vm.showTimeSeated, 60000);
        };

        vm.showTimeToComplete = function() {
            if (updateTime) $timeout.cancel(updateTime);

            $table.makeTime(vm.zones, blocks, reservations, "complete");
            vm.showTime = true;

            updateTime = $timeout(vm.showTimeToComplete, 60000);
        };

        vm.showTimeNextTime = function() {
            if (updateTime) $timeout.cancel(updateTime);

            $table.makeTime(vm.zones, blocks, reservations, "nextTime");
            vm.showTime = true;

            updateTime = $timeout(vm.showTimeNextTime, 60000);
        };

        vm.showTimeNextTimeAll = function() {
            if (updateTime) $timeout.cancel(updateTime);

            $table.makeTime(vm.zones, blocks, reservations, "nextTimeAll");
            vm.showTime = true;

            updateTime = $timeout(vm.showTimeNextTimeAll, 60000);
        };

        var showTimeCustom = function(event) {
            if (updateTime) $timeout.cancel(updateTime);

            $table.makeTime(vm.zones, blocks, reservations, event);
            vm.showTime = true;

            updateTime = $timeout(showTimeCustom, 60000, true, event);
        };

        /////////////////////// END /////////////////////////////


        (function Init() {
            loadZones(fecha_actual);
            listTypeTurns();
            sizeLienzo();
            closeNotes();

            //onSocketNotes();

        })();

    })
    .controller('ConfigurationInstanceCtrl', function($uibModalInstance, num, table, eventEstablished, OperationFactory, reservationService, $rootScope) {
        var vmc = this;

        //Datos pasados al modal
        vmc.numperson = num;
        vmc.table = table;

        //Definiendo valores por defecto
        vmc.flagSelectedNumMen = num.men;
        vmc.flagSelectedNumWomen = num.women;
        vmc.flagSelectedNumChildren = num.children;
        vmc.resultado = num.men + num.women + num.children;

        //Creando numero de casillas
        var vNumpeople = [];
        for (var i = 0; i <= 12; i++) {
            vNumpeople.push({
                num: i
            });
        }
        vmc.colectionNum = vNumpeople;

        //Al pulsar numero 13 o mayor
        vmc.numThirteen = function(value, person) {
            if (person == 'men') {
                vmc.flagSelectedNumMen = value;
                vmc.flagSelectedCountNumMen = value;
                vmc.numdinamicoMen = value;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoMen);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }
            if (person == 'women') {
                vmc.flagSelectedNumWomen = value;
                vmc.flagSelectedCountNumWomen = value;
                vmc.numdinamicoWomen = value;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoWomen);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }
            if (person == 'children') {
                vmc.flagSelectedNumChildren = value;
                vmc.flagSelectedCountNumChildren = value;
                vmc.numdinamicoChildren = value;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoChildren);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }
        };

        //Al pulsar numero menor a 13
        vmc.btnSelectedNum = function(value, person) {
            if (person == 'men') {
                vmc.flagSelectedNumMen = value;
                vmc.flagSelectedCountNumMen = 0;
                vmc.numdinamicoMen = 13;
                OperationFactory.setNumPerson(vmc.numperson, person, value);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }
            if (person == 'women') {
                vmc.flagSelectedNumWomen = value;
                vmc.flagSelectedCountNumWomen = 0;
                vmc.numdinamicoWomen = 13;
                OperationFactory.setNumPerson(vmc.numperson, person, value);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }
            if (person == 'children') {
                vmc.flagSelectedNumChildren = value;
                vmc.flagSelectedCountNumChildren = 0;
                vmc.numdinamicoChildren = 13;
                OperationFactory.setNumPerson(vmc.numperson, person, value);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }
        };

        //Automarcar mayores que 13 segun datos traidos por defecto
        if (num.men > 12) {
            vmc.numdinamicoMen = num.men;
            vmc.flagSelectedCountNumMen = num.men;
        } else {
            vmc.numdinamicoMen = 13;
        }

        if (num.women > 12) {
            vmc.numdinamicoWomen = num.women;
            vmc.flagSelectedCountNumWomen = num.women;
        } else {
            vmc.numdinamicoWomen = 13;
        }

        if (num.children > 12) {
            vmc.numdinamicoChildren = num.children;
            vmc.flagSelectedCountNumChildren = num.children;

        } else {
            vmc.numdinamicoChildren = 13;
        }

        //Al pulsar boton plus
        vmc.sumar = function(person) {
            if (person == 'men') {
                vmc.numdinamicoMen++;
                vmc.flagSelectedCountNumMen = vmc.numdinamicoMen;
                vmc.flagSelectedNumMen = -1;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoMen);
                //console.log('Datos ' + angular.toJson(vmc.numperson));
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }

            if (person == 'women') {
                vmc.numdinamicoWomen++;
                vmc.flagSelectedCountNumWomen = vmc.numdinamicoWomen;
                vmc.flagSelectedNumWomen = -1;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoWomen);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }

            if (person == 'children') {
                vmc.numdinamicoChildren++;
                vmc.flagSelectedCountNumChildren = vmc.numdinamicoChildren;
                vmc.flagSelectedNumChildren = -1;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoChildren);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }
        };
        //Al pulsar boton minus
        vmc.restar = function(person) {
            if (person == 'men') {
                if (vmc.numdinamicoMen > 13) {
                    vmc.numdinamicoMen--;
                    vmc.flagSelectedCountNumMen = vmc.numdinamicoMen;
                    vmc.flagSelectedNumMen = -1;
                    OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoMen);
                    vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
                }
            }
            if (person == 'women') {
                if (vmc.numdinamicoWomen > 13) {
                    vmc.numdinamicoWomen--;
                    vmc.flagSelectedCountNumWomen = vmc.numdinamicoWomen;
                    vmc.flagSelectedNumWomen = -1;
                    OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoWomen);
                    vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
                }
            }
            if (person == 'children') {
                if (vmc.numdinamicoChildren > 13) {
                    vmc.numdinamicoChildren--;
                    vmc.flagSelectedCountNumChildren = vmc.numdinamicoChildren;
                    vmc.flagSelectedNumChildren = -1;
                    OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoChildren);
                    vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
                }
            }
        };

        vmc.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        function parseReservation() {
            var now = moment();
            var date = now.format("YYYY-MM-DD");
            var start_time = now.clone().add(-(now.minutes() % 15), "minutes").second(0).format("HH:mm:ss");
            return {
                table_id: table.id,
                guests: {
                    men: vmc.flagSelectedNumMen,
                    women: vmc.flagSelectedNumWomen,
                    children: vmc.flagSelectedNumChildren,
                },
                date: date,
                hour: start_time
            };
        }

        vmc.save = function() {
            if (eventEstablished.event == "sit") {
                sit();
            } else if (eventEstablished.event == "create") {
                create();
            }
        };

        var create = function() {
            vmc.waitingResponse = true;
            var reservation = parseReservation();

            reservationService.quickCreate(reservation)
                .then(function(response) {
                    $rootScope.$broadcast("floorReload");
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.apiError(error);
                    vmc.waitingResponse = false;
                });
        };

        var sit = function() {
            vmc.waitingResponse = true;

            var id = eventEstablished.data.reservation_id;
            var data = {
                table_id: table.id
            };

            reservationService.sit(id, data)
                .then(function(response) {
                    $rootScope.$broadcast("floorReload");
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.apiError(error);
                    vmc.waitingResponse = false;
                });
        };
    })
    .controller('DetailInstanceCtrl', function($scope, $rootScope, $uibModalInstance, $uibModal, content, FloorFactory, reservationService, $state, $table, $q) {
        var vmd = this;
        vmd.itemZona = {
            name_zona: content.zoneName,
            name: content.table.name
        };

        vmd.reservation = {};

        var getTableReservation = function() {
            FloorFactory.rowTableReservation(content.table.id).then(function(data) {
                vmd.itemReservations = data;
                //console.log('PopUp: ' + angular.toJson(data, true));
            });
        };

        vmd.reservationEditAll = function() {
            $uibModalInstance.dismiss('cancel');
            $state.go('mesas.reservation-edit', {
                id: vmd.reservation.id,
                date: getFechaActual()
            });
        };

        vmd.reservationEdit = function(data) {
            listResource().then(function() {
                parseInfo(data);
                parseData(data);
            });

            vmd.EditContent = true;
        };

        function listResource() {
            return $q.all([
                listGuest(),
                listStatuses(),
                listServers(),
                loadConfiguration()
            ]);
        }

        vmd.sumar = function(guest) {
            var total = vmd.reservation.guests.total;
            if (total + 1 <= vmd.reservation.covers) {
                vmd.reservation.guests[guest]++;
                totalGuests();
            }
        };

        vmd.restar = function(guest) {
            var quantity = vmd.reservation.guests[guest];
            if (quantity - 1 >= 0) {
                vmd.reservation.guests[guest]--;
                totalGuests();
            }
        };

        var totalGuests = function() {
            vmd.reservation.guests.total = vmd.reservation.guests.men +  vmd.reservation.guests.women + vmd.reservation.guests.children;
        };

        function parseData(reservation) {
            var men = 0;
            var women = 0;
            var children = 0;
            if (vmd.configuration.status_people_1) {
                men = reservation.num_people_1 || 0;
            }
            if (vmd.configuration.status_people_2) {
                women = reservation.num_people_2 || 0;
            }
            if (vmd.configuration.status_people_3) {
                children = reservation.num_people_3 || 0;
            }
            vmd.reservation = {
                id: reservation.reservation_id,
                covers: reservation.num_people,
                status_id: reservation.res_reservation_status_id,
                server_id: reservation.res_server_id,
                note: reservation.note || null,
                guests: {
                   men: men,
                   women: women,
                   children: children
                }
            };

            totalGuests();
        }

        function parseInfo(reservation) {
            vmd.info = {
                first_name: reservation.first_name,
                last_name: reservation.last_name,
                date: moment(reservation.start_date).format("dddd, d [de] MMMM"),
                time: moment(reservation.start_time, "HH:mm:ss").format("H:mm A"),
                tables: getTables(reservation.tables)
            };
        }

        function getTables(tables) {
            var reservationTables = "";
            angular.forEach(tables, function(table) {
                reservationTables += table.name + ", ";
            });

            return reservationTables.substring(0, reservationTables.length - 2);
        }


        var listGuest = function() {
            var deferred = $q.defer();
            reservationService.getGuest()
                .then(function(guests) {
                    vmd.covers = guests;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        var listStatuses = function() {
            var deferred = $q.defer();
            reservationService.getStatuses()
                .then(function(response) {
                    vmd.statuses = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        var listServers = function() {
            var deferred = $q.defer();
            reservationService.getServers()
                .then(function(response) {
                    vmd.servers = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        var loadConfiguration = function() {
            var deferred = $q.defer();
            reservationService.getConfigurationRes()
                .then(function(response) {
                    vmd.configuration = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        vmd.cancelEdit = function() {
            vmd.EditContent = false;
            vmd.reservation = {};
            vmd.info = {};
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        vmd.save = function() {
            var id = vmd.reservation.id;
            reservationService.quickEdit(id, vmd.reservation)
                .then(function(response) {
                    $rootScope.$broadcast("floorReload");
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.apiError(error);
                });
        };

        vmd.cancelReservation = function() {
            message.confirm("¿ Esta seguro de cencelar la reservacion ?", "Esta accion se puede revertir", function() {
                vmd.waitingResponse = true;
                var id = vmd.reservation.id;
                reservationService.cancel(id)
                    .then(function(response) {
                        $rootScope.$broadcast("floorReload");
                        message.success(response.data.msg);
                        $uibModalInstance.dismiss('cancel');
                        vmd.waitingResponse = false;
                    }).catch(function(error) {
                        message.apiError(error);
                        vmd.waitingResponse = false;
                    });
            });
        };

        getTableReservation();
    })
    .controller('reservationController', function($scope, $rootScope, $uibModal, $timeout, FloorFactory, ServerDataFactory, TypeFilterDataFactory) {
        var rm = this;
        var fecha_actual = getFechaActual();
        rm.fecha_actual = fecha_actual;

        //Limpiar data y estilos de servers
        FloorFactory.isEditServer(false);
        angular.element('.bg-window-floor').removeClass('drag-dispel');
        // angular.element('.table-zone').removeClass("selected-table");
        $rootScope.$broadcast("floorClearSelected");
        ServerDataFactory.cleanTableServerItems();

        rm.search = {
            show: true
        };
        rm.searchReservation = function() {
            rm.search.show = !rm.search.show;
        };

        var getlistZonesBloqueosReservas = function() {
            FloorFactory.listBloqueosReservas().then(function success(data) {

                rm.res_listado_all = data;

                var total = 0;
                var men = 0;
                var women = 0;
                var children = 0;
                var tWeb = 0;
                var tTel = 0;
                var tPor = 0;
                var tRp = 0;

                rm.res_listado = rm.res_listado_all;
                angular.forEach(rm.res_listado_all, function(people) {

                    men += people.num_people_1;
                    women += people.num_people_2;
                    children += people.num_people_3;
                    total += people.num_people;

                    var source_type = people.res_source_type_id;
                    switch (source_type) {
                        case 1:
                            tWeb += 1;
                            break;
                        case 2:
                            tTel += 1;
                            break;
                        case 3:
                            tPor += 1;
                            break;
                        case 4:
                            tRp += 1;
                            break;
                    }

                });


                rm.total_men = men;
                rm.total_women = women;
                rm.total_children = children;
                rm.total_people = total;
                rm.total_visitas = total;

                rm.total_tweb = tWeb;
                rm.total_ttel = tTel;
                rm.total_tpor = tPor;
                rm.total_trp = tRp;
                rm.total_reservas = rm.res_listado.length;


                //console.log('Reservaciones: ' + angular.toJson(data, true));

            });
        };
        getlistZonesBloqueosReservas();


        //Datos y acciones para filtrar por Turnos//
        //****************************//
        $rootScope.$on("floorListadoTypeTurnos", function() {
            var turn = TypeFilterDataFactory.getTypeTurnItems();
            rm.categorias_type = turn;
            //console.log(angular.toJson(rm.categorias_type, true));
            TypeFilterDataFactory.setOpcionesFilterTurnos(rm.categorias_type[0]);
            var colection_filtro_turnos = TypeFilterDataFactory.getOpcionesFilterTurnos();
            //console.log(angular.toJson(colection_filtro_turnos[0], true));
            rm.select_type(colection_filtro_turnos[0], null);

        });

        rm.select_type = function(categoria, event) {
            rm.filter_type = categoria;

            if (event !== null) {
                event.stopPropagation();
            }

            if (categoria.id !== 0) {
                //Evalua Cualquier Opcion diferente de Todos
                if (categoria.checked === true) { //Deshabilitar
                    TypeFilterDataFactory.delOpcionesFilterTurnos(categoria);
                    categoria.checked = false;
                    filtrarTurnos();
                } else { //Habilitar y Deshabilitar todos
                    categoria.checked = true;
                    TypeFilterDataFactory.setOpcionesFilterTurnos(categoria);
                    rm.categorias_type[0].checked = false;
                    filtrarTurnos();
                }
            } else {
                //Evalua Opcion TODOS
                var deshabilitar = function() {
                    rm.filter_type = categoria;
                    angular.forEach(rm.categorias_type, function(type) {
                        if (type.id !== 0) {
                            TypeFilterDataFactory.delOpcionesFilterTurnos(type);
                            type.checked = false;
                        }
                    });
                };

                if (categoria.checked === true) {
                    deshabilitar();
                } else {
                    categoria.checked = true;
                    deshabilitar();
                }
            }

            return false;
        };

        var filtrarTurnos = function() {
            var colection_filtro_turnos = TypeFilterDataFactory.getOpcionesFilterTurnos();
            rm.filter_type = colection_filtro_turnos;
            if (rm.filter_type.length === 0) {
                rm.categorias_type[0].checked = true;
            }
            //console.log(rm.filter_type);
        };


        //Datos y acciones para filtrar Visitas//
        //****************************//
        rm.categorias_people = [{
            idcategoria: 1,
            nombre: 'Todos',
            checked: true,
        }, {
            idcategoria: 2,
            nombre: 'Hombres',
            checked: false,
        }, {
            idcategoria: 3,
            nombre: 'Mujeres',
            checked: false,
        }, {
            idcategoria: 4,
            nombre: 'Niños(as)',
            checked: false,
        }];
        //Agregar para filtro por defecto
        TypeFilterDataFactory.setOpcionesFilterVisitas(rm.categorias_people[0]);

        rm.select_people = function(categoria, event) {

            rm.filter_people = categoria;

            if (event !== null) {
                event.stopPropagation();
            }

            if (categoria.idcategoria != 1) {
                //Evalua Cualquier Opcion diferente de Todos
                if (categoria.checked === true) { //Deshabilitar
                    TypeFilterDataFactory.delOpcionesFilterVisitas(categoria);
                    categoria.checked = false;
                    filtrarVisitas();
                } else { //Habilitar y Deshabilitar todos
                    categoria.checked = true;
                    TypeFilterDataFactory.setOpcionesFilterVisitas(categoria);
                    rm.categorias_people[0].checked = false;
                    filtrarVisitas();
                }
            } else {
                //Evalua Opcion TODOS
                var deshabilitar = function() {
                    rm.filter_people = categoria;
                    angular.forEach(rm.categorias_people, function(gender) {
                        if (gender.idcategoria !== 1) {
                            TypeFilterDataFactory.delOpcionesFilterVisitas(gender);
                            gender.checked = false;
                        }
                    });
                    rm.res_listado = rm.res_listado_all;
                };

                if (categoria.checked === true) {
                    deshabilitar();
                } else {
                    categoria.checked = true;
                    deshabilitar();
                }

            }
            return false;
        };

        var colection_filtro_visitas = TypeFilterDataFactory.getOpcionesFilterVisitas();
        rm.select_people(colection_filtro_visitas[0], null);

        var filtrarVisitas = function() {
            var colection_filtro_visitas = TypeFilterDataFactory.getOpcionesFilterVisitas();
            rm.filter_people = colection_filtro_visitas;

            if (rm.filter_people.length === 0) {
                rm.categorias_people[0].checked = true;
                rm.total_visitas = rm.total_people;
            } else {
                var calculo = 0;
                angular.forEach(rm.filter_people, function(genero) {
                    var idgenero = genero.idcategoria;
                    //console.log(idgenero);
                    switch (idgenero) {
                        case 2:
                            calculo += rm.total_men;
                            break;
                        case 3:
                            calculo += rm.total_women;
                            break;
                        case 4:
                            calculo += rm.total_children;
                            break;
                    }
                });
                rm.total_visitas = calculo;
            }

            //Filtrado realizado por .filter de angular//
            /*
            var salida = [];
            if (rm.filter_people.length !== 0) {

                angular.forEach(rm.res_listado_all, function(item, index) {
                    angular.forEach(rm.filter_people, function(genero) {
                        var idgenero = genero.idcategoria;
                        switch (idgenero) {
                            case 2:
                                if (item.num_people_1 !== 0) {
                                    angular.forEach(salida, function(value, key) {
                                        if (value.reservation_id == item.reservation_id) {
                                            salida.splice(key, 1);
                                        }
                                    });
                                    salida.push(item);
                                }

                                break;
                            case 3:
                                if (item.num_people_2 !== 0) {
                                    angular.forEach(salida, function(value, key) {
                                        if (value.reservation_id == item.reservation_id) {
                                            salida.splice(key, 1);
                                        }
                                    });
                                    salida.push(item);
                                }
                                break;
                            case 4:

                                if (item.num_people_3 !== 0) {
                                    angular.forEach(salida, function(value, key) {
                                        if (value.reservation_id == item.reservation_id) {
                                            salida.splice(key, 1);
                                        }
                                    });
                                    salida.push(item);
                                }
                                break;

                        }
                    });
                });
                rm.res_listado = salida;
            } else {
                angular.forEach(rm.res_listado_all, function(item, index) {
                    salida.push(item);
                });
                rm.res_listado = salida;
            }
            */
        };

        //Datos y acciones para filtrar Reservas//
        //****************************//
        rm.categorias_reserva = [{
            id: 0,
            nombre: 'Todos',
            checked: true,
        }, {
            id: 1,
            nombre: 'Web',
            checked: false,
        }, {
            id: 2,
            nombre: 'Telefono',
            checked: false,
        }, {
            id: 3,
            nombre: 'Portal',
            checked: false,
        }, {
            id: 4,
            nombre: 'RP',
            checked: false,
        }];
        TypeFilterDataFactory.setOpcionesFilterReservas(rm.categorias_reserva[0]);

        rm.select_reserva = function(categoria, event) {

            rm.filter_reserva = categoria;

            if (event !== null) {
                event.stopPropagation();
            }

            if (categoria.id !== 0) {
                //Evalua Cualquier Opcion diferente de Todos
                if (categoria.checked === true) { //Deshabilitar
                    TypeFilterDataFactory.delOpcionesFilterReservas(categoria);
                    categoria.checked = false;
                    filtrarReservas();
                } else { //Habilitar y Deshabilitar todos
                    categoria.checked = true;
                    TypeFilterDataFactory.setOpcionesFilterReservas(categoria);
                    rm.categorias_reserva[0].checked = false;
                    filtrarReservas();
                }
            } else {
                //Evalua Opcion TODOS
                var deshabilitar = function() {
                    rm.filter_reserva = categoria;
                    angular.forEach(rm.categorias_reserva, function(reserva) {
                        if (reserva.id !== 0) {
                            TypeFilterDataFactory.delOpcionesFilterReservas(reserva);
                            reserva.checked = false;
                        }
                    });
                    //rm.res_listado = rm.res_listado_all;
                };

                if (categoria.checked === true) {
                    deshabilitar();
                } else {
                    categoria.checked = true;
                    deshabilitar();
                }
            }
            return false;
        };

        var colection_filtro_reservas = TypeFilterDataFactory.getOpcionesFilterReservas();
        rm.select_reserva(colection_filtro_reservas[0], null);

        var filtrarReservas = function() {
            var colection_filtro_reservas = TypeFilterDataFactory.getOpcionesFilterReservas();
            rm.filter_reserva = colection_filtro_reservas;
            if (rm.filter_reserva.length === 0) {
                rm.categorias_reserva[0].checked = true;
                rm.total_reservas = rm.res_listado_all.length;
            } else {
                var calculo = 0;
                angular.forEach(rm.filter_reserva, function(reserva) {
                    var idreserva = reserva.id;
                    //console.log(idreserva);
                    switch (idreserva) {
                        case 1:
                            calculo += rm.total_tweb;
                            break;
                        case 2:
                            calculo += rm.total_ttel;
                            break;
                        case 3:
                            calculo += rm.total_tpor;
                            break;
                        case 4:
                            calculo += rm.total_trp;
                            break;
                    }
                });
                rm.total_reservas = calculo;
            }

        };

        rm.selectReservation = function(reservation) {
            $scope.$apply(function() {
                $rootScope.$broadcast("floorEventEstablish", "sit", reservation);
                $rootScope.$broadcast("floorTablesSelected", reservation.tables);
                $rootScope.$broadcast("floorZoneIndexSelected", reservation.tables);
            });
        };

        rm.clearSelected = function() {
            $scope.$apply(function() {
                $rootScope.$broadcast("floorClearSelected");
            });
        };

        rm.editReservation = function(reservation) {
            var modalInstance = $uibModal.open({
                templateUrl: 'ModalEditReservation.html',
                controller: 'editReservationCtrl',
                controllerAs: 'er',
                size: '',
                resolve: {
                    content: function() {
                        return {
                            reservation: reservation
                        };
                    }
                }
            });
        };
    })
    .controller('waitlistController', function($rootScope, FloorFactory, ServerDataFactory) {
        var wm = this;

        //Limpiar data y estilos de servers
        FloorFactory.isEditServer(false);
        angular.element('.bg-window-floor').removeClass('drag-dispel');
        // angular.element('.table-zone').removeClass("selected-table");
        $rootScope.$broadcast("floorClearSelected");
        ServerDataFactory.cleanTableServerItems();

        wm.search = {
            show: true
        };
        wm.searchReservation = function() {
            wm.search.show = !wm.search.show;
        };
    })
    .controller('serverController', function($scope, $rootScope, $stateParams, $state, ServerFactory, ServerDataFactory, ColorFactory, FloorFactory, $timeout) {

        var sm = this;
        //Variable para manejo de panatalla nuevo y crear
        sm.flagServer = false;
        sm.id = "";
        sm.data = [];
        sm.tables = [];

        //Cargando data desde servicios: servidores, colores ocupados y todos los colores permitidos
        sm.servers = ServerDataFactory.getServerItems();
        sm.colorsSelect = uniqueArray(ServerDataFactory.getColorItems());
        sm.colors = ColorFactory.getColor();

        sm.btnAddServer = function() {
            sm.showForm = true;
            FloorFactory.isEditServer(true);
            angular.element('.bg-window-floor').addClass('drag-dispel');
        };

        //Obtener tablas seleccionadas del lienzo
        // var callListadoTable = function() {
        //     sm.listadoTablaServer = ServerDataFactory.getTableServerItems();
        //     // console.log(sm.listadoTablaServer);
        //     //console.log('Listado: ' + angular.toJson(sm.listadoTablaServer, true));
        //     $timeout(callListadoTable, 500);
        // };
        // callListadoTable();

        sm.btnEditServer = function(index, server) {

            sm.flagServer = true;
            sm.showForm = true;

            //Obtener tab marcado
            var firstTableId = parseInt(server.tables[0].id);
            var indiceZone = 0;

            var lstZonas = FloorFactory.getDataZonesTables();
            angular.forEach(lstZonas, function(zona, key) {
                var tables = zona.tables;
                //console.log(zona);
                angular.forEach(tables, function(table) {
                    //console.log(table);
                    if (table.id == firstTableId) {
                        indiceZone = key;
                        FloorFactory.setNavegationTabZone(indiceZone);
                        //console.log(key);
                    }
                });
            });

            $rootScope.$broadcast("floorZoneIndexSelected", server.tables);
            $rootScope.$broadcast("floorTablesSelected", server.tables);

            //Obtener table de cada server
            vTable = [];
            angular.forEach(server.tables, function(table) {
                var dataTable = {
                    color: server.color,
                    name: table.name,
                    id: table.id,
                };
                var element = angular.element('#el' + table.id);
                element.addClass("selected-table");
                vTable.push(dataTable);
            });

            ServerDataFactory.setTableServerItemsEdit(vTable);
            sm.listadoTablaServer = ServerDataFactory.getTableServerItems();
            //console.log('info' + angular.toJson(server, true));

            FloorFactory.isEditServer(true);

            angular.element('.bg-window-floor').addClass('drag-dispel');

            sm.name = server.name;
            sm.id = server.id;

            for (var i = 0; i < sm.colors.length; i++) {
                sm.colors[i].classSelect = "";
                if (sm.colors[i].colorHexadecimal === server.color) {
                    sm.color = server.color;
                    sm.colors[i].classSelect = "is-selected";
                }
            }
        };

        //Reiniciar variables utilizadas en pestaña server
        sm.btnCancelEditServer = function(server) {

            sm.flagServer = false;
            sm.showForm = false;
            sm.id = "";
            FloorFactory.isEditServer(false);

            limpiarData();

            // listadoTablaServer = ServerDataFactory.getTableServerItems();

            $rootScope.$broadcast("floorClearSelected");

            ServerDataFactory.cleanTableServerItems();

            angular.element('.bg-window-floor').removeClass('drag-dispel');
            $state.go('mesas.floor.server');
        };

        //Marcar color del listado de colores disponibles
        sm.selectColor = function(color) {

            sm.color = color.colorHexadecimal;
            var position = sm.colors.indexOf(color);
            for (var i = 0; i < sm.colors.length; i++) {
                sm.colors[i].classSelect = "";
            }
            sm.colors[position].classSelect = "is-selected";
            //console.log(sm.color);

        };

        //Botoncito X 
        sm.removeTable = function(item, data) {

            var element = angular.element('#el' + data.id);
            element.removeClass("selected-table");
            ServerDataFactory.delTableServerItemIndex(item);

        };

        var limpiarData = function() {
            sm.name = "";
            sm.color = "";
            for (var i = 0; i < sm.colors.length; i++) {
                sm.colors[i].classSelect = "";
            }

        };

        sm.saveOrUpdateServer = function() {

            /* Se construye la estructura de las mesas seleccionadas */
            //console.log('tables sel', angular.toJson(sm.listadoTablaServer, true));
            angular.forEach(sm.listadoTablaServer, function(mesa, i) {
                sm.tables.push({
                    id: mesa.id,
                    name: mesa.name
                });
            });

            if (sm.flagServer === false) { // Se Crea un server

                sm.data = {
                    name: sm.name,
                    color: sm.color,
                    tables: sm.tables
                };

                ServerFactory.addServer(sm.data).then(function(response) {
                    var mensaje = "";
                    if (response.data.response === false) {

                        mensaje = setearJsonError(response.data.jsonError);
                        messageAlert("Warning", mensaje, "warning", 3000);

                    } else if (response.data.success === true) {

                        mensaje = response.data.msg;
                        messageAlert("success", mensaje, "success", 3000);

                        //Actualizar elemento en array de servicio pasando id y data
                        ServerDataFactory.addServerItems(sm.data);
                        sm.servers = ServerDataFactory.getServerItems();

                        $state.go($state.current, {}, {
                            reload: true
                        });

                        limpiarData();
                        ServerDataFactory.cleanTableServerItems();

                    }

                });

            } else if (sm.flagServer === true) { // Se actualiza la data
                sm.data = {
                    id: sm.id,
                    name: sm.name,
                    color: sm.color,
                    tables: sm.tables
                };

                ServerFactory.updateServer(sm.data, sm.id).then(function(response) { // Se actualiza el server

                    var mensaje = "";
                    if (response.data.response === false) {
                        mensaje = setearJsonError(response.data.jsonError);
                        messageAlert("Warning", mensaje, "warning", 3000);
                    } else if (response.data.success === true) {
                        mensaje = response.data.msg;

                        //Actualizar elemento en array de servicio pasando id y data
                        ServerDataFactory.updateServerItems(sm.data);
                        sm.servers = ServerDataFactory.getServerItems();

                        //console.log('refrescado' + angular.toJson(sm.servers, true));
                        messageAlert("success", mensaje, "success", 3000);
                        $state.go('mesas.floor.server', {}, {
                            reload: true
                        });
                        sm.flagServer = false;
                        FloorFactory.isEditServer(false);
                        limpiarData();
                    } else if (response.data.success === false) {
                        mensaje = response.data.msg;
                        messageAlert("Warning", mensaje, "warning", 3000);
                    }

                });

            }

        };

        sm.btnDeleteServer = function() {

            ServerFactory.deleteServer(sm.id).then(function(response) {
                var mensaje = "";
                if (response.data.response === false) {
                    mensaje = setearJsonError(response.data.jsonError);
                    messageAlert("Warning", mensaje, "warning", 2000);
                } else if (response.data.success === true) {
                    mensaje = response.data.msg;

                    ServerDataFactory.delServerItem({
                        id: sm.id
                    });

                    messageAlert("success", mensaje, "success", 1000);

                    sm.flagServer = false;
                    limpiarData();
                    $state.go('mesas.floor.server', {}, {
                        reload: true
                    });
                } else if (response.data.success === false) {
                    mensaje = response.data.msg;
                    messageAlert("Warning", mensaje, "warning", 2000);
                }
            });

        };
    })
    .controller("editReservationCtrl", ["$rootScope", "$state", "$uibModalInstance", "content", "reservationService", "$q",
      function($rootScope, $state, $uibModalInstance, content, service, $q) {

        var er = this;

        er.sumar = function(guest) {
            var total = er.reservation.guests.total;
            if (total + 1 <= er.reservation.covers) {
                er.reservation.guests[guest]++;
                totalGuests();
            }
        };

        er.restar = function(guest) {
            var quantity = er.reservation.guests[guest];
            if (quantity - 1 >= 0) {
                er.reservation.guests[guest]--;
                totalGuests();
            }
        };

        var totalGuests = function() {
            er.reservation.guests.total = er.reservation.guests.men +  er.reservation.guests.women + er.reservation.guests.children;
        };

        function parseData(reservation) {
            var men = 0;
            var women = 0;
            var children = 0;
            if (er.configuration.status_people_1) {
                men = reservation.num_people_1 || 0;
            }
            if (er.configuration.status_people_2) {
                women = reservation.num_people_2 || 0;
            }
            if (er.configuration.status_people_3) {
                children = reservation.num_people_3 || 0;
            }
            er.reservation = {
                id: reservation.reservation_id,
                covers: reservation.num_people,
                status_id: reservation.res_reservation_status_id,
                server_id: reservation.res_server_id,
                note: reservation.note || null,
                guests: {
                   men: men,
                   women: women,
                   children: children
                }
            };

            totalGuests();
        }

        function parseInfo(reservation) {
            er.info = {
                first_name: reservation.first_name,
                last_name: reservation.last_name,
                date: moment(reservation.start_date).format("dddd, d [de] MMMM"),
                time: moment(reservation.start_time, "HH:mm:ss").format("H:mm A"),
                tables: getTables(reservation.tables)
            };
        }

        function getTables(tables) {
            var reservationTables = "";
            angular.forEach(tables, function(table) {
                reservationTables += table.name + ", ";
            });

            return reservationTables.substring(0, reservationTables.length - 2);
        }

        var listGuest = function() {
            var deferred = $q.defer();
            service.getGuest()
                .then(function(guests) {
                    er.covers = guests;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        var listStatuses = function() {
            var deferred = $q.defer();
            service.getStatuses()
                .then(function(response) {
                    er.statuses = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        var listServers = function() {
            var deferred = $q.defer();
            service.getServers()
                .then(function(response) {
                    er.servers = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        var loadConfiguration = function() {
            var deferred = $q.defer();
            service.getConfigurationRes()
                .then(function(response) {
                    er.configuration = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                }).finally(function() {
                    deferred.resolve();
                });

            return deferred.promise;
        };

        er.reservationEditAll = function() {
            $uibModalInstance.dismiss('cancel');
            $state.go('mesas.reservation-edit', {
                id: er.reservation.id,
                date: moment().format("YYYY-MM-DD")
            });
        };

        er.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        er.save = function() {
            var id = er.reservation.id;
            service.quickEdit(id, er.reservation)
                .then(function(response) {
                    $rootScope.$broadcast("floorReload");
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.apiError(error);
                });
        };

        er.cancelReservation = function() {
            message.confirm("¿ Esta seguro de cencelar la reservacion ?", "Esta accion se puede revertir", function() {
                er.waitingResponse = true;
                var id = er.reservation.id;
                service.cancel(id)
                    .then(function(response) {
                        $rootScope.$broadcast("floorReload");
                        message.success(response.data.msg);
                        $uibModalInstance.dismiss('cancel');
                        er.waitingResponse = false;
                    }).catch(function(error) {
                        message.apiError(error);
                        er.waitingResponse = false;
                    });
            });
        };

        function listResource() {
            return $q.all([
                listGuest(),
                listStatuses(),
                listServers(),
                loadConfiguration()
            ]);
        }

        (function Init() {
            listResource().then(function() {
                parseInfo(content.reservation);
                parseData(content.reservation);
            });
        })();

        console.log(content.reservation);
    }]);