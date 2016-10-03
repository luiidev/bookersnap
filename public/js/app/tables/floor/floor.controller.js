angular.module('floor.controller', [])

.controller('FloorCtrl', function($uibModal, $rootScope, FloorFactory, ServerFactory) {
        var vm = this;
        vm.titulo = "Floor";
        vm.colorsSelect = [];
        vm.flagSelectedZone = 0;

        var getZones = function() {
            FloorFactory.listZonesReservas().then(function success(data) {
                vm.zonas = data;
                //console.log('Formateado: ' + angular.toJson(data, true));
            }, function error(data) {
                messageErrorApi(data, "Error", "warning");
            });
        };
        getZones();

        ServerFactory.getAllTablesFromServer().then(function(response) {
            $rootScope.servers = response.data.data;
            return $rootScope.servers;
        }).then(function(servers) {
            var colors = [];
            /* Se cargan los colores que ya fueron asignados  */
            angular.forEach(servers, function(server, m) {

                colors.push(server.color);

            });
            vm.colorsSelect = uniqueArray(colors); // Se colocan solo los colores ya asigandos a los servidores

        });

        vm.mostrarDetail = function(index, data) {
            modalInstancesDetail(index, data);
        };

        function modalInstancesDetail(index, data) {
            var modalInstance = $uibModal.open({
                templateUrl: 'myModalContentDetail.html',
                controller: 'DetailInstanceCtrl',
                controllerAs: 'vmd',
                size: '',
                resolve: {
                    content: function() {
                        return data;
                    }
                }
            });
        }

        vm.tabSelectedZone = function(value) {
            console.log(value);
            vm.flagSelectedZone = value;

        };

        vm.menuFloor = [{
            id: 0,
            name: 'Reservaciones',
            url: 'mesas.floor.reservation'
        }, {
            id: 1,
            name: 'Lista de espera',
            url: 'mesas.floor.walkin'
        }, {
            id: 2,
            name: 'Servidores',
            url: 'mesas.floor.server'
        }];


    })
    .controller('DetailInstanceCtrl', function($scope, $modalInstance, content, FloorFactory) {
        var vmd = this;
        vmd.itemZona = {
            name_zona: content.name_zona,
            name: content.name
        };

        var getTableReservation = function() {
            FloorFactory.rowTableReservation(content.table_id).then(function success(data) {
                vmd.itemReservations = data;
                //console.log('PopUp: ' + angular.toJson(data, true));
            });
        };
        getTableReservation();

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };


    })


.controller('reservationController', function(FloorFactory) {
    var rm = this;


    var getlistZonesBloqueosReservas = function() {
        FloorFactory.listZonesBloqueosReservas().then(function success(data) {
            rm.listado = data;
            //console.log('Listado reservaciones Total: ' + angular.toJson(data, true));
        });
    };
    getlistZonesBloqueosReservas();


}).

controller('waitlistController', function($scope) {
    var wm = this;
}).controller('serverTablesController', function($scope, $stateParams, $rootScope, FloorFactory, ServerFactory) {

    var server_id = $stateParams.server_id;
    var se = this;
    var arrayTables = [];
    se.zonas = [];
    $rootScope.mesasSeleccionadas = []; // Array donde se agregan las mesas seleccionadas

    ServerFactory.getServerSelect(FloorFactory, ServerFactory, server_id).then(function(response) {
        // Entregan las zonas con sus mesas adicionalmente se agregan las clases y bordes de acuerdo a lo elegido por el cliente
        se.zonas = response;

        /* Se agregan insertan en el array de mesasSeleccionadas las mesas que ya han sido elegidas para ese server */
        angular.forEach(se.zonas, function(zonas, i) {
            angular.forEach(zonas.table, function(mesa, m) {
                if (typeof mesa.tableSelectedByServer === "string") {
                    $rootScope.mesasSeleccionadas.push(se.zonas[i].table[m]);
                }
            });
        });

    });

    /* Logica para seleccionar las mesas */
    se.selectTable = function(item) {
        console.log("item:", item);
        var element = angular.element('#el' + item.table_id);
        if (element.hasClass("is-selected") === true) { // Si ya fue seleccionado se remueve la clase

            element.removeClass("is-selected");

            // Se retira el index del array cuando se selecciona 
            var index = $rootScope.mesasSeleccionadas.indexOf(item);
            $rootScope.mesasSeleccionadas.splice(index, 1);

        } else { // Si aun no se selecciona la mesa se agrega la clase
            $rootScope.mesasSeleccionadas.push(item);
            element.addClass("is-selected");
        }

    };

}).controller('serverController', function($scope, $rootScope, $stateParams, $state, ServerFactory, ColorFactory, FloorFactory) {

    var sm = this;
    // Se trae la informacion de las zonas independientemente para poder realizar un trato especial a la variable
    sm.flagServer = false;
    sm.data = [];
    sm.tables = [];
    sm.showForm = false;

    sm.colors = ColorFactory.getColor();

    sm.selectColor = function(color) {

        sm.color = color.colorHexadecimal;
        var position = sm.colors.indexOf(color);
        for (var i = 0; i < sm.colors.length; i++) {
            sm.colors[i].classSelect = "";
        }
        sm.colors[position].classSelect = "is-selected";

    };

    sm.editServer = function(server) {

        sm.flagServer = true;
        sm.showForm = true;
        var position = $rootScope.servers.indexOf(server);
        sm.server = $rootScope.servers[position];
        sm.name = sm.server.name;

        for (var i = 0; i < sm.colors.length; i++) {
            sm.colors[i].classSelect = "";
            if (sm.colors[i].colorHexadecimal === $rootScope.servers[position].color) {
                sm.color = $rootScope.servers[position].color;
                sm.colors[i].classSelect = "is-selected";
            }
        }

    };


    sm.removeTable = function(item) {

        var element = angular.element('#el' + item.table_id);
        var index = $rootScope.mesasSeleccionadas.indexOf(item);
        $rootScope.mesasSeleccionadas.splice(index, 1);
        element.removeClass("is-selected");

    };

    sm.newServer = function(server) {
        console.log(server);

        sm.flagServer = true;
        var position = $rootScope.servers.indexOf(server);
        sm.server = $rootScope.servers[position];
        sm.name = sm.server.name;

        for (var i = 0; i < sm.colors.length; i++) {
            sm.colors[i].classSelect = "";
            if (sm.colors[i].colorHexadecimal === $rootScope.servers[position].color) {
                sm.color = $rootScope.servers[position].color;
                sm.colors[i].classSelect = "is-selected";
            }
        }

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
        angular.forEach($rootScope.mesasSeleccionadas, function(mesa, i) {
            sm.tables.push({
                id: mesa.table_id
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
                    $state.go($state.current, {}, {
                        reload: true
                    });
                    $rootScope.servers.push(response.data.data);
                    limpiarData();

                }

            });

        } else if (sm.flagServer === true) { // Se actualiza la data

            sm.data = {
                id: sm.server.id,
                name: sm.name,
                color: sm.color,
                tables: sm.tables
            };

            ServerFactory.updateServer(sm.data, sm.server.id).then(function(response) { // Se actualiza el server

                var mensaje = "";
                if (response.data.response === false) {
                    mensaje = setearJsonError(response.data.jsonError);
                    messageAlert("Warning", mensaje, "warning", 3000);
                } else if (response.data.success === true) {
                    mensaje = response.data.msg;
                    sm.server.name = sm.name;
                    sm.server.color = sm.color;
                    messageAlert("success", mensaje, "success", 3000);
                    $state.go('floor.server.create', {}, {
                        reload: true
                    });
                    sm.flagServer = false;
                    limpiarData();
                } else if (response.data.success === false) {
                    mensaje = response.data.msg;
                    messageAlert("Warning", mensaje, "warning", 3000);
                }

            });

        }

    };

    sm.cancelEditServer = function(server) {
        sm.flagServer = false;
        limpiarData();
        $state.go('floor.server.create', {}, {
            reload: true
        });
    };

    sm.deleteServer = function() {

        ServerFactory.deleteServer(sm.server.id).then(function(response) {
            var mensaje = "";
            if (response.data.response === false) {
                mensaje = setearJsonError(response.data.jsonError);
                messageAlert("Warning", mensaje, "warning", 2000);
            } else if (response.data.success === true) {
                mensaje = response.data.msg;

                /* Se filtra el item y se elimina del array*/
                for (var i = 0; i < $rootScope.servers.length; i++) {
                    if ($rootScope.servers[i].id === sm.server.id) {
                        $rootScope.servers.splice(i, 1);
                    }
                }

                messageAlert("success", mensaje, "success", 1000);

                sm.flagServer = false;
                limpiarData();
                $state.go('floor.server.create', {}, {
                    reload: true
                });
            } else if (response.data.success === false) {
                mensaje = response.data.msg;
                messageAlert("Warning", mensaje, "warning", 2000);
            }
        });

    };

});