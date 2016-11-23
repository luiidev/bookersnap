angular.module('floor.controller')
    .controller('FloorCtrl', function($scope, $timeout, $q, $uibModal, $state, reservationHelper, reservationService, FloorFactory,
        ServerDataFactory, $table, $window, screenHelper, screenSizeFloor, global, TypeFilterDataFactory, FloorDataFactory) {

        var vm = this;

        /**
         * Fecha Actual
         * @type {date}
         */
        var fecha_actual = getFechaActual();

        /**
         * Fecha Actual
         * @type {date}
         */
        vm.fecha_actual = fecha_actual;

        vm.typeTurns = [];

        /**
         * Variables de manejo general de informacion
         */
        vm.zones = global.lienzo;
        var reservations = global.reservations;
        var servers = global.servers;
        var blocks = [];
        var zones = [];
        /**
         * END Variables de manejo general de informacion
         */

        /**
         * Accion que debe realizarse al soltar un elemento en una tabla
         * @type {Object}
         */
        var eventEstablished = {};

        /**
         * Variable de apoyo para saber que evento ejecutar en arrastre de objeto a un mesa
         */
        vm.titulo = "Floor";

        vm.flagSelectedZone = 0;

        //Notas turnos
        vm.notesBox = false;
        vm.notesBoxValida = false;
        vm.notesData = {
            texto: '',
            res_type_turn_id: ''
        };
        // vm.notesNotify = false; //se activa cuando llega notificaciones de notas
        vm.notesSave = false; // se activa cuando creamos notas

        var timeoutNotes;
        var openNotesTimeOut;

        $scope.$on("floorNotesReload", function(evt, note) {
            if (!reservationService.blackList.contains(note.key)) {
                angular.forEach(vm.typeTurns, function(typeTurn) {
                    if (typeTurn.turn) {
                        if (note.data.res_type_turn_id == typeTurn.turn.res_type_turn_id) {
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

        $scope.$on("floorZoneIndexSelected", function(evt, tables) {
            // var index = $table.getZoneIndexForTable(vm.zones.data, tables);
            // if (index !== null) vm.tabSelectedZone(index);
            vm.findTableForServer(tables);
        });

        $scope.$on("NotifyFloorBlock", function(evt, data) {
            var blockTest = FloorFactory.parseDataBlock(data.data);
            FloorFactory.asingBlockTables(blockTest, vm.zones.data);

            var blockParsear = FloorFactory.parseDataBloqueos(data.data);
            FloorFactory.addServicioReservacionesAndBloqueos(blockParsear);
            $scope.$apply();
            alertMultiple("Bloqueos: ", data.user_msg, "inverse", null, 'top', 'left', 10000, 20, 150);
            // console.log("NotifyFloorBlock " + angular.toJson(data, true));
        });

        $scope.$on("floorReload", function(evt, data, action) {
            if (action == "update") {
                reservations.update(data);
            } else if (action == "add") {
                reservations.add(data);
            }
        });

        vm.eventEstablish = function(eventDrop, data) {
            eventEstablished.event = eventDrop;
            eventEstablished.data = data;
        };

        vm.findTableForServer = function(tables) {
            var zones = vm.zones.data.getZoneForTables(tables);
            var index = zones.length ? zones[0].index : 0;
            vm.tabSelectedZone(index);
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
                },
                function error(error) {
                    message.apiError(error);
                }
            );
        };

        // var loadServersCtrl = function(servers) {
        //     ServerDataFactory.setServerItems(servers);

        //     angular.forEach(servers, function(server, m) {
        //         ServerDataFactory.setColorItems(server.color);
        //     });
        // };

        // var listSourceTypes = function() {
        //     FloorDataFactory.getSourceTypes().then(function success(response) {
        //         TypeFilterDataFactory.setSourceTypesItems(response.data.data);
        //     }, function error(error) {
        //         message.apiError(error);
        //     });
        // };

        // var listStatuses = function() {
        //     var deferred = $q.defer();
        //     reservationService.getStatuses().then(function(response) {
        //         //vm.statuses = response.data.data;
        //         //console.log(vm.statuses);
        //         TypeFilterDataFactory.setStatusTypesItems(response.data.data);
        //     }).catch(function(error) {
        //         message.apiError(error);
        //     }).finally(function() {
        //         deferred.resolve();
        //     });

        //     return deferred.promise;
        // };

        // var loadBlocks = function() {
        //     FloorFactory.getBlocks().then(
        //         function success(response) {
        //             blocks = response;
        //             FloorFactory.asingBlockTables(blocks, vm.zones.data);
        //             $table.setBorderColorForReservation(vm.zones.data, blocks);
        //             //console.log(angular.toJson(blocks, true));
        //         },
        //         function error(response) {
        //             message.apiError(response, "No se pudo cargar las reservaciones");
        //         }
        //     );
        // };

        // var loadReservations = function() {

        //     FloorFactory.getReservations()
        //         .then(function(response) {
        //             reservations = response;
        //             //FloorFactory.setServicioReservaciones(response);
        //             //$rootScope.$broadcast("saveReservations", response);
        //             //console.log('Listado de reservaciones', angular.toJson(reservations, true));
        //         }).catch(function(error) {
        //             message.apiError(error, "No se pudo cargar las reservaciones");
        //         });

        // };

        // var loadBlocksReservationsServers = function() {
        //     //return $q.all([loadBlocks(), loadReservations()]);
        //     loadReservations();
        //     loadBlocks();
        //     loadServers();
        // };

        // var loadZones = function(date, reload) {
        //     FloorFactory.getZones(date, reload).then(
        //         function success(response) {

        //             zones = response;
        //             vm.zones.data = reservationHelper.loadTable(zones);
        //             FloorFactory.setDataZonesTables(zones);
        //             reloadFloor();
        //             //console.log(angular.toJson(vm.zones.data, true));
        //         },
        //         function error(response) {
        //             console.error(response);
        //         }
        //     );

        // };

        /**
         * Nuevo modulo de carga de zonas|tablas
         */
        $scope.$on("floorEventEstablish", function(evt, eventDrop, data) {
            vm.eventEstablish(eventDrop, data);
        });

        $scope.$on("floorTablesSelected", function(evt, tables) {
            vm.zones.data.tablesSelected(tables);
        });

        $scope.$on("floorClearSelected", function() {
            if (vm.zones.data.clearSelected) vm.zones.data.clearSelected();
        });

        var loadZones = function(date) {
            var deferred = $q.defer();

            reservationService.getZones(date)
                .then(function(response) {
                    zones.data = response.data.data;
                    deferred.resolve(zones.data);
                }).catch(function(error) {
                    message.apiError(error);
                });

            return deferred.promise;
        };

        var loadBlocks = function(date) {
            var deferred = $q.defer();

            reservationService.getBlocks(date)
                .then(function(response) {
                    blocks.data = response.data.data;
                    deferred.resolve(blocks.data);
                }).catch(function(error) {
                    message.apiError(error);
                });

            return deferred.promise;
        };

        var loadReservations = function() {
            var deferred = $q.defer();

            reservationService.getReservations(true)
                .then(function(response) {
                    reservations.data = response.data.data;
                    deferred.resolve(reservations.data);
                }).catch(function(error) {
                    message.apiError(error, "No se pudo cargar las reservaciones");
                });

            return deferred.promise;
        };

        var loadServers = function() {
            var deferred = $q.defer();

            reservationService.getServers(true)
                .then(function(response) {
                    servers.data = response.data.data;
                    deferred.resolve(servers.data);
                }).catch(function(error) {
                    message.apiError(error);
                });

            return deferred.promise;
        };

        var InitModule = function() {
            var date = fecha_actual;
            $q.all([
                loadZones(date),
                loadBlocks(date),
                loadReservations(),
                loadServers(),
                FloorDataFactory.getSourceTypes()
            ]).then(function(data) {
                loadTablesEdit(data[0], data[1], data[2], data[3]);

                showTimeCustom();

            });
        };

        var showTimeCustom = function() {
            var tActive = $table.lastTimeEvent();
            if (tActive) vm.zones.data.tActive = tActive;
        };

        var loadTablesEdit = function(zones, blocks, reservations, servers) {
            vm.zones.data = reservationHelper.loadTableV2(zones, [{
                name: "blocks",
                data: blocks
            }, {
                name: "reservations",
                data: reservations
            }, {
                name: "servers",
                data: servers
            }]);
        };

        /**
         * Filtro y muestra de caja de tiempo
         */
        vm.hideTimes = function() {
            $table.lastTimeEvent("reset");
            vm.zones.data.tActive = null;
        };

        vm.showTimeCustom = function(event) {
            $table.setTimeEvent(event);
            vm.zones.data.tActive = event;
        };
        /**
         * END
         */

        vm.tablesSelected = function(table) {
            var tables = table.reservations.active.tables;
            vm.zones.data.tablesSelected(tables);
            $scope.$apply();
        };

        vm.clearSelected = function() {
            vm.zones.data.clearSelected();
            $scope.$apply();
        };

        /**
         * Filtro de mesas recomendas, bloquedas
         * y ocupadas en el rango de hora que se
         * pretende ocupar
         */
        vm.tableFilter = function(num) {
            vm.filter = true;
            vm.zones.data.tableFilter(num);
            $scope.$apply();
        };

        vm.tableFilterClear = function() {
            vm.filter = false;
            vm.zones.data.tableFilterClear();
            $scope.$apply();
        };
        /**
         * END
         */

        /**
         * Cambio de de mesa de una reservacion
         */
        var changeTable = function(table) {
            var dropTable = eventEstablished.data;
            if (dropTable.id != table.id) {
                var id = dropTable.reservations.active.id;
                var data = {
                    table_id: table.id
                };

                reservationService.blackList.key(data);

                reservationService.sit(id, data)
                    .then(function(response) {
                        reservations.update(response.data.data);
                    }).catch(function(error) {
                        message.apiError(error);
                    });
            }
        };

        /**
         * Eventos de Web Socket
         */
        var reservationEvents = {};
        reservationEvents.update = function(data) {
            reservations.update(data);
        };
        reservationEvents.create = function(data) {
            reservations.add(data);
        };

        var serverEvents = {};
        serverEvents.update = function(data) {
            servers.update(data);
        };
        serverEvents.create = function(data) {
            servers.add(data);
        };
        serverEvents.delete = function(data) {
            servers.delete(data);
        };
        /**
         * END
         */

        $scope.$on("NotifyFloorTableReservationReload", function(evt, data) {
            if (!reservationService.blackList.contains(data.key)) {
                if (typeof reservationEvents[data.action] == "function") {
                    reservationEvents[data.action](data.data);
                    if (data.user_msg) alertMultiple("Notificación: ", data.user_msg, "inverse", null, 'top', 'left', 5000, 20, 150);
                    $scope.$apply();
                }
            }
        });

        $scope.$on("NotifyFloorTableServerReload", function(evt, data) {
            if (!reservationService.blackList.contains(data.key)) {
                if (typeof serverEvents[data.action] == "function") {
                    serverEvents[data.action](data.data);
                    $scope.$apply();
                }
            }
        });
        /**
         * END Nuevo Modulo
         */

        vm.mostrarDetail = function(index, table) {
            var estado = FloorFactory.isEditServer();
            if (estado === false) {
                modalInstancesDetail(index, table);
            } else {
                storeTables(index, table);
            }
        };

        function modalInstancesDetail(index, table) {
            var modalInstance = $uibModal.open({
                templateUrl: 'myModalContentDetail.html',
                controller: 'DetailInstanceCtrl',
                controllerAs: 'vmd',
                size: '',
                resolve: {
                    content: function() {
                        return {
                            zoneName: vm.zones.data[index].name,
                            table: table,
                        };
                    }
                }
            });
        }

        vm.handConfiguration = function(obj) {

            if (eventEstablished.event == "changeTable") {
                return changeTable(obj);
            }

            //Preguntar si abrir ventana o guardar directamente
            vm.cantidades = {
                men: vm.numpeople.num_men,
                women: vm.numpeople.num_women,
                children: vm.numpeople.num_children,
                total: vm.numpeople.total
            };

            if (vm.configuracion.status_people_1 === 0 &&
                vm.configuracion.status_people_2 === 0 &&
                vm.configuracion.status_people_3 === 0) {

                if (eventEstablished.event == "sit") {
                    sit(obj);
                } else if (eventEstablished.event == "create") {
                    create(obj);
                }

            } else {
                modalInstancesConfiguration(vm.cantidades, obj, vm.configuracion);
            }

        };

        var parseReservation = function(obj) {
            var now = moment();
            var date = now.format("YYYY-MM-DD");
            var start_time = now.clone().add(-(now.minutes() % 15), "minutes").second(0).format("HH:mm:ss");
            return {
                table_id: obj.id,
                guests: {
                    men: 0,
                    women: 0,
                    children: 0,
                    total: vm.cantidades.total
                },
                date: date,
                hour: start_time
            };
        };

        var create = function(obj) {
            var reservation = parseReservation(obj);

            reservationService.quickCreate(reservation)
                .then(function(response) {
                    reservations.add(response.data.data);
                }).catch(function(error) {
                    message.apiError(error);
                });
        };

        var sit = function(obj) {
            var id = eventEstablished.data.reservation_id;
            var reservation = parseReservation(obj);
            reservationService.sit(id, reservation)
                .then(function(response) {
                    reservations.update(response.data.data);
                }).catch(function(error) {
                    message.apiError(error);
                });
        };

        function modalInstancesConfiguration(cantidades, obj, config) {
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
                    config: function() {
                        return config;
                    },
                    eventEstablished: function() {
                        return eventEstablished;
                    }
                }
            });
        }

        function storeTables(num, table) {
            table.selected = !table.selected;

            if (!table.selected) {
                ServerDataFactory.delTableServerItem(table);
            } else {
                ServerDataFactory.setTableServerItems(table);
            }
        }

        var sizeLienzo = function() {
            vm.size = screenHelper.size(screenSizeFloor);
            vm.fontSize = (14 * vm.size / screenSizeFloor.minSize + "px");
        };

        vm.readNotes = function(notification) {
            vm.notesBoxValida = true;
            vm.notesNotification = false;
        };

        vm.listenNotes = function(notification) {
            vm.notesBoxValida = false;
            vm.notesNotification = false;
        };

        vm.saveNotes = function(turn) {
            if (timeoutNotes) $timeout.cancel(timeoutNotes);
            vm.notesData.id = turn.notes.id;
            vm.notesData.res_type_turn_id = turn.id;
            vm.notesData.texto = turn.notes.texto;
            vm.notesData.date_add = turn.notes.date_add;

            reservationService.blackList.key(vm.notesData);

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

        // $scope.$on("NotifyFloorNotesReload", function(evt, data) {
        //     if (!vm.notesBox) {
        //         vm.notesNotify = true;
        //         vm.notesNotification = true;

        //     }
        //     listTypeTurns();
        // });

        var loadConfigurationPeople = function() {
            FloorFactory.getConfiguracionPeople().then(function(response) {
                vm.configuracion = {
                    status_people_1: response.status_people_1,
                    status_people_2: response.status_people_2,
                    status_people_3: response.status_people_3,
                };
                //console.log("Configuracion: " + angular.toJson(vm.configuracion, true));
            });
        };

        $scope.$on("NotifyFloorConfigUpdateReload", function(evt, message) {
            alert(message + " Se requiere volver a cargar la página.");
            $window.location.reload();
        });

        var init = function() {
            InitModule();
            listTypeTurns();
            sizeLienzo();
            // closeNotes();
            loadConfigurationPeople();
        };

        init();
    })
    //POPUP CONFIGURACION DE PERSONAS (HOMBRES, MUJHERS Y NIÑOS)
    .controller('ConfigurationInstanceCtrl', function($uibModalInstance, num, table, config, eventEstablished, OperationFactory, reservationService, $rootScope) {
        var vmc = this;

        //Datos pasados al modal
        vmc.numperson = num;
        vmc.table = table;
        vmc.config = config;

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
                    children: vmc.flagSelectedNumChildren
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

            reservationService.blackList.key(reservation);

            reservationService.quickCreate(reservation)
                .then(function(response) {
                    $rootScope.$broadcast("floorReload", response.data.data, "add");
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.apiError(error);
                    vmc.waitingResponse = false;
                });
        };

        var sit = function() {
            vmc.waitingResponse = true;

            var id = eventEstablished.data.id;
            var data = {
                table_id: table.id,
                guests: {
                    men: vmc.flagSelectedNumMen,
                    women: vmc.flagSelectedNumWomen,
                    children: vmc.flagSelectedNumChildren
                },
            };

            reservationService.blackList.key(data);

            reservationService.sit(id, data)
                .then(function(response) {
                    $rootScope.$broadcast("floorReload", response.data.data, "update");
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.apiError(error);
                    vmc.waitingResponse = false;
                });
        };
    })
    .controller('DetailInstanceCtrl', function($scope, $rootScope, $uibModalInstance, $uibModal, content, FloorFactory, reservationService, $state, $table, $q) {
        var vmd = this;

        /**
         * Tags de reservacion
         * @type {Array}
         */
        vmd.tags = [];

        /**
         * Tags de reservacion seleccionados
         * @type {Object}
         */
        vmd.selectTags = {};

        vmd.itemZona = {
            name_zona: content.zoneName,
            name: content.table.name
        };

        vmd.reservations = content.table.reservations;
        vmd.blocks = content.table.blocks;
        vmd.reservation = {};

        vmd.reservationEditAll = function() {
            $uibModalInstance.dismiss('cancel');
            $state.go('mesas.reservation-edit', {
                id: vmd.reservation.id,
                date: getFechaActual()
            });
        };

        var originalReservation = {};
        vmd.reservationEdit = function(reservation) {
            resetTags();
            originalReservation = reservation;
            listResource().then(function() {
                parseData(reservation);
                paintTags(reservation.tags);
            });

            vmd.EditContent = true;
        };

        vmd.infoName = function() {
            var first_name = originalReservation.guest ? originalReservation.guest.first_name : "Reservacion sin nombre";
            var last_name = originalReservation.guest ? originalReservation.guest.last_name : "";
            return first_name + " " + last_name;
        };
        vmd.infoDate = function() {
            return moment(originalReservation.date_reservation).format("dddd, d [de] MMMM");
        };
        vmd.infoTime = function() {
            return moment(originalReservation.hours_reservation, "HH:mm:ss").format("H:mm A");
        };
        vmd.infoTables = function() {
            return getTables(originalReservation.tables);
        };

        function getTables(tables) {
            var reservationTables = "";
            angular.forEach(tables, function(table) {
                reservationTables += table.name + ", ";
            });

            return reservationTables.substring(0, reservationTables.length - 2);
        }

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
                id: reservation.id,
                covers: reservation.num_guest,
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

        function listResource() {
            return $q.all([
                listGuest(),
                listStatuses(),
                listServers(),
                loadConfiguration(),
                listReservationTags()
            ]);
        }

        vmd.sumar = function(guest) {
            vmd.reservation.guests[guest]++;
            totalGuests();
        };

        vmd.restar = function(guest) {
            var quantity = vmd.reservation.guests[guest];
            if (quantity - 1 >= 0) {
                vmd.reservation.guests[guest]--;
                totalGuests();
            }
        };

        var totalGuests = function() {
            vmd.reservation.guests.total = vmd.reservation.guests.men + vmd.reservation.guests.women + vmd.reservation.guests.children;
        };

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

        var listReservationTags = function() {
            var deferred = $q.defer();

            reservationService.getReservationTags()
                .then(function(response) {
                    vmd.tags = response.data.data;
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

            ///////////////////////////////////////////////////////////////
            // parse reservation.tags
            ///////////////////////////////////////////////////////////////
            vmd.reservation.tags = [];
            vmd.reservation.tags = Object.keys(vmd.selectTags).reduce(function(result, value) {
                result.push(parseInt(value));
                return result;
            }, []);

            reservationService.blackList.key(vmd.reservation);

            reservationService.quickEdit(id, vmd.reservation)
                .then(function(response) {
                    $rootScope.$broadcast("floorReload", response.data.data, "update");
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

                reservationService.blackList.key();

                reservationService.cancel(id, {
                        key: key
                    })
                    .then(function(response) {
                        $rootScope.$broadcast("floorReload", response.data.data, "update");
                        message.success(response.data.msg);
                        $uibModalInstance.dismiss('cancel');
                        vmd.waitingResponse = false;
                    }).catch(function(error) {
                        message.apiError(error);
                        vmd.waitingResponse = false;
                    });
            });
        };

        vmd.redirect = function() {
            $uibModalInstance.dismiss('cancel');
            var fecha_actual = getFechaActual();
            $state.go("mesas.reservation-new", {
                date: fecha_actual,
                tables: [{
                    id: content.table.id
                }]
            });
        };

        /**
         * Select tags
         */
        vmd.addTag = function(tag) {
            tag.checked = !tag.checked;
            listTagsSelected();
        };

        var listTagsSelected = function() {
            angular.forEach(vmd.tags, function(tag) {
                if (tag.checked) {
                    vmd.selectTags[tag.id] = angular.copy(tag);
                } else {
                    delete vmd.selectTags[tag.id];
                }
            });
        };

        var paintTags = function(tags) {
            angular.forEach(tags, function(tagInUse) {
                angular.forEach(vmd.tags, function(tag) {
                    if (tag.id == tagInUse.id) {
                        tag.checked = true;
                    }
                });
            });

            listTagsSelected();
        };

        var resetTags = function() {
            vmd.selectTags = {};
            angular.forEach(vmd.tags, function(tag) {
                tag.checked = false;
            });
        };
        /**
         * END Select tags
         */
    });