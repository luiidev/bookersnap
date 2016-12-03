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
        reservations.update = function(updateList, callback) {
            try {
                var dateNow = moment().format("YYYY-MM-DD");
                angular.forEach(this.data, function(reservation, index) {
                    angular.forEach(updateList, function(item) {
                        if (reservation.id == item.id) {
                            angular.forEach(lienzo.data.tables, function(table) {
                                angular.forEach(reservation.tables, function(obj_table) {
                                    if (table.id == obj_table.id) {
                                        table.reservations.remove(reservation);
                                    }
                                });
                            });
                            if (item.date_reservation == dateNow) {
                                Object.assign(reservation, item);
                                angular.forEach(lienzo.data.tables, function(table) {
                                    angular.forEach(reservation.tables, function(obj_table) {
                                        if (table.id == obj_table.id) {
                                            table.reservations.add(reservation);
                                        }
                                    });
                                });
                            } else {
                                this.data.splice(index, 1);
                            }
                        }
                    });
                });
                if (typeof callback == "function") callback();
            } catch (e) {
                console.log("Reservations #update : " + e);
            }
        };
        reservations.add = function(reservation, callback) {
            try {
                var dateNow = moment().format("YYYY-MM-DD");
                if (reservation.date_reservation == dateNow) {
                    this.data.push(reservation);
                    angular.forEach(lienzo.data.tables, function(table) {
                        angular.forEach(reservation.tables, function(obj_table) {
                            if (table.id == obj_table.id) {
                                table.reservations.add(reservation);
                            }
                        });
                    });

                    if (typeof callback == "function") callback();
                }
            } catch (e) {
                console.log("Reservations #add : " + e);
            }
        };
        servers.update = function(data) {
            try {
                angular.forEach(this.data, function(server) {
                    angular.forEach(data, function(obj_data) {
                        if (server.id == obj_data.id) {
                            angular.forEach(lienzo.data.tables, function(table) {
                                angular.forEach(server.tables, function(obj_table) {
                                    if (table.id == obj_table.id && table.server.id == obj_data.id) {
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
            } catch (e) {
                console.log("Servers #update : " + e);
            }
        };
        servers.add = function(server) {
            try {
                this.data.push(server);
                angular.forEach(lienzo.data.tables, function(table) {
                    angular.forEach(server.tables, function(obj_table) {
                        if (table.id == obj_table.id) {
                            table.server = server;
                        }
                    });
                });
            } catch (e) {
                console.log("Servers #add : " + e);
            }
        };
        servers.delete = function(del_server, callback) {
            try {
                angular.forEach(this.data, function(server, server_index) {
                    if (server.id == del_server.id) {
                        angular.forEach(lienzo.data.tables, function(table) {
                            angular.forEach(server.tables, function(obj_table) {
                                if (table.id == obj_table.id && table.server.id == del_server.id) {
                                    delete table.server;
                                }
                            });
                        });
                        servers.data.splice(server_index, 1);
                    }
                });
                if (typeof callback == "function") callback();
            } catch (e) {
                console.log("Servers #delete: " + e);
            }

        };
        blocks.update = function(updateList, callback) {
            try {
                var dateNow = moment().format("YYYY-MM-DD");
                angular.forEach(this.data, function(block, index) {
                    angular.forEach(updateList, function(item) {
                        if (block.id == item.id) {
                            angular.forEach(lienzo.data.tables, function(table) {
                                angular.forEach(block.tables, function(obj_table) {
                                    if (table.id == obj_table.id) {
                                        table.blocks.remove(block);
                                    }
                                });
                            });
                            if (item.start_date == dateNow) {
                                Object.assign(block, item);
                                angular.forEach(lienzo.data.tables, function(table) {
                                    angular.forEach(block.tables, function(obj_table) {
                                        if (table.id == obj_table.id) {
                                            table.blocks.add(block);
                                        }
                                    });
                                });
                            } else {
                                this.data.splice(index, 1);
                            }
                        }
                    });
                });
                if (typeof callback == "function") callback();
            } catch (e) {
                console.log("Blocks #update : " + e);
            }
        };
        blocks.add = function(block, callback) {
            try {
                var dateNow = moment().format("YYYY-MM-DD");
                if (block.start_date == dateNow) {
                    this.data.push(block);
                    angular.forEach(lienzo.data.tables, function(table) {
                        angular.forEach(block.tables, function(obj_table) {
                            if (table.id == obj_table.id) {
                                table.blocks.add(block);
                            }
                        });
                    });

                    if (typeof callback == "function") callback();
                }
            } catch (e) {
                console.log("Blocks #add : " + e);
            }
        };
        blocks.delete = function(del_block, callback) {
            try {
                angular.forEach(this.data, function(block, server_index) {
                    if (block.id == del_block.id) {
                        angular.forEach(lienzo.data.tables, function(table) {
                            angular.forEach(block.tables, function(obj_table) {
                                if (table.id == obj_table.id) {
                                    table.blocks.remove(del_block);
                                }
                            });
                        });
                        delete blocks.data[server_index];
                        blocks.data.splice(server_index, 1);
                    }
                });
                if (typeof callback == "function") callback();
            } catch (e) {
                console.log("Blocks #Delete : " + e);
            }
        };
        /**
         * END
         */

        return {
            reservations: reservations,
            servers: servers,
            lienzo: lienzo,
            blocks: blocks
        };
    }]);