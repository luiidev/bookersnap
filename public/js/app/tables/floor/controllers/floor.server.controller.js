angular.module('floor.controller')
    .controller('serverCtrl', function($rootScope, $state, ServerFactory, ServerDataFactory, ColorFactory, FloorFactory, reservationService, global) {

        var sm = this;

        /**
         * Variable para manejo de pantalla nuevo y crear
         */
        sm.flagServer = false;
        sm.server = {};

        /**
         * Crear y agregar nuevo servidor
         */
        sm.addServer = function() {
            sm.flagServer = false;
            sm.showForm = true;
            sm.server = {
                tables: []
            };
            ServerDataFactory.setTableServerItemsEdit(sm.server.tables);
            FloorFactory.isEditServer(true);
            angular.element('.bg-window-floor').addClass('drag-dispel');
        };

        /**
         * Editar un servidor
         * @param  {[Object]} server
         */
        sm.editServer = function(server) {
            sm.flagServer = true;
            sm.showForm = true;

            $rootScope.$broadcast("floorZoneIndexSelected", server.tables);
            global.lienzo.data.tablesSelected(server.tables);

            sm.server = angular.copy(server);
            ServerDataFactory.setTableServerItemsEdit(sm.server.tables);

            sm.selectColorForColor(sm.server.color);

            FloorFactory.isEditServer(true);
            angular.element('.bg-window-floor').addClass('drag-dispel');
        };

        /**
         * Limpiar zona de edicion / creacion
         */
        sm.cancelEdit = function(server) {
            sm.flagServer = false;
            sm.showForm = false;

            sm.server = {};
            sm.selectColorForColor("");

            FloorFactory.isEditServer(false);
            ServerDataFactory.cleanTableServerItems();

            global.lienzo.data.clearSelected();
            angular.element('.bg-window-floor').removeClass('drag-dispel');
            $state.go('mesas.floor.server');
        };

        /**
         * Marcar color del listado de colores disponibles
         * @param  {Object} color
         */
        sm.selectColor = function(color) {
            sm.server.color = color.hex;
            angular.forEach(sm.colors, function(color) {
                color.selected = false;
            });
            color.selected = true;
        };

        /**
         * Seleccionar el color del server al editar
         * @param  {String} color
         */
        sm.selectColorForColor = function(colorSearch) {
            angular.forEach(sm.colors, function(color) {
                if (color.hex == colorSearch) {
                    sm.server.color = color.hex;
                    color.selected = true;
                } else {
                    color.selected = false;
                }
            });
        };

        /**
         * Quitar una tabla de servidor
         * Botoncito X 
         * @param  {[Int]} item [Indice de tabla]
         * @param  {[Object]} tabla
         */
        sm.removeTable = function(item, table) {
            ServerDataFactory.delTableServerItemIndex(item);
            global.lienzo.data.notSelect(table);
        };

        sm.saveOrUpdateServer = function() {
            if (sm.flagServer === false) { // Se Crea un server
                reservationService.blackList.key(sm.server);
                ServerFactory.addServer(sm.server)
                    .then(function(response) {
                        message.success("Se registro el servidor");
                        sm.servers.add(response.data.data);
                        sm.cancelEdit();
                    }).catch(function(error) {
                        message.apiError(error);
                    });
            } else if (sm.flagServer === true) { // Se actualiza el server
                reservationService.blackList.key(sm.server);
                ServerFactory.updateServer(sm.server, sm.server.id)
                    .then(function(response) {
                        message.success("Se registro el servidor");
                        sm.servers.update(response.data.data);
                        sm.cancelEdit();
                    }).catch(function(error) {
                        message.apiError(error);
                    });

            }
        };

        sm.btnDeleteServer = function() {

            ServerFactory.deleteServer(sm.server.id)
                .then(function(response) {
                    message.success("Se elimino el servidor");
                    sm.cancelEdit();
                    console.log(response);
                    // sm.servers.add();
                }).catch(function(error) {
                    message.apiError(error);
                });

        };

        (function Init() {
            sm.servers = global.servers;
            sm.colors = ColorFactory.getColor();
        })();

    });