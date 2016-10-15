angular.module('floor.controller', [])

.controller('FloorCtrl', function($scope, $uibModal, $rootScope, FloorFactory, ServerFactory, ServerDataFactory, $window, $document, screenHelper,
        screenSizeFloor, TypeTurnFactory) {
        var vm = this;
        var fecha_actual = getFechaActual();

        vm.titulo = "Floor";
        vm.colorsSelect = [];
        vm.flagSelectedZone = 0;
        vm.notesBox = false;

        vm.fecha_actual = fecha_actual;
        vm.typeTurns = [];

        var listTypeTurns = function() {
            TypeTurnFactory.getTypeTurns().then(
                function success(response) {
                    response = response.data.data;
                    vm.typeTurns = response;
                    console.log("typeturns " + angular.toJson(vm.typeTurns, true));
                },
                function error(response) {
                    console.error("typeturns " + angular.toJson(response, true));
                }
            );
        };

        var getZones = function() {
            FloorFactory.listZonesReservas().then(function success(data) {
                vm.zonas = data;
                //console.log('Zonas: ' + angular.toJson(data, true));
                //Guardar data en un servicio para buscar table y conocer el index de su zona
                FloorFactory.setDataZonesTables(data);
            }, function error(data) {
                messageErrorApi(data, "Error", "warning");
            });
        };
        getZones();

        var getServers = function() {
            ServerDataFactory.listadoServers().then(function success(data) {
                ServerDataFactory.setServerItems(data);
                //console.log(angular.toJson(data, true));
                /* Se cargan los colores que ya fueron asignados  */
                angular.forEach(data, function(server, m) {
                    ServerDataFactory.setColorItems(server.color);
                });


            }, function error(data) {
                messageErrorApi(data, "Error", "warning");
            });
        };
        getServers();

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
                            table: data,
                            //tables: vm.zonas[index].table
                        };
                    }
                }
            });
        }

        vm.tabSelectedZone = function(value) {
            vm.flagSelectedZone = value;

        };

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
                    }
                }
            });
        }

        function storeTables(num, data) {

            var element = angular.element('#el' + data.table_id);
            if (element.hasClass("selected-table") === true) { // Si ya fue seleccionado se remueve la clase

                element.removeClass("selected-table");
                ServerDataFactory.delTableServerItem(data);

            } else { // Si aun no se selecciona la mesa se agrega la clase
                ServerDataFactory.setTableServerItems(data);
                element.addClass("selected-table");
                //console.log(angular.toJson(data, true))
            }
        }

        angular.element($window).bind('resize', function() {
            var size = screenHelper.size(screenSizeFloor);
            vm.size = size;
            vm.fontSize = 14 * vm.size / screenSizeFloor.minSize + "px";
            $scope.$digest();

        });

        (function Init() {
            vm.size = screenHelper.size(screenSizeFloor);
            vm.fontSize = 14 * vm.size / screenSizeFloor.minSize + "px";

            listTypeTurns();
        })();

    })
    .controller('ConfigurationInstanceCtrl', function($modalInstance, num, table, OperationFactory) {
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
            $modalInstance.dismiss('cancel');
        };

        function parseReservation() {
            var now = moment();
            var date = now.format("YYYY-MM-DD");
            var start_time = now.add((15 - (parseInt(now.format("mm")) % 15)), "minutes").second(0).format("HH:mm:ss");
            return {
                table_id: table.table_id,
                covers: {
                    total: vmc.resultado,
                    men: vmc.flagSelectedNumMen,
                    women: vmc.flagSelectedNumWomen,
                    children: vmc.flagSelectedNumChildren,
                },
                date: date,
                start_time: start_time
            };
        }

        vmc.save = function() {
            var reservation = parseReservation();
            console.log(reservation);
            $modalInstance.dismiss('cancel');
        };

    })
    .controller('DetailInstanceCtrl', function($scope, $uibModalInstance, $uibModal, content, FloorFactory, reservationService, $state) {
        var vmd = this;
        vmd.itemZona = {
            name_zona: content.table.name_zona,
            name: content.table.name
        };

        vmd.reservation = {};

        var getTableReservation = function() {
            FloorFactory.rowTableReservation(content.table.table_id)
                .then(function(data) {
                    vmd.itemReservations = data;
                    // console.log('PopUp: ' + angular.toJson(data, true));
                });
        };

        vmd.reservationEditAll = function() {
            $uibModalInstance.dismiss('cancel');
            $state.go('mesas.reservation-edit', {
                id: 1,
                date: "2016-10-13"
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
                covers: data.num_people,
                status_id: data.res_reservation_status_id,
                server_id: data.res_server_id,
                note: data.note
            };
        }

        function parseInfo(data) {
            return {
                first_name: data.first_name,
                last_name: data.last_name,
                date: moment(data.start_date).format("dddd, d [de] MMMM"),
                time: moment(data.start_time, "HH:mm:ss").format("H:mm A"),
                tables: getReservationTables(data.reservation_id)
            };
        }

        function getReservationTables(id) {
            var reservationTables = "";
            angular.forEach(content.tables, function(table, i) {
                if (table.reservation_id == id) {
                    reservationTables += table.name + ", ";
                }
            });
            return reservationTables.substring(0, reservationTables.length - 2);
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
            console.log(vmd.reservation);
            $uibModalInstance.dismiss('cancel');
        };

        getTableReservation();
    })

.controller('reservationController', function(FloorFactory, $timeout) {
    var rm = this;
    rm.search = {
        show: true
    };
    rm.searchReservation = function() {
        rm.search.show = !rm.search.show;
    };

    var getlistZonesBloqueosReservas = function() {
        FloorFactory.listZonesBloqueosReservas().then(function success(data) {
            rm.listado = data;
            //console.log('Listado reservaciones Total: ' + angular.toJson(data, true));
        });
    };
    getlistZonesBloqueosReservas();
})

.controller('waitlistController', function() {
    var wm = this;
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

        //Obtener tab marcado
        var firstTableId = parseInt(server.tables[0].id);
        var indiceZone = 0;

        var lstZonas = FloorFactory.getDataZonesTables();
        angular.forEach(lstZonas, function(zona, key) {
            var tables = zona.table;
            //console.log(zona);
            angular.forEach(tables, function(table) {
                //console.log(table);
                if (table.table_id == firstTableId) {
                    indiceZone = key;
                    console.log(key);
                }

            });

        });
        //console.log(indiceZone);



        vTable = [];
        angular.forEach(server.tables, function(table) {
            var dataTable = {
                color: server.color,
                name: table.name,
                table_id: table.id,
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
        console.log(sm.color);

    };

    //Botoncito X 
    sm.removeTable = function(item, data) {

        var element = angular.element('#el' + data.table_id);
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
                id: mesa.table_id,
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


});