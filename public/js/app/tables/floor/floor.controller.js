angular.module('floor.controller', [])
.controller('FloorCtrl', function($scope, $rootScope, $timeout, $q, $uibModal, $state, reservationHelper, reservationService, TypeTurnFactory,
        FloorFactory, FloorDataFactory, ServerDataFactory, $table, $window, screenHelper, screenSizeFloor, TypeFilterDataFactory, ServerNotification) {

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
        vm.zones = [];
        vm.reservations = {};
        var blocks = [];
        var servers = [];
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
         * Lista negra de eventos de WS que no deben ejecutarse,
         * por que el usuario actual es quien las emitio
         * @type {object}
         */
        var blackList = {};
        blackList.data = [];

        blackList.add = function (key) {
          this.data.push(key);
        };

        blackList.contains = function(key) {
          return this.data.indexOf(key) !== -1;
        };

        $scope.$on("blackList.add", function(evt, key) {
          blackList.add(key);
        });
        /**
         * END
         */

        ////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Funcion de actualizacion de objeco
         */
        vm.reservations.update =  function(data, apply) {
             angular.forEach(this.data, function(reservation) {
                angular .forEach(data, function(obj_data) {
                    if (reservation.id == obj_data.id) {
                        angular.forEach(vm.zones.tables, function(table) {
                            angular.forEach(reservation.tables, function(obj_table) {
                                if (table.id == obj_table.id) {
                                    table.reservations.remove(reservation);
                                }
                            });
                        });
                        angular.forEach(obj_data, function(value, index) {
                            reservation[index] = value;
                        });
                        angular.forEach(vm.zones.tables, function(table) {
                            angular.forEach(reservation.tables, function(obj_table) {
                                if (table.id == obj_table.id) {
                                    table.reservations.add(reservation);
                                }
                            });
                        });
                    }
                });
             });

             if (apply) $scope.$apply();
        };
        vm.reservations.add =  function(reservation, apply) {
              vm.reservations.data.push(reservation);
              angular.forEach(vm.zones.tables, function(table) {
                  angular.forEach(reservation.tables, function(obj_table) {
                      if (table.id == obj_table.id) {
                          table.reservations.add(reservation);
                      }
                  });
              });

             if (apply) $scope.$apply();
        };
        /**
         * END
         */
         ////////////////////////////////////////////////////////////////////////////////////////////

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

        vm.typeTurns = [];

        $scope.$on("floorNotesReload", function(mote) {
            vm.notes = note;
        });

        $scope.$on("floorZoneIndexSelected", function(evt, tables) {
            var index = $table.getZoneIndexForTable(vm.zones, tables);
            if (index !== null) vm.tabSelectedZone(index);
        });

        $scope.$on("NotifyFloorBlock", function(evt, data) {
            var blockTest = FloorFactory.parseDataBlock(data.data);
            FloorFactory.asingBlockTables(blockTest, vm.zones);

            var blockParsear = FloorFactory.parseDataBloqueos(data.data);
            FloorFactory.addServicioReservacionesAndBloqueos(blockParsear);

            alertMultiple("Bloqueos: ", data.user_msg, "inverse", null, 'top', 'left', 10000, 20, 150);
            console.log("NotifyFloorBlock " + angular.toJson(data, true));
        });

        $scope.$on("floorReload", function(evt, data, action) {
              if (action == "update") {
                vm.reservations.update(data);
              } else if (action == "add") {
                vm.reservations.add(data);
              }
        });

        vm.eventEstablish = function(eventDrop, data) {
            eventEstablished.event = eventDrop;
            eventEstablished.data = data;
        };

        vm.findTableForServer = function(tables) {
            var index = $table.getZoneIndexForTable(vm.zones, tables);
            if (index !== null) vm.tabSelectedZone(index);
        };

        vm.tabSelectedZone = function(value) {
            FloorFactory.setNavegationTabZone(value);
            vm.flagSelectedZone = value;
        };

        // var listTypeTurns = function() {
        //     FloorFactory.listTurnosActivos(vm.fecha_actual).then(
        //         function success(response) {
        //             vm.typeTurns = response;
        //             TypeFilterDataFactory.setTypeTurnItems(response);
        //         },
        //         function error(error) {
        //             message.apiError(error);
        //         }
        //     );
        // };

        // var loadServers = function() {
        //     FloorFactory.getServers().then(function success(response) {
        //             servers = response;
        //             $table.setColorTable(vm.zones, servers);
        //             //ServerDataFactory.setServerItems(servers);
        //             //console.log('Servidores' + angular.toJson(servers, true));
        //             // Se cargan los colores que ya fueron asignados  
        //             angular.forEach(servers, function(server, m) {
        //                 ServerDataFactory.setColorItems(server.color);
        //             });
        //             //console.log(angular.toJson(vm.zones, true));
        //         },
        //         function error(response) {
        //             console.error(response);
        //         }
        //     );
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
        //             FloorFactory.asingBlockTables(blocks, vm.zones);
        //             $table.setBorderColorForReservation(vm.zones, blocks);
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
        //             vm.zones = reservationHelper.loadTable(zones);
        //             FloorFactory.setDataZonesTables(zones);
        //             reloadFloor();
        //             //console.log(angular.toJson(vm.zones, true));
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
           vm.zones.tablesSelected(tables);
       });

       $scope.$on("floorClearSelected", function() {
           if (vm.zones.clearSelected) vm.zones.clearSelected();
       });

        var loadZones2 = function(date) {
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

        var loadBlocks2 = function(date) {
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

        var loadReservations2 = function() {
            var deferred = $q.defer();

            reservationService.getReservations(true)
                .then(function(response) {
                    vm.reservations.data = response.data.data;
                    deferred.resolve(vm.reservations.data);
                }).catch(function(error) {
                    message.apiError(error, "No se pudo cargar las reservaciones");
                });

            return deferred.promise;
        };

        var loadServers2 = function() {
           var deferred = $q.defer();

            FloorFactory.getServers()
               .then(function (response) {
                    servers = response;
                    deferred.resolve(servers);
                }).catch(function (error) {
                    message.apiError(error);
                }
            );

           return deferred.promise;
        };

       var InitModule = function() {
           var date = fecha_actual;
           $q.all([
               loadZones2(date),
               loadBlocks2(date),
               loadReservations2(),
               loadServers2(),
               // listGuest(),
               // listServers(),
               // listStatuses(),
           ]).then(function(data) {
               loadTablesEdit(data[0], data[1], data[2], data[3]);

               showTimeCustom();
           });
       };

       var showTimeCustom = function() {
           var tActive = $table.lastTimeEvent();
           if (tActive) vm.zones.tActive = tActive;
       };

       $scope.$watch("zones", true);

       var loadTablesEdit = function(zones, blocks, reservations, servers) {
           vm.zones = reservationHelper.loadTableV2(zones, 
               [
                   {name: "blocks", data: blocks},
                   {name: "reservations", data: reservations},
                   {name: "setColorTables", data: servers}
               ]);
           console.log(vm.zones);
       };

       /**
        * Filtro y muestra de caja de tiempo
        */
       vm.hideTimes = function() {
           $table.lastTimeEvent("reset");
           vm.zones.tActive = null;
       };

       vm.showTimeCustom = function(event) {
           $table.setTimeEvent(event);
           vm.zones.tActive = event;
       };
       /**
        * END
        */

       vm.tablesSelected = function(table) {
           var tables = table.reservations.active.tables;
           vm.zones.tablesSelected(tables);
           $scope.$apply();
       };

       vm.clearSelected = function() {
           vm.zones.clearSelected();
           $scope.$apply();
       };

       /**
        * Filtro de mesas recomendas, bloquedas
        * y ocupadas en el rango de hora que se
        * pretende ocupar
        */
       vm.tableFilter = function(num) {
           vm.filter = true;
           vm.zones.tableFilter(num);
           $scope.$apply();
       };

       vm.tableFilterClear = function() {
           vm.filter = false;
           vm.zones.tableFilterClear();
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
                var key = reservationService.key();
                blackList.add(key);
                data.key  = key;
                reservationService.sit(id, data)
                   .then(function(response) {
                       vm.reservations.update(response.data.data);
                   }).catch(function(error) {
                       message.apiError(error);
                   });
            }
        };

        /**
         * Eventos de Web Socket
         */
        var events = {};
        events.update = function(data) {
             vm.reservations.update(data, true);
        };

        events.create = function(data) {
            vm.reservations.add(data, true);
        };
        /**
         * END
         */

        $scope.$on("NotifyFloorTableReservationReload", function(evt, data) {
            if ( !blackList.contains(data.key) ) {
              if (typeof events[data.action] == "function") {
                  events[data.action](data.data);
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
                            zoneName: vm.zones[index].name,
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
                 sit();
               } else if (eventEstablished.event == "create") {
                 create();
               }

            } else {
                modalInstancesConfiguration(vm.cantidades, obj, vm.configuracion);
            }

        };

        var parseReservation = function() {
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

        var create = function() {
          var reservation = parseReservation();

          reservationService.quickCreate(reservation)
            .then(function(response) {
              $rootScope.$broadcast("floorReload", "add");
            }).catch(function(error) {
              message.apiError(error);
            });
        };

        var sit = function() {
          var id = eventEstablished.data.reservation_id;
          var reservation = parseReservation();
          reservationService.sit(id, reservation)
            .then(function(response) {
              $rootScope.$broadcast("floorReload", "update");
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

        $scope.$on("NotifyFloorNotesReload", function(evt, data) {
            if (!vm.notesBox) {
                vm.notesNotify = true;
                vm.notesNotification = true;
                listTypeTurns();
            }
        });

        $scope.$on("NotifyFloorConfigUpdateReload", function(evt, data) {
            messageAlert("Info", data.user_msg, "info", 2000, true);
            $state.reload();
        });

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

        var init = function() {

            InitModule();
            // listTypeTurns();
            sizeLienzo();
            closeNotes();
            // listSourceTypes();
            // listStatuses();
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

            var key = reservationService.key();
            $rootScope.$broadcast("blackList.add", key);
            reservation.key  = key;

            reservationService.quickCreate(reservation)
                .then(function(response) {
                    table.reservations.add(response.data.data);
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

            var key = reservationService.key();
            $rootScope.$broadcast("blackList.add", key);
            data.key  = key;

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
            originalReservation= reservation;
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

            var key = reservationService.key();
            $rootScope.$broadcast("blackList.add", key);
            vmd.reservation.key  = key;

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

                var key = reservationService.key();
                $rootScope.$broadcast("blackList.add", key);

                reservationService.cancel(id, {key: key})
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
          $state.go("mesas.reservation-new", {date: fecha_actual, tables: [ {id: content.table.id }] });
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
    })
    //Reservaciones
    .controller('reservationController', function($scope, $rootScope, $uibModal, $timeout, FloorFactory, ServerDataFactory, TypeFilterDataFactory, FloorDataFactory) {
        var rm = this;

        var fecha_actual = getFechaActual();
        var colection_filtro_visitas = TypeFilterDataFactory.getOpcionesFilterVisitas();
        rm.fecha_actual = fecha_actual;

        rm.search = {
            show: true
        };
        rm.searchReservation = function() {
            rm.search.show = !rm.search.show;
            rm.busqueda = "";
        };

        //Validar open modal Mail Reservation
        var modalMailReservation = null;

        $rootScope.$broadcast("floorClearSelected");

        var defaultOptionsFilters = function() {
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
        };



        var getColectionReservation = function() {

            FloorFactory.getConfiguracionPeople().then(function(response) {
                rm.configuracion = {
                    status_people_1: response.status_people_1,
                    status_people_2: response.status_people_2,
                    status_people_3: response.status_people_3,
                };
                //console.log("Configuracion: " + angular.toJson(rm.configuracion, true));
            });

            FloorFactory.getServicioReservaciones().then(function(response) {

                rm.res_listado_all = response;

                var total = 0;
                var men = 0;
                var women = 0;
                var children = 0;
                var tWeb = 0;
                var tTel = 0;
                var tPor = 0;
                var tRp = 0;

                rm.res_listado = rm.res_listado_all;

                //console.log(angular.toJson(rm.res_listado, true));
                angular.forEach(rm.res_listado_all, function(people) {
                    if (people.reservation_id) {

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
                rm.total_reservas = rm.total_tweb + rm.total_ttel + rm.total_tpor + rm.total_trp;

            });

            FloorFactory.getBlocksForReservation().then(function(response) {
                FloorFactory.mergeBlockToReservation(response);
                //asignar servicio de reservaciones
                //console.log("blockReservation: " + angular.toJson(response, true));
            });


        };
        $scope.$on("NotifyFloorTableReservationReload", function(evt, data) {

          if (data.action == "update") {
            angular.forEach(data.data, function(data) {
              var reservaTest = FloorFactory.parseDataReservation(data);
              FloorFactory.addServicioReservaciones(reservaTest);
            });
          } else if (data.action == "create") {
            var reservaTest = FloorFactory.parseDataReservation(data.data);
            FloorFactory.addServicioReservaciones(reservaTest);
          }

            alertMultiple("Notificación: ", data.user_msg, "inverse", null, 'top', 'left', 10000, 20, 150);
            //messageAlert("Notificación", data.user_msg, "info", 2000, true);
            //console.log("Formato: " + angular.toJson(reservaTest, true));
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
                    rm.total_visitas = rm.total_people;
                    categoria.checked = true;
                    deshabilitar();
                }
            }
            return false;
        };
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

                };

                if (categoria.checked === true) {
                    deshabilitar();
                } else {
                    categoria.checked = true;
                    rm.total_reservas = rm.total_tweb + rm.total_ttel + rm.total_tpor + rm.total_trp;
                    deshabilitar();
                }
            }
            return false;
        };
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
            if (modalMailReservation === null) {
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
            }
        };

        rm.infoReservationShow = function() {
            var icon = true;
            console.log('sd');
        };
        rm.mailReservationShow = function(reservation) {
            //console.log("mailReservationShow " + angular.toJson(reservation, true));
            modalMailReservation = $uibModal.open({
                animation: true,
                templateUrl: 'myModalMailReservation.html',
                size: 'md',
                //keyboard: false,
                controller: 'ModalMailReservationCtrl',
                controllerAs: 'vm',
                resolve: {
                    reservation: function() {
                        return reservation;
                    }
                }
            });

            $timeout(function() {
                modalMailReservation = null;
            }, 500);
        };

        var listTypeTurns = function() {
            FloorFactory.listTurnosActivos(rm.fecha_actual).then(function success(response) {

                    TypeFilterDataFactory.setTypeTurnItems(response);
                    rm.categorias_type = TypeFilterDataFactory.getTypeTurnItems();

                    TypeFilterDataFactory.setOpcionesFilterTurnos(rm.categorias_type[0]);
                    var colection_filtro_turnos = TypeFilterDataFactory.getOpcionesFilterTurnos();
                    rm.select_type(colection_filtro_turnos[0], null);
                },
                function error(error) {
                    message.apiError(error);
                }
            );
        };

        var listSourceTypes = function() {
            FloorDataFactory.getSourceTypes().then(function success(response) {

                TypeFilterDataFactory.setSourceTypesItems(response.data.data);
                rm.categorias_reserva = TypeFilterDataFactory.getSourceTypesItems();

                TypeFilterDataFactory.setOpcionesFilterReservas(rm.categorias_reserva[0]);
                var colection_filtro_reservas = TypeFilterDataFactory.getOpcionesFilterReservas();
                rm.select_reserva(colection_filtro_reservas[0], null);

            }, function error(error) {
                message.apiError(error);
            });
        };


        var init = function() {

            getColectionReservation();

            defaultOptionsFilters();

            //Definir para filtro por defecto para visitas
            TypeFilterDataFactory.setOpcionesFilterVisitas(rm.categorias_people[0]);
            rm.select_people(colection_filtro_visitas[0], null);

            //Limpiar data y estilos de servers
            FloorFactory.isEditServer(false);
            angular.element('.bg-window-floor').removeClass('drag-dispel');
            // angular.element('.table-zone').removeClass("selected-table");

            ServerDataFactory.cleanTableServerItems();

            rm.categorias_type = TypeFilterDataFactory.getTypeTurnItems();
            if (rm.categorias_type.length === 0) {
                listTypeTurns();
            } else {
                TypeFilterDataFactory.setOpcionesFilterTurnos(rm.categorias_type[0]);
                var colection_filtro_turnos = TypeFilterDataFactory.getOpcionesFilterTurnos();
                rm.select_type(colection_filtro_turnos[0], null);
            }

            rm.categorias_reserva = TypeFilterDataFactory.getSourceTypesItems();
            if (rm.categorias_reserva.length === 0) {
                listSourceTypes();
            } else {
                TypeFilterDataFactory.setOpcionesFilterReservas(rm.categorias_reserva[0]);
                var colection_filtro_reservas = TypeFilterDataFactory.getOpcionesFilterReservas();
                rm.select_reserva(colection_filtro_reservas[0], null);
            }


        };

        init();

    })
    .controller('ModalMailReservationCtrl', function($uibModalInstance, reservation, FloorDataFactory) {
        var vm = this;

        vm.reservation = {
            date: '',
            time: '',
            email: '',
            nombre: ''
        };

        vm.mailData = {
            message: '',
            subject: ''
        };

        var init = function() {
            console.log(angular.toJson(reservation, true));
            vm.reservation.date = reservation.start_date;
            vm.reservation.time = reservation.start_time;
            vm.reservation.email = reservation.email;
            vm.reservation.nombre = reservation.first_name + " - " + reservation.last_name;
        };

        vm.sendMail = function() {
            FloorDataFactory.sendMessage(reservation.reservation_id, vm.mailData).then(
                function success(response) {
                    response = response.data;

                    messageAlert("Success", response.msg, "success", 2000, true);
                    $uibModalInstance.dismiss('cancel');

                    console.log("sendMail " + angular.toJson(response, true));
                },
                function error(response) {
                    message.apiError(response);
                    console.error("sendMail " + angular.toJson(response, true));
                });
        };

        vm.validateSendMail = function() {
            var valida = 0;

            if (vm.mailData.message === "") {
                alertMultiple("Alerta", "Ingrese un mensaje", "info", null);
                valida = 1;
            }

            if (vm.mailData.subject === "") {
                alertMultiple("Alerta", "Ingrese un asunto", "info", null);
                valida = 1;
            }

            if (valida === 0) {
                vm.sendMail();
            } else {
                $uibModalInstance.dismiss('cancel');
            }
        };

        vm.closeModal = function() {
            $uibModalInstance.dismiss('cancel');
        };

        init();
    })

.controller('WaitListCtrl', function($rootScope, $scope, FloorFactory, ServerDataFactory, $uibModal, TypeFilterDataFactory) {

        var wm = this;

        wm.res_listado = [];

        wm.search = {
            show: true
        };

        $rootScope.$broadcast("floorClearSelected");

        wm.searchReservation = function() {
            wm.search.show = !wm.search.show;
        };

        wm.createWait = function() {
            var modalInstance = $uibModal.open({
                templateUrl: 'ModalCreateWaitList.html',
                controller: 'ModalWaitListCtrl',
                controllerAs: 'wl',
                size: '',
            });
        };

        wm.selectWaitlist = function(waitlist) {
            $scope.$apply(function() {
                $rootScope.$broadcast("floorEventEstablish", "sit", waitlist);
            });
        };

        var init = function() {

            //Limpiar data y estilos de servers
            FloorFactory.isEditServer(false);
            angular.element('.bg-window-floor').removeClass('drag-dispel');
            // angular.element('.table-zone').removeClass("selected-table");

            ServerDataFactory.cleanTableServerItems();
        };

        /*$rootScope.$on("waitlistReload", function() {
            init();
        });*/

        init();

    })
    //Servidores
    .controller('serverController', function($scope, $rootScope, $stateParams, $state, ServerFactory, ServerDataFactory, ColorFactory, FloorFactory, $timeout) {

        var sm = this;
        //Variable para manejo de pantalla nuevo y crear
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
            sm.listadoTablaServer = ServerDataFactory.getTableServerItems();
        };


        // Obtener tablas seleccionadas del lienzo
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
            if (server.tables.length !== 0) {
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
            }

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

            sm.listadoTablaServer = [];
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

          /**
           * Tags de reservacion
           * @type {Array}
           */
          er.tags = [];

          /**
           * Tags de reservacion seleccionados
           * @type {Object}
           */
          er.selectTags = {};

            er.sumar = function(guest) {
                er.reservation.guests[guest]++;
                totalGuests();
            };

            er.restar = function(guest) {
                var quantity = er.reservation.guests[guest];
                if (quantity - 1 >= 0) {
                    er.reservation.guests[guest]--;
                    totalGuests();
                }
            };

            var totalGuests = function() {
                er.reservation.guests.total = er.reservation.guests.men + er.reservation.guests.women + er.reservation.guests.children;
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

        var listReservationTags = function() {
            var deferred = $q.defer();

            service.getReservationTags()
                .then(function(response) {
                    er.tags = response.data.data;
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

                ///////////////////////////////////////////////////////////////
                // parse reservation.tags
                ///////////////////////////////////////////////////////////////
                er.reservation.tags = [];
                er.reservation.tags = Object.keys(er.selectTags).reduce(function(result, value) {
                    result.push(parseInt(value));
                    return result;
                }, []);

                var key = service.key();
                $rootScope.$broadcast("blackList.add", key);
                er.reservation.key  = key;

                service.quickEdit(id, er.reservation)
                    .then(function(response) {
                        $rootScope.$broadcast("floorReload", response.data.data, "update");
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

                    var key = service.key();
                    $rootScope.$broadcast("blackList.add", key);

                    service.cancel(id, {key: key})
                        .then(function(response) {
                            $rootScope.$broadcast("floorReload", response.data.data, "update");
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
                    loadConfiguration(),
                    listReservationTags()
                ]);
            }

            /**
             * Select tags
             */
            er.addTag = function(tag) {
                tag.checked = !tag.checked;
                listTagsSelected();
            };

            var listTagsSelected = function() {
                angular.forEach(er.tags, function(tag) {
                    if (tag.checked) {
                        er.selectTags[tag.id] = angular.copy(tag);
                    } else {
                        delete er.selectTags[tag.id];
                    }
                });
            };

            var paintTags = function(tags) {
                angular.forEach(tags, function(tagInUse) {
                    angular.forEach(er.tags, function(tag) {
                        if (tag.id == tagInUse.id) {
                            tag.checked = true;
                        }
                    });
                });

                listTagsSelected();
            };
            
            var resetTags = function() {
              er.selectTags = {};
              angular.forEach(er.tags, function(tag) {
                tag.checked = false;
              });
            };
            /**
             * END Select tags
             */

            (function Init() {
                listResource().then(function() {
                    parseInfo(content.reservation);
                    parseData(content.reservation);
                });
                console.log(content.reservation);
            })();
        }
    ])
    .controller("ModalWaitListCtrl", ["$rootScope", "$state", "$uibModalInstance", "reservationService", "$q", "$timeout",
        function($rootScope, $state, $uibModalInstance, service, $q, $timeout) {

            var wl = this;
            wl.reservation = {};
            wl.addGuest = true;
            wl.buttonText = 'Agregar a lista de espera';

            /**
             * HTTP
             */
            var listGuest = function() {
                var deferred = $q.defer();
                service.getGuest()
                    .then(function(guests) {
                        wl.covers = guests;
                        wl.reservation.covers = 2;
                    }).catch(function(error) {
                        message.apiError(error);
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };

            var listDurations = function() {
                var deferred = $q.defer();

                service.getDurations()
                    .then(function(durations) {
                        wl.durations = durations;
                        wl.reservation.quote = "00:15:00";
                    }).finally(function() {
                        deferred.resolve();
                    });

                return deferred.promise;
            };
            /**
             * END HTTP
             */

            /**
             * Search guest list
             */
            var auxiliar;
            wl.searchGuest = function(name) {
                console.log(name);
                if (auxiliar) $timeout.cancel(auxiliar);
                if (name === "") {
                    wl.guestList = [];
                    return;
                }
                var search = function() {
                    service.getGuestList(name)
                        .then(function(response) {
                            wl.guestList = response.data.data.data;
                        }).catch(function(error) {
                            message.apiError(error);
                        });
                };

                auxiliar = $timeout(search, 500);
            };

            wl.selectGuest = function(guest) {
                wl.reservation.guest_id = guest.id;
                wl.guest = guest;
                wl.addGuest = false;
            };

            wl.removeGuest = function() {
                wl.reservation.guest_id = null;
                wl.newGuest = null;
                wl.guestList = [];
                wl.addGuest = true;
            };
            /**
             * END Search guest list
             */

            wl.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            wl.save = function() {
                if (!wl.reservation.guest_id) {
                    if (wl.newGuest) {
                        delete wl.reservation.guest_id;
                        wl.reservation.guest = wl.newGuest;
                    }
                } else {
                    delete wl.reservation.guest;
                }

                wl.reservation.guest = wl.newGuest;
                wl.buttonText = 'Enviando ...';

                var key = service.key();
                $rootScope.$broadcast("blackList.add", key);
                wl.reservation.key  = key;

                service.saveWait(wl.reservation)
                    .then(function(response) {
                        wl.buttonText = 'Agregar a lista de espera';
                        message.success(response.data.msg);
                        $uibModalInstance.dismiss('cancel');
                    }).catch(function(error) {
                        wl.buttonText = 'Agregar a lista de espera';
                        console.error("saveWait " + angular.toJson(error, true));
                        message.apiError(error);
                    });
            };

            function listResource() {
                listGuest();
                listDurations();
            }

            (function Init() {
                listResource();
            })();
        }
    ]);