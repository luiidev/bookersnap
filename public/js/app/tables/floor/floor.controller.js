angular.module('floor.controller', [])

.controller('FloorCtrl', function($scope, $uibModal, $rootScope, FloorFactory, ServerFactory, $window, screenHelper, screenSizeFloor) {
        var vm = this;
        var fecha_actual = getFechaActual();

        vm.titulo = "Floor";
        vm.colorsSelect = [];
        vm.flagSelectedZone = 0;

        vm.fecha_actual = fecha_actual;

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
            vm.flagSelectedZone = value;

        };

        vm.handConfiguration = function(obj) {
            var res = vm.numpeople;
            var num = res.substring(3);
            modalInstancesConfiguration(num, obj);
        };

        function modalInstancesConfiguration(num, obj) {
            var modalInstance = $uibModal.open({
                templateUrl: 'modalConfiguration.html',
                controller: 'ConfigurationInstanceCtrl',
                controllerAs: 'vmc',
                size: 'lg',
                resolve: {
                    num: function() {
                        return num;
                    },
                    table: function() {
                        return obj;
                    }
                }
            });
        }

        vm.navMouseZone = function(obj) {
            console.log('evento');
        };

        angular.element($window).bind('resize', function() {
            var size = screenHelper.size(screenSizeFloor);
            vm.size = size;
            vm.fontSize = 14 * vm.size / screenSizeFloor.minSize + "px";
            $scope.$digest();

        });

        (function Init() {
            vm.size = screenHelper.size(screenSizeFloor);
            vm.fontSize = 14 * vm.size / screenSizeFloor.minSize + "px";
        })();

    })
    .controller('ConfigurationInstanceCtrl', function($modalInstance, num, table, OperationFactory) {
        var vmc = this;
        vmc.numpeople = num;
        vmc.resultado = num;
        vmc.table = table;

        //Creando numero de casillas
        var vNumpeople = [];
        for (i = 1; i <= 12; i++) {
            vNumpeople.push({
                num: i
            });
        }
        vmc.colectionNum = vNumpeople;

        //Definiendo valores por defecto
        vmc.flagSelectedNumMen = num;
        vmc.flagSelectedNumWomen = 0;
        vmc.flagSelectedNumChildren = 0;

        vmc.numperson = {
            men: num,
            women: 0,
            children: 0
        };

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


        if (num > 12) {
            vmc.numdinamicoMen = num;
            vmc.flagSelectedCountNumMen = num;

            vmc.numdinamicoWomen = 13;
            vmc.flagSelectedCountNumWomen = 0;

            vmc.numdinamicoChildren = 13;
            vmc.flagSelectedCountNumChildren = 0;

        } else {
            vmc.numdinamicoMen = 13;
            vmc.numdinamicoWomen = 13;
            vmc.numdinamicoChildren = 13;
        }

        vmc.sumar = function(person) {
            if (person == 'men') {
                vmc.numdinamicoMen++;
                vmc.flagSelectedCountNumMen = vmc.numdinamicoMen;
                vmc.flagSelectedNumMen = 0;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoMen);
                //console.log('Datos ' + angular.toJson(vmc.numperson));
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }

            if (person == 'women') {
                vmc.numdinamicoWomen++;
                vmc.flagSelectedCountNumWomen = vmc.numdinamicoWomen;
                vmc.flagSelectedNumWomen = 0;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoWomen);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }

            if (person == 'children') {
                vmc.numdinamicoChildren++;
                vmc.flagSelectedCountNumChildren = vmc.numdinamicoChildren;
                vmc.flagSelectedNumChildren = 0;
                OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoChildren);
                vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
            }
        };
        vmc.restar = function(person) {
            if (person == 'men') {
                if (vmc.numdinamicoMen > 13) {
                    vmc.numdinamicoMen--;
                    vmc.flagSelectedCountNumMen = vmc.numdinamicoMen;
                    vmc.flagSelectedNumMen = 0;
                    OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoMen);
                    vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
                }
            }
            if (person == 'women') {
                if (vmc.numdinamicoWomen > 13) {
                    vmc.numdinamicoWomen--;
                    vmc.flagSelectedCountNumWomen = vmc.numdinamicoWomen;
                    vmc.flagSelectedNumWomen = 0;
                    OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoWomen);
                    vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
                }
            }
            if (person == 'children') {
                if (vmc.numdinamicoChildren > 13) {
                    vmc.numdinamicoChildren--;
                    vmc.flagSelectedCountNumChildren = vmc.numdinamicoChildren;
                    vmc.flagSelectedNumChildren = 0;
                    OperationFactory.setNumPerson(vmc.numperson, person, vmc.numdinamicoChildren);
                    vmc.resultado = OperationFactory.getTotalPerson(vmc.numperson);
                }
            }
        };

        vmc.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

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


}).

controller('waitlistController', function($scope) {
    var wm = this;
    wm.search = {
        show: true
    };
    wm.searchReservation = function() {
        wm.search.show = !wm.search.show;
    };
})

.controller('serverTablesController', function($scope, $stateParams, $rootScope, FloorFactory, ServerFactory) {

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
        sm.showForm = false;
        $state.go('mesas.floor.server');
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