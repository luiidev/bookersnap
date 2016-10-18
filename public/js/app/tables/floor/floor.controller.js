angular.module('floor.controller', [])

.controller('FloorCtrl', function($scope, $timeout, $uibModal, reservationHelper, reservationService, TypeTurnFactory, FloorFactory, ServerDataFactory, $window, screenHelper, screenSizeFloor) {

        var vm = this;
        var fecha_actual = getFechaActual();

        vm.fecha_actual = fecha_actual;
        vm.typeTurns = [];

        vm.zones = [];
        var blocks = [];

        /**
         * Varaible de apoyo para saber que evento ejecutar en arrastre de objeto a un mesa
         */
        vm.eventEstablished = 0;

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
        var timeoutNotes;
        var openNotesTimeOut;

        vm.fecha_actual = fecha_actual;
        vm.typeTurns = [];

        vm.flagSelectedZone = FloorFactory.getNavegationTabZone();
        console.log(vm.flagSelectedZone);
        var selectedTabZoneByServer = function() {
            if (FloorFactory.isEditServer()) {
                vm.flagSelectedZone = FloorFactory.getNavegationTabZone();
            }
        };

        var listenFloor = function() {
            selectedTabZoneByServer();
            $timeout(listenFloor, 500);
        };
        listenFloor();

        vm.tabSelectedZone = function(value) {
            FloorFactory.setNavegationTabZone(value);
            vm.flagSelectedZone = value;
        };

        var listTypeTurns = function() {
            FloorFactory.listTurnosActivos(vm.fecha_actual).then(
                function success(response) {
                    vm.typeTurns = response;
                },
                function error(error) {
                    message.apiError(error, "No se pudo listar los turnos.");
                }
            );
        };

        var getServers = function() {
            ServerDataFactory.listadoServers()
                .then(function success(servers) {
                    //////////////////////////////////////////////////////////////
                    FloorFactory.setColorTable(vm.zones, servers);
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

        var loadBlocks = function(date) {
            reservationService.getBlocks(date, true)
                .then(function(response) {
                    blocks = response.data.data;
                }).catch(function(error) {
                    message.apiError(error, "No se pudo cargar las reservaciones");
                }).finally(function() {
                    //////////////////////////////////////////////////////////////
                    FloorFactory.setBorderColorForReservation(vm.zones, blocks);
                    //////////////////////////////////////////////////////////////
                });
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
                    loadBlocks(date);
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
                            //zoneName: vm.zones[index].name,
                            table: data,
                            blocks: blocks,
                            zones: vm.zones
                        };
                    }
                }
            });
        }

        vm.handConfiguration = function(obj) {
            var res_men = vm.numpeople.num_men;
            var res_women = vm.numpeople.num_women;
            var res_children = vm.numpeople.num_children;
            //console.log(angular.toJson(res));
            var num_men = parseInt(res_men.substring(3));
            var num_women = parseInt(res_women.substring(3));
            var num_children = parseInt(res_children.substring(3));

            var cantidades = {
                men: num_men,
                women: num_women,
                children: num_children
            };

            modalInstancesConfiguration(cantidades, obj);
        };

        function modalInstancesConfiguration(cantidades, obj) {
            console.log(cantidades, obj);
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
                        return vm.eventEstablished;
                    }
                }
            });
        }

        function storeTables(num, data) {

            var element = angular.element('#el' + data.id);
            if (element.hasClass("selected-table") === true) { // Si ya fue seleccionado se remueve la clase

                element.removeClass("selected-table");
                ServerDataFactory.delTableServerItem(data);

            } else { // Si aun no se selecciona la mesa se agrega la clase
                ServerDataFactory.setTableServerItems(data);
                element.addClass("selected-table");
                //console.log(angular.toJson(data, true))
            }
        }

        var sizeLienzo = function() {
            vm.size = screenHelper.size(screenSizeFloor);
            vm.fontSize = (14 * vm.size / screenSizeFloor.minSize + "px");
        };

        vm.openNotes = function() {
            if (openNotesTimeOut) $timeout.cancel(openNotesTimeOut);
            vm.notesBox = !vm.notesBox;
            openNotesTimeOut = $timeout(function() {
                vm.notesBoxValida = true;
            }, 500);
        };

        var closeNotes = function() {
            angular.element($window).bind('click', function(e) {

                var container = $(".box-tab-notas");

                if (container.has(e.target).length === 0 && vm.notesBoxValida === true) {
                    vm.notesBox = false;
                    vm.notesBoxValida = false;
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

        (function Init() {

            listenFloor();
            loadZones(fecha_actual);
            listTypeTurns();
            sizeLienzo();
            closeNotes();
            // getServers();
            // getZones();

        })();

    })
    .controller('ConfigurationInstanceCtrl', function($uibModalInstance, num, table, eventEstablished, OperationFactory, reservationService) {
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
        for (i = 0; i <= 12; i++) {
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
            var start_time = now.clone().add((15 - (now.minutes() % 15)), "minutes").second(0).format("HH:mm:ss");
            return {
                table_id: table.id,
                covers: {
                    men: vmc.flagSelectedNumMen,
                    women: vmc.flagSelectedNumWomen,
                    children: vmc.flagSelectedNumChildren,
                },
                date: date,
                hour: start_time
            };
        }

        vmc.save = function() {
            if (eventEstablished) {
                sit();
            } else {
                create();
            }
        };

        var create = function() {
            var reservation = parseReservation();

            reservationService.quickCreate(reservation)
                .then(function(response) {
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.error(error);
                });
        };

        var sit = function() {
            var id = 79;
            var data = {
                table_id: 136
            };

            reservationService.sit(id, data)
                .then(function(response) {
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.error(error);
                });
        };
    })
    .controller('DetailInstanceCtrl', function($scope, $uibModalInstance, $uibModal, content, FloorFactory, reservationService, $state) {
        var vmd = this;
        vmd.itemZona = {
            name_zona: content.zoneName,
            name: content.table.name
        };

        vmd.reservation = {};

        var getTableReservation = function() {
            FloorFactory.rowTableReservation(content.table.id)
                .then(function(data) {
                    vmd.itemReservations = data;
                    // console.log('PopUp: ' + angular.toJson(data, true));
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
            listResource();
            vmd.info = parseInfo(data);
            vmd.reservation = parseData(data);
            vmd.EditContent = true;
        };

        function listResource() {
            listGuest();
            listStatuses();
            listServers();
        }

        function parseData(data) {
            return {
                id: data.reservation_id,
                covers: data.num_guest,
                status_id: data.res_reservation_status_id,
                server_id: data.res_server_id,
                note: data.note || null
            };
        }

        function parseInfo(data) {
            return {
                first_name: data.first_name,
                last_name: data.last_name,
                date: moment(data.start_date).format("dddd, d [de] MMMM"),
                time: moment(data.start_time, "HH:mm:ss").format("H:mm A"),
                tables: FloorFactory.getReservationTables(content.zones, content.blocks, data.reservation_id)
            };
        }

        var listGuest = function() {
            reservationService.getGuest()
                .then(function(guests) {
                    vmd.covers = guests;
                });
        };

        var listStatuses = function() {
            reservationService.getStatuses()
                .then(function(response) {
                    vmd.statuses = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                });
        };

        var listServers = function() {
            reservationService.getServers()
                .then(function(response) {
                    vmd.servers = response.data.data;
                }).catch(function(error) {
                    message.apiError(error);
                });
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
                    message.success(response.data.msg);
                    $uibModalInstance.dismiss('cancel');
                }).catch(function(error) {
                    message.error(error);
                });
        };

        vmd.cancelReservation = function() {
            message.confirm("¿ Esta seguro de cencelar la reservacion ?", "Esta accion se puede revertir", function() {
                vmd.waitingResponse = true;
                var id = vmd.reservation.id;
                reservationService.cancel(id)
                    .then(function(response) {
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
    .controller('reservationController', function(FloorFactory, ServerDataFactory) {
        var rm = this;

        //Limpiar data y estilos de servers
        FloorFactory.isEditServer(false);
        angular.element('.bg-window-floor').removeClass('drag-dispel');
        angular.element('.table-zone').removeClass("selected-table");
        ServerDataFactory.cleanTableServerItems();

        rm.search = {
            show: true
        };
        rm.searchReservation = function() {
            rm.search.show = !rm.search.show;
        };

        var getlistZonesBloqueosReservas = function() {
            FloorFactory.listZonesBloqueosReservas().then(function success(data) {
                rm.res_listado = data;
                var total = 0;
                var men = 0;
                var women = 0;
                var children = 0;
                angular.forEach(rm.res_listado, function(people) {
                    men += people.num_people_1;
                    women += people.num_people_2;
                    children += people.num_people_3;
                    total += people.num_people;
                });
                rm.total_men = men;
                rm.total_women = women;
                rm.total_children = children;
                rm.total_people = total;
                rm.total_visitas = total;

                //console.log('Total: ' + angular.toJson(data, true));
            });
        };
        getlistZonesBloqueosReservas();

        //Datos y acciones para filtrar
        rm.categorias_people = [{
            idcategoria: 1,
            nombre: 'Hombres'
        }, {
            idcategoria: 2,
            nombre: 'Mujeres'
        }, {
            idcategoria: 3,
            nombre: 'Niños(as)'
        }, {
            idcategoria: 4,
            nombre: 'Todos'
        }];

        rm.select_people = function(categoria) {
            rm.filter_people = categoria;
            switch (categoria.idcategoria) {
                case 1:
                    rm.total_visitas = rm.total_men;
                    break;
                case 2:
                    rm.total_visitas = rm.total_women;
                    break;
                case 3:
                    rm.total_visitas = rm.total_children;
                    break;
                case 4:
                    rm.total_visitas = rm.total_people;
                    break;
            }
            //rm.total_people = 12;
            return false;
        };
        //Al iniciar que este seleccionadad por defecto
        rm.select_people(rm.categorias_people[3]);
        rm.isActivePeople = function(categoria) {
            if (categoria.idcategoria == rm.filter_people.idcategoria) {
                return 'sel_active';
            } else {
                return '';
            }
        };
    })
    .controller('waitlistController', function(FloorFactory, ServerDataFactory) {
        var wm = this;

        //Limpiar data y estilos de servers
        FloorFactory.isEditServer(false);
        angular.element('.bg-window-floor').removeClass('drag-dispel');
        angular.element('.table-zone').removeClass("selected-table");
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
        var callListadoTable = function() {
            sm.listadoTablaServer = ServerDataFactory.getTableServerItems();
            //console.log('Listado: ' + angular.toJson(sm.listadoTablaServer, true));
            $timeout(callListadoTable, 500);
        };
        callListadoTable();

        sm.btnEditServer = function(index, server) {

            sm.flagServer = true;
            sm.showForm = true;
            console.log(server);
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

            angular.element('.table-zone').removeClass("selected-table");
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
                console.log()
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
    });