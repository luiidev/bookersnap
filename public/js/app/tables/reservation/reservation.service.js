angular.module('reservation.service', [])
.factory("reservationService", ["$http","HttpFactory", "ApiUrlMesas", "ApiUrlRoot", "quantityGuest", "$q",
     function(http, HttpFactory, ApiUrlMesas, ApiUrlRoot, quantityGuest, $q) {
        var zones, servers, resStatus, turns, blocks, tags, reservations, configuration;
            return {
                save: function(data) {
                    return http.post(ApiUrlMesas + "/table/reservation", data);
                },
                quickCreate: function(data) {
                    return http.post(ApiUrlMesas + "/table/reservation/quickcreate", data);
                },
                edit: function(id, data) {
                    return http.put(ApiUrlMesas + "/table/reservation/" + id , data);
                },
                quickEdit: function(id, data) {
                    return http.put(ApiUrlMesas + "/table/reservation/" + id + "/quickedit", data);
                },
                cancel: function(id) {
                    return http.put(ApiUrlMesas + "/table/reservation/" + id + "/cancel");
                },
                sit: function(id, data) {
                    return http.put(ApiUrlMesas + "/table/reservation/" + id + "/sit", data);
                },
                getReservation: function(id) {
                    return http.get(ApiUrlMesas + "/table/reservation/" + id + "/edit");
                },
                getZones: function(date, reload) {
                    zones = HttpFactory.get(ApiUrlMesas + "/calendar/" + date + "/zones", null, zones, reload);
                    return  zones;
                },
                getServers: function(reload) {
                    servers = HttpFactory.get(ApiUrlMesas + "/servers",  null, servers, reload);
                    return servers;
                },
                getStatuses: function(reload) {
                    resStatus = HttpFactory.get(ApiUrlRoot + "/reservation/status", null , resStatus, reload);
                    return  resStatus;
                },
                getTurns: function(date, reload) {
                    turns  = HttpFactory.get(ApiUrlMesas + "/calendar/" + date + "/shifts", null, turns, reload);
                    return turns;
                },
                getBlocks: function(date, reload) {
                    blocks = HttpFactory.get(ApiUrlMesas + "/blocks/tables", {params: {date: date}}, blocks, reload);
                    return blocks;
                },
                getGuestList: function(name) {
                    return http.get(ApiUrlMesas + "/guests", {params: {name: name, page_size: 8}});
                },
                getReservationTags: function(reload) {
                    tags = HttpFactory.get(ApiUrlMesas + "/reservation/tag", null, tags, reload);
                    return tags;
                },
                getReservations: function(reload) {
                    reservations = HttpFactory.get(ApiUrlMesas + "/reservations", null, reservations, reload);
                    return reservations;
                },
                getConfigurationRes: function(reload) {
                    configuration = HttpFactory.get(ApiUrlMesas + "/configuration/reservations", null, configuration, reload);
                    return configuration;
                },
                getGuest: function() {
                    var deferred = $q.defer();

                    var guests = [];
                    guests.push({id:1, name:"1 Invitado"});
                    for (var i = 2; i < quantityGuest; i++) {
                        guests.push({id: i, name: (i +" Invitados")});
                    }
                    deferred.resolve(guests);
                    return deferred.promise;
                },
                getDurations: function() {
                    var deferred = $q.defer();

                    var durations = [];

                    var date_ini = moment("2000-01-01 00:00:00");

                    for (var i = 1; i < 33; i++) {
                        date_ini.add(15, "minutes");
                        var duration = {};
                        duration.time = date_ini.format("HH:mm:ss");

                        if (date_ini.hour() > 0) {
                            if (date_ini.minute() === 0) {
                                duration.name = date_ini.format("H[hr]");
                            } else {
                                duration.name = date_ini.format("H[hr] mm[min]");
                            }
                        } else {
                            duration.name = date_ini.format("mm[min]");
                        }

                        durations.push(duration);
                    }

                    deferred.resolve(durations);
                    return deferred.promise;
                },
                getHours: function(turns) {
                    var deferred = $q.defer();

                    var hours = [];
                    var timeDefault = "";
                    var data = {};

                    var now = moment().add((15 - (parseInt(moment().format("mm")) % 15)), "minutes").second(0);
                    var timeDefaultIsEstablished = false;

                    var addHour = function(date_ini, item, minutes) {
                        date_ini.add(minutes, "minutes");
                        var hour = {};

                        hour.turn = item.name;
                        hour.time = date_ini.format("HH:mm:ss");
                        hour.name = date_ini.format("H:mmA");
                        hours.push(hour);

                        if (!timeDefaultIsEstablished) {
                            if (date_ini.isAfter(now)) {
                                timeDefault = hour.time;
                                timeDefaultIsEstablished = true;
                            }
                        }
                    };

                    angular.forEach(turns, function(item) {
                        if (item.turn !== null) {
                            var date_ini = moment(item.turn.hours_ini, "HH:mm:ss");
                            var date_end = moment(item.turn.hours_end, "HH:mm:ss");
                            addHour(date_ini, item, 0);

                            for (var i = 1; i < 95; i++) {
                                addHour(date_ini, item, 15);
                                if (date_ini.isSame(date_end)) break;
                            }
                        }
                    });

                    data.hours = hours;
                    if (!timeDefault) {
                        if (hours.length) data.default = hours[hours.length - 1].time;
                    } else {
                        data.default = timeDefault;
                    }
                    deferred.resolve(data);
                    return deferred.promise;
                }
            };
        }
    ])
    .factory("reservationHelper", ["TableFactory", "screenSize", function(TableFactory, screenSize) {
        var loadTable = function(zones) {
            var itemZones = [];

            angular.forEach(zones, function(zone) {
                var item = {};
                var tables = [];
                angular.forEach(zone.tables, function(data) {
                    var position = data.config_position.split(",");
                    var left = (parseInt(position[0]) / screenSize.minSize) * 100 + "%";
                    var top = (parseInt(position[1]) / screenSize.minSize) * 100 + "%";
                    var size = TableFactory.getLabelSize(data.config_size) + "-relative";
                    var dataTable = {
                        name: data.name,
                        minCover: data.min_cover,
                        maxCover: data.max_cover,
                        left: left,
                        top: top,
                        shape: TableFactory.getLabelShape(data.config_forme),
                        size: size,
                        rotate: data.config_rotation,
                        id: data.id,
                        status: data.status,
                        reservations: {},
                        suggested: false,
                        selected: false,
                        block: false,
                        blockStatic: false,
                        occupied: false,
                        server: {
                            default: null,
                            reservation: null,
                            setDefault: function(color) {
                                this.default = "2px solid " + color;
                            },
                            setReservation: function(color){
                                this.reservation = "2px solid " + color;
                            }
                        },
                        class: {
                            name: null,
                            setStatusClass: function(status) {
                                if (status == 4) {
                                    this.name = "box-icon item-status-" + status;
                                }
                            }
                        }
                    };

                    if (data.status == 1) {
                        tables.push(dataTable);
                    }
                });
                item.name = zone.name;
                item.tables = tables;
                itemZones.push(item);
            });

            return itemZones;
        };

        return {
            loadTable: loadTable,
        };
    }])
    .factory("screenHelper", ["$window", function($window) {
        var size = function(screenSize) {

            var width = $window.innerWidth;
            var height = $window.innerHeight;
            var size;

            if (width - screenSize.menu >= height) {
                height -= screenSize.header;
                if (height < screenSize.minSize) {
                    size = screenSize.minSize;
                } else {
                    size = height;
                }
            } else if (height - screenSize.header >= width) {
                width -= screenSize.menu;
                if (width < screenSize.minSize) {
                    size = screenSize.minSize;
                } else {
                    size = width;
                }
            } else {
                size = screenSize.minSize;
            }

            return size - 30;
        };

        return {
            size: size,
        };
    }])
    .factory("$table", function() {
        var lastShowTimeEvent; 

        return {
            lastTimeEvent: function(action) {
                if (action == "reset") {
                    lastShowTimeEvent = null;
                } else {
                    return lastShowTimeEvent;
                }
            },
            paintTables: function(zones, tables) {
                angular.forEach(tables, function(table_use) {
                    angular.forEach(zones, function(zone) {
                        angular.forEach(zone.tables, function(table) {
                            if (table.id == table_use.id) {
                                table.selected = true;
                            }
                        });
                    });
                });
            },
            listTableSelected: function(zones, tablesSelected) {
                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        if (table.selected) {
                            tablesSelected[table.id] = angular.copy(table);
                        } else {
                            delete tablesSelected[table.id];
                        }
                    });
                });
            },
            tablesSuggested: function(zones, cant) {
                var tableSuggested = null;
                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                         if (cant >= table.minCover && cant <= table.maxCover) {
                            if (!table.occupied && !table.block) {
                                if (!tableSuggested) tableSuggested = angular.copy(table);
                                table.suggested = true;
                            }
                        } else {
                            table.suggested = false;
                        }
                    });
                });

                return tableSuggested;
            },
            tablesBlockValid: function(zones, blocks, reservation, editState, state_param_id) {
                // console.log("------------------------------------------------");
                var start_time =  moment(reservation.hour, "HH:mm:ss");
                var auxiliar =  moment(reservation.duration, "HH:mm:ss");
                var end_time = start_time.clone().add(auxiliar.hour(), "h").add(auxiliar.minute(), "m");
                // console.log(start_time.format("YYYY-MM-DD HH:mm:ss"), end_time.format("YYYY-MM-DD HH:mm:ss"));
                // console.log(blocks);
                angular.forEach(blocks, function(block){
                    var start_block =  moment(block.start_time, "HH:mm:ss");
                    var end_block =  moment(block.end_time, "HH:mm:ss");
                    angular.forEach(zones, function(zone) {
                        angular.forEach(zone.tables, function(table) {
                            if (table.id == block.res_table_id) {
                                if ( (start_time.isBetween(start_block, end_block,  null, "()") ) || 
                                        (end_time.isBetween(start_block, end_block, null, "()")) ||
                                            (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {

                                    if (block.res_reservation_id !== null) {
                                        if (!editState) {
                                            table.occupied = true;
                                            table.suggested = false;
                                        } else {
                                            if (block.res_reservation_id != state_param_id) {
                                                table.occupied = true;
                                                table.suggested = false;
                                            }
                                        }
                                    } else {
                                        table.block = true;
                                        table.suggested = false;
                                    }
                                } else {
                                    if (block.res_reservation_id !== null) {
                                        table.occupied = false;
                                    } else {
                                        table.block = false;
                                    }
                                }
                            }
                            });
                    });
                });
            },
            selectTableAllOrNone: function(zone, indicator) {
                if (indicator == "all") {
                    angular.forEach(zone.tables, function(table) {
                        table.selected = true;
                    });
                } else if (indicator == "none") {
                    angular.forEach(zone.tables, function(table) {
                        table.selected = false;
                    });
                }
            },
            setBorderColorForReservation: function(zones, blocks) {
                var hour = moment();

                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        table.server.reservation = null;
                        table.class.name = null;
                    });
                });

                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        angular.forEach(blocks, function(block) {
                            if (table.id == block.res_table_id) {
                                var start_block = moment(block.start_time, "HH:mm:ss");
                                var end_block = moment(block.end_time, "HH:mm:ss");
                                if (hour.isBetween(start_block, end_block, null, "()") || block.res_reservation_status_id == 4) {
                                    if (block.res_server_id) {
                                        table.server.setReservation(block.res_server.color);
                                    }
                                    table.class.setStatusClass(block.res_reservation_status_id);

                                    table.reservations.active = block;

                                    if (block.res_reservation_id === null) {
                                        table.block = true;
                                        table.blockStatic = true;
                                    }
                                } else {
                                    if (block.res_reservation_id === null) {
                                        table.block = false;
                                        table.blockStatic = false;
                                    }
                                }
                            }
                        });
                    });
                });
            },
            setColorTable: function(zones, servers) {
                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        angular.forEach(servers, function(server) {
                            angular.forEach(server.tables, function(serverTable) {
                                if (table.id == serverTable.id) {
                                    table.server.setDefault(server.color);
                                }
                            });
                        });
                    });
                });
            },
            getReservationTables: function(zones, blocks, reservation_id) {
                var reservationTables = "";
                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        angular.forEach(blocks, function(block) {
                            if (table.id == block.res_table_id) {
                                if (block.res_reservation_id == reservation_id) {
                                    reservationTables += table.name + ", ";
                                }
                            }
                        });
                    });
                });

                return reservationTables.substring(0, reservationTables.length - 2);
            },
            clearSelected: function(zones) {
                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        table.selected = false;
                    });
                });
            },
            getZoneIndexForTable: function(zones, serverTables) {
                if (serverTables.length === 0) {
                    return 0;
                }
                var index = null;
                angular.forEach(zones, function(zone, zone_index) {
                    if (index === null) {
                        angular.forEach(zone.tables, function(table) {
                            if (index === null) {
                                angular.forEach(serverTables, function(serverTable) {
                                    if (index === null) {
                                        if (table.id == serverTable.id) {
                                            index = zone_index;
                                        }
                                    }
                                });
                            }
                        });
                    }
                });

                return index;
            },
            tablesSelected: function(zones, serverTables) {
                if (serverTables.length === 0) {
                    return;
                }
                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        angular.forEach(serverTables, function(serverTable) {
                            if (table.id == serverTable.id) {
                                table.selected = true;
                            }
                        });
                    });
                });
            },
            tableFilter: function(zones, blocks, cant) {
                // Manejo estatico de tiempo de reserva por cantidad  de invitados
                var start_time = moment().add( - moment().minutes() % 15, "minutes").second(0).millisecond(0);
                var aux_duration = moment("2000-01-01").add((60 + 15 * cant), "minutes");
                var end_time = start_time.clone().add(aux_duration.hour(), "hours").add(aux_duration.minute(), "minutes");
                // console.log(start_time.format("HH:mm:ss"), end_time.format("HH:mm:ss"));
                angular.forEach(blocks, function(block) {
                    var start_block = moment(block.start_time, "HH:mm:ss");
                    var end_block = moment(block.end_time, "HH:mm:ss");
                    angular.forEach(zones, function(zone) {
                        angular.forEach(zone.tables, function(table) {
                            if (table.id == block.res_table_id && block.res_reservation_status_id < 14) {
                                if ((start_time.isBetween(start_block, end_block,  null, "()") ) || 
                                                    (end_time.isBetween(start_block, end_block, null, "()")) ||
                                                        (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {
                                    if (block.res_reservation_id !== null) {
                                                table.occupied = true;
                                                table.suggested = false;
                                    } else {
                                            table.block = true;
                                            table.suggested = false;
                                    }
                                }  else {
                                           if (block.res_reservation_id !== null) {
                                                      table.occupied = false;
                                           } else {
                                                      table.block = false;
                                           }
                                }
                            }
                        });
                    });
                });

                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        if (cant >= table.minCover && cant <= table.maxCover && !table.class.name) {
                                if (!table.occupied && !table.block) {
                                        table.suggested = true;
                                }
                        }
                    });
                });
            },
            tableFilterClear: function(zones) {
                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        table.occupied = false;
                        if(!table.blockStatic) table.block = false;
                        table.suggested = false;
                    });
                });
            },
            makeTime: function(zones, blocks, reservations, type) {
                // console.log(zones, blocks, reservations, type);
                /**
                 * Variable de apollo para grouptime, en metodo nextTime
                 */
                var lastTime;

                lastShowTimeEvent = type;

                angular.forEach(zones, function(zone) {
                    angular.forEach(zone.tables, function(table) {
                        table.time = {};
                        table.grouptime = [];
                    });
                });

                angular.forEach(reservations, function(reservation) {
                    angular.forEach(blocks, function(block) {
                        if (reservation.id == block.res_reservation_id) {
                            angular.forEach(zones, function(zone) {
                                angular.forEach(zone.tables, function(table) {
                                    if (table.id == block.res_table_id) {
                                        var now, start;
                                        if (reservation.datetime_input && reservation.res_reservation_status_id == 4){
                                            now = moment();

                                            if (type == "seated") {
                                                var input = moment(reservation.datetime_input);
                                                table.time.text = moment.utc(now.diff(input)).format("HH:mm");
                                            } else if (type == "complete") {
                                                var out = moment(block.end_time, "HH:mm:ss");
                                                var time = out.diff(now);
                                                if (time > 0) {
                                                    table.time.text = moment.utc(time).format("HH:mm");
                                                } else {
                                                    var auxTime = now.diff(out);
                                                    table.time.text = "-" + moment.utc(auxTime).format("HH:mm");
                                                }
                                                table.time.color = "#e7b300";
                                            }
                                        } else if (type == "nextTime") {
                                            now = moment();
                                            start = moment(block.start_time, "HH:mm:ss");
                                            // console.log(reservation.id, block.res_table_id,  start.format("HH:mm:ss"));
                                            var nextTime = start.diff(now);
                                            var auxNextTime;

                                            if (!table.time.established) {
                                                if  (nextTime > 0) {
                                                    table.time.text = moment.utc(nextTime).format("HH:mm");
                                                } else {
                                                    auxNextTime = now.diff(start);
                                                    table.time.text = "-" + moment.utc(auxNextTime).format("HH:mm");
                                                }
                                                table.time.color = "#ed615b";
                                                table.time.established = true;
                                            } else if (nextTime < 0){
                                                auxNextTime = now.diff(start);
                                                table.time.text = "-" + moment.utc(auxNextTime).format("HH:mm");
                                            }
                                        } else if (type == "nextTimeAll") {                             
                                            now = moment();
                                            start = moment(block.start_time, "HH:mm:ss");

                                            if (table.grouptime.length < 2) {
                                                var newTime = {}; 
                                                newTime.text = start.format("HH:mmA");
                                                newTime.time = start;
                                                table.grouptime.push(newTime);
                                            } else {
                                                var replaceTime = function(table, start) {
                                                    var established = false;
                                                    angular.forEach(table.grouptime, function(obj) {
                                                        if (!established) {
                                                            if (start.isBefore(obj.time)) {
                                                                var aux = obj.time;

                                                                obj.text = start.format("HH:mmA");
                                                                obj.time = start;

                                                                established = true;

                                                                return replaceTime(table, aux);
                                                            }
                                                        }
                                                    
                                                    });
                                                };

                                                replaceTime(table, start);
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    });
                });
            }
        };
    });