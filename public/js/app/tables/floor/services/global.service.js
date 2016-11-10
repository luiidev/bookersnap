angular.module('global.service', [])
    .factory('global', [function() {
        var
            reservations = {
                data: []
            },
            blocks = {
                data: []
            },
            servers = {
                data: []
            },
            zones = {
                data: []
            },
            lienzo = {
                data: []
            };

        /**
         * Funcion de actualizacion de objeco
         */
        reservations.update = function(data) {
            angular.forEach(this.data, function(reservation) {
                angular.forEach(data, function(obj_data) {
                    if (reservation.id == obj_data.id) {
                        angular.forEach(lienzo.data.tables, function(table) {
                            angular.forEach(reservation.tables, function(obj_table) {
                                if (table.id == obj_table.id) {
                                    table.reservations.remove(reservation);
                                }
                            });
                        });
                        angular.forEach(obj_data, function(value, index) {
                            reservation[index] = value;
                        });
                        angular.forEach(lienzo.data.tables, function(table) {
                            angular.forEach(reservation.tables, function(obj_table) {
                                if (table.id == obj_table.id) {
                                    table.reservations.add(reservation);
                                }
                            });
                        });
                    }
                });
            });
        };
        reservations.add = function(reservation) {
            this.data.push(reservation);
            angular.forEach(lienzo.data.tables, function(table) {
                angular.forEach(reservation.tables, function(obj_table) {
                    if (table.id == obj_table.id) {
                        table.reservations.add(reservation);
                    }
                });
            });
        };
        servers.update = function(data) {
            angular.forEach(this.data, function(server) {
                angular.forEach(data, function(obj_data) {
                    if (server.id == obj_data.id) {
                        angular.forEach(lienzo.data.tables, function(table) {
                            angular.forEach(server.tables, function(obj_table) {
                                if (table.id == obj_table.id) {
                                    delete table.server;
                                }
                            });
                        });
                        angular.forEach(obj_data, function(value, index) {
                            server[index] = value;
                        });
                        angular.forEach(lienzo.data.tables, function(table) {
                            angular.forEach(server.tables, function(obj_table) {
                                if (table.id == obj_table.id) {
                                    table.server = server;
                                }
                            });
                        });
                    }
                });
            });
        };
        servers.add = function(server) {
            this.data.push(server);
            angular.forEach(lienzo.data.tables, function(table) {
                angular.forEach(server.tables, function(obj_table) {
                    if (table.id == obj_table.id) {
                        table.server = server;
                    }
                });
            });
        };
        /**
         * END
         */

        return {
            reservations: reservations,
            servers: servers,
            lienzo: lienzo
        };
    }]);