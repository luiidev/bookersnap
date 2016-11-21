angular.module('reservation.service', [])
    .factory("reservationService", ["$http", "HttpFactory", "ApiUrlMesas", "ApiUrlRoot", "quantityGuest", "$q",
        function(http, HttpFactory, ApiUrlMesas, ApiUrlRoot, quantityGuest, $q) {
            var zones, servers, resStatus, turns, blocks, tags, reservations, configuration;

            /**
             * Lista negra de eventos de WS que no deben ejecutarse,
             * por que el usuario actual es quien las emitio
             * @type {object}
             */
            var blackListMethods = {};
            blackList = [];

            blackListMethods.add = function(key) {
                blackList.push(key);
            };

            blackListMethods.key = function(obj) {
                var key = Math.random().toString(36).substring(2, 7);
                this.add(key);

                if (obj) {
                    obj.key = key;
                    return obj;
                }

                return key;
            };

            blackListMethods.contains = function(key) {
                return blackList.indexOf(key) !== -1;
            };
            /**
             * END
             */

            return {
                blackList: blackListMethods,
                save: function(data) {
                    return http.post(ApiUrlMesas + "/table/reservation", data);
                },
                patchReservation: function(data) {
                    return http.patch(ApiUrlMesas + "/reservations/" + data.id, data);
                },
                quickCreate: function(data) {
                    return http.post(ApiUrlMesas + "/table/reservation/quickcreate", data);
                },
                edit: function(id, data) {
                    return http.put(ApiUrlMesas + "/table/reservation/" + id, data);
                },
                quickEdit: function(id, data) {
                    return http.put(ApiUrlMesas + "/table/reservation/" + id + "/quickedit", data);
                },
                cancel: function(id, data) {
                    return http.put(ApiUrlMesas + "/table/reservation/" + id + "/cancel", data);
                },
                sit: function(id, data) {
                    return http.put(ApiUrlMesas + "/table/reservation/" + id + "/sit", data);
                },
                createWaitList: function(data) {
                    return http.post(ApiUrlMesas + "/waitlist", data);
                },
                updateWaitList: function(data) {
                    return http.put(ApiUrlMesas + "/waitlist", data);
                },
                deleteWaitList: function(id, data) {
                    return http.delete(ApiUrlMesas + "/waitlist/" + id, {
                        params: data
                    });
                },
                getReservation: function(id) {
                    return http.get(ApiUrlMesas + "/table/reservation/" + id + "/edit");
                },
                getZones: function(date, reload) {
                    zones = HttpFactory.get(ApiUrlMesas + "/calendar/" + date + "/zones", null, zones, reload);
                    return zones;
                },
                getServers: function(reload) {
                    servers = HttpFactory.get(ApiUrlMesas + "/servers", null, servers, reload);
                    return servers;
                },
                getStatuses: function(reload) {
                    resStatus = HttpFactory.get(ApiUrlRoot + "/reservation/status", null, resStatus, reload);
                    return resStatus;
                },
                getTurns: function(date, reload) {
                    turns = HttpFactory.get(ApiUrlMesas + "/calendar/" + date + "/shifts", null, turns, reload);
                    return turns;
                },
                getBlocks: function(date, reload) {
                    blocks = HttpFactory.get(ApiUrlMesas + "/blocks/tables", {
                        params: {
                            date: date
                        }
                    }, blocks, reload);
                    return blocks;
                },
                getGuestList: function(name) {
                    return http.get(ApiUrlMesas + "/guests", {
                        params: {
                            name: name,
                            page_size: 8
                        }
                    });
                },
                getReservationTags: function(reload) {
                    tags = HttpFactory.get(ApiUrlMesas + "/reservation/tag", null, tags, reload);
                    return tags;
                },
                getReservations: function(reload, params) {
                    params = (params === undefined || params === null) ? "" : params;
                    reservations = HttpFactory.get(ApiUrlMesas + "/reservations?" + params, null, reservations, reload);
                    return reservations;
                },
                getConfigurationRes: function(reload) {
                    configuration = HttpFactory.get(ApiUrlMesas + "/configuration/reservations", null, configuration, reload);
                    return configuration;
                },
                getGuest: function() {
                    var deferred = $q.defer();

                    var guests = [];
                    guests.push({
                        id: 1,
                        name: "1 Invitado"
                    });
                    for (var i = 2; i < quantityGuest; i++) {
                        guests.push({
                            id: i,
                            name: (i + " Invitados")
                        });
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
                        hour.name = date_ini.format("H:mm A");
                        hour.turn_id = item.turn.id;
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
    .factory("reservationHelper", ["TableFactory", "$interval", "$q", function(TableFactory, $interval, $q) {
        var loadTable = function(zones) {
            var dataZones = [];
            dataZones.tables = [];
            dataZones.tActive = null;

            angular.forEach(zones, function(zone, zone_index) {
                var item = {};
                var tables = [];
                angular.forEach(zone.tables, function(data) {
                    var position = data.config_position.split(",");
                    var left = (parseInt(position[0]) / 675) * 100 + "%";
                    var top = (parseInt(position[1]) / 675) * 100 + "%";
                    var size = TableFactory.getLabelSize(data.config_size) + "-relative";
                    var dataTable = {
                        zone: {
                            index: zone_index,
                            name: zone.name,
                            number: zone_index + 1
                        },
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
                        reservations: {
                            active: null,
                            data: []
                        },
                        blocks: {
                            active: null,
                            data: []
                        },
                        blocksPermanent: {
                            active: null,
                            data: data.turns
                        },
                        time: {
                            seated: {
                                text: null,
                                color: "#33c200"
                            },
                            complete: {
                                text: null,
                                color: "#e7b300"
                            },
                            nextTime: {
                                text: null,
                                color: "#ed615b"
                            },
                            nextTimeAll: []
                        },
                        events: [],
                        suggested: false,
                        selected: false,
                        block: false,
                        occupied: false,
                        server: {
                            color: null,
                        },
                        borderColor: function() {
                            if (this.reservations.active) {
                                if (this.reservations.active.server) {
                                    return "2px solid " + this.reservations.active.server.color;
                                }
                            }
                            if (this.server) {
                                return "2px solid " + this.server.color;
                            }
                            return null;
                        }
                    };

                    if (data.status == 1) {
                        tables.push(dataTable);
                    }
                });
                item.name = zone.name;
                item.tables = tables;
                dataZones.push(item);
                Array.prototype.push.apply(dataZones.tables, tables);
            });

            return dataZones;
        };

        var dataZones;
        var loadTableV2 = function(zones, add) {
            dataZones = loadTable(zones);

            /**
             * Funciones internas
             */
            // dataZones.setColorTables = setColorTables;
            dataZones.tablesSelected = tablesSelected;
            dataZones.notSelect = notSelect;
            dataZones.clearSelected = clearSelected;
            dataZones.tableFilter = tableFilter;
            dataZones.tableFilterClear = tableFilterClear;
            dataZones.getZoneForTables = getZoneForTables;
            /**
             * END
             */

            /**
             * Funciones de cambios de estado con el tiempo
             */
            allCases.blocksPermanent();
            if (Object.prototype.toString.call(add) == "[object Object]") {
                if (typeof allCases[add.name] == "function") {
                    allCases[add.name](add.data);
                }
            } else if (Object.prototype.toString.call(add) == "[object Array]") {
                angular.forEach(add, function(a) {
                    if (typeof allCases[a.name] == "function") {
                        allCases[a.name](a.data);
                    }
                });
            }
            /**
             * END
             */

            return dataZones;
        };

        /**
         * Funciones de manejo interno
         */
        var tablesSelected = function(selectTables) {
            angular.forEach(this.tables, function(table) {
                angular.forEach(selectTables, function(selectTable) {
                    if (table.id == selectTable.id) {
                        table.selected = true;
                    }
                });
            });
        };
        var notSelect = function(tableObj) {
            angular.forEach(this.tables, function(table) {
                if (table.id == tableObj.id) {
                    table.selected = false;
                }
            });
        };
        var clearSelected = function() {
            angular.forEach(this.tables, function(table) {
                table.selected = false;
            });
        };
        var tableFilter = function(cant) {
            // Manejo estatico de tiempo de reserva por cantidad  de invitados
            var start_time = moment().add(-moment().minutes() % 15, "minutes").second(0).millisecond(0);
            var end_time = start_time.clone().add((60 + 15 * cant), "minutes");
            // console.log(start_time.format("HH:mm:ss"), end_time.format("HH:mm:ss"));

            angular.forEach(this.tables, function(table) {
                angular.forEach(table.blocks.data, function(block) {
                    if (block.res_reservation_status_id < 4) {
                        var start_block = moment(block.start_time, "HH:mm:ss");
                        var end_block = moment(block.end_time, "HH:mm:ss");
                        if ((start_time.isBetween(start_block, end_block, null, "()")) ||
                            (end_time.isBetween(start_block, end_block, null, "()")) ||
                            (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {
                            if (block.res_reservation_id !== null) {
                                table.occupied = true;
                                table.suggested = false;
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
                if (cant >= table.minCover && cant <= table.maxCover && !table.reservations.active) {
                    if (!table.occupied && !table.block) {
                        table.suggested = true;
                    }
                }
            });
        };
        var tableFilterClear = function() {
            angular.forEach(this.tables, function(table) {
                table.occupied = false;
                table.block = false;
                table.suggested = false;
            });
        };
        var getZoneForTables = function(tables) {
            var indexes = [];
            var aux = [];
            for (var i = 0; i < this.tables.length; i++) {
                for (var x = 0; x < tables.length; x++) {
                    if (this.tables[i].id == tables[x].id) {
                        if (aux.indexOf(this.tables[i].zone.name) === -1) {
                            indexes.push(this.tables[i].zone);
                            aux.push(this.tables[i].zone.name);
                        }
                    }
                }
            }

            return indexes;
        };
        /**
         * END
         */

        var allCases = {
            blocks: function(blocks) {
                angular.forEach(dataZones.tables, function(table) {
                    angular.forEach(blocks, function(block) {
                        if (table.id == block.res_table_id) {
                            if (block.res_reservation_id === null) {
                                table.blocks.data.push(block);
                                addEvent(table, block.start_time, block.end_time,
                                    function(table, block) {
                                        table.blocks.active = block;
                                    },
                                    function(table) {
                                        table.blocks.active = null;
                                    }, block);
                            }
                        }
                    });
                });
            },
            blocksPermanent: function() {
                angular.forEach(dataZones.tables, function(table) {
                    if (Object.prototype.toString.call(table.blocksPermanent.data) == "[object Array]") {
                        angular.forEach(table.blocksPermanent.data, function(turn) {
                            var end_time = {
                                time: turn.end_time,
                                add: {
                                    minutes: 15
                                }
                            };
                            addEvent(table, turn.start_time, end_time,
                                function(table, block) {
                                    table.blocksPermanent.active = block;
                                },
                                function(table) {
                                    table.blocksPermanent.active = null;
                                }, turn);
                        });
                    }
                });
            },
            reservations: function(reservations) {
                angular.forEach(dataZones.tables, function(table) {
                    angular.forEach(reservations, function(reservation) {
                        angular.forEach(reservation.tables, function(reserv_table) {
                            if (table.id == reserv_table.id) {
                                table.reservations.data.push(reservation);
                            }
                        });
                    });
                    table.reservations.add = function(reservation, pref) {
                        if (Object.prototype.toString.call(reservation) == "[object Object]") {
                            table.reservations.data.push(reservation);
                            table.reservations.active = null;
                            table.reservations.timeReload();
                        }
                    };
                    table.reservations.remove = function(reservation) {
                        if (Object.prototype.toString.call(reservation) == "[object Object]") {
                            angular.forEach(table.reservations.data, function(data, i) {
                                if (data.id == reservation.id) {
                                    table.reservations.data.splice(i, 1);
                                }
                            });
                        }
                        table.reservations.active = null;
                        table.reservations.timeReload();

                    };
                    table.reservations.timeReload = function() {
                        table.time.seated.text = null;
                        table.time.complete.text = null;
                        table.time.nextTime.text = null;
                        table.time.nextTimeAll.length = 0;
                        angular.forEach(table.reservations.data, function(reservation) {
                            var now = moment();
                            var reserv_start = moment(reservation.date_reservation + " " + reservation.hours_reservation);

                            if (reservation.datetime_input && reservation.res_reservation_status_id == 4) {
                                table.reservations.active = reservation;

                                cancelEvent(table.reservations.oldEvent1);
                                table.reservations.oldEvent1 = addRecursiveEvent(table, function(table, event) {
                                    // Seated
                                    if (table.reservations.active) {
                                        var now = moment();
                                        var sit = moment(table.reservations.active.datetime_input);
                                        table.time.seated.text = moment.utc(now.diff(sit)).format("HH:mm");
                                    } else {
                                        event.cancel = true;
                                    }
                                });

                                cancelEvent(table.reservations.oldEvent2);
                                table.reservations.oldEvent2 = addRecursiveEvent(table, function(table, event) {
                                    // Complete
                                    if (table.reservations.active) {
                                        var now = moment();
                                        var reserv_start = moment(table.reservations.active.date_reservation + " " + table.reservations.active.hours_reservation);
                                        var time = reserv_start.diff(now);
                                        if (time > 0) {
                                            table.time.complete.text = moment.utc(time).format("HH:mm");
                                        } else {
                                            var auxTime = now.diff(reserv_start);
                                            table.time.complete.text = "-" + moment.utc(auxTime).format("HH:mm");
                                        }
                                    } else {
                                        event.cancel = true;
                                    }
                                });
                            } else {

                                //  NextTime
                                (function() {
                                    var nextTime = reserv_start.diff(now);
                                    var auxNextTime;

                                    if (!table.time.nextTime.established) {
                                        if (nextTime > 0) {
                                            table.time.nextTime.text = moment.utc(nextTime).format("HH:mm");
                                        } else {
                                            auxNextTime = now.diff(reserv_start);
                                            table.time.nextTime.text = "-" + moment.utc(auxNextTime).format("HH:mm");
                                        }
                                        table.time.nextTime.established = true;
                                    } else if (nextTime < 0) {
                                        auxNextTime = now.diff(reserv_start);
                                        table.time.nextTime.text = "-" + moment.utc(auxNextTime).format("HH:mm");
                                    }
                                })();

                                //  NextTimeAll
                                (function() {
                                    if (table.time.nextTimeAll.length < 2) {
                                        var newTime = {};
                                        newTime.text = reserv_start.format("HH:mmA");
                                        newTime.time = reserv_start;
                                        table.time.nextTimeAll.push(newTime);
                                    } else {
                                        var replaceTime = function(table, reserv_start) {
                                            var established = false;
                                            angular.forEach(table.time.nextTimeAll, function(obj) {
                                                if (!established) {
                                                    if (reserv_start.isBefore(obj.time)) {
                                                        var aux = obj.time;

                                                        obj.text = reserv_start.format("HH:mmA");
                                                        obj.time = reserv_start;

                                                        established = true;

                                                        return replaceTime(table, aux);
                                                    }
                                                }

                                            });
                                        };

                                        replaceTime(table, reserv_start);
                                    }
                                })();

                            }
                        });
                    };

                    table.reservations.timeReload();

                });
            },
            servers: function(servers) {
                angular.forEach(dataZones.tables, function(table) {
                    angular.forEach(servers, function(server) {
                        angular.forEach(server.tables, function(serverTable) {
                            if (table.id == serverTable.id) {
                                table.server = server;
                            }
                        });
                    });
                });
            }
        };

        var cancelEvent = function(event) {
            if (event) {
                if (event.timeoutID) {
                    $interval.cancel(event.timeoutID);
                }
            }
        };

        var addRecursiveEvent = function(table, recursiveEvent) {
            table.events = table.events || [];
            var event = newRecursiveEvent(table, recursiveEvent);
            table.events.push(event);
            return event;
        };

        var newRecursiveEvent = function(table, recursiveEvent) {
            var event = {};
            event.recursiveEvent = recursiveEvent;
            event.cancel = false;
            event.fire = function() {
                try {
                    var deferred = $q.defer();
                    if (!event.cancel) {
                        event.recursiveEvent(table, event);
                        deferred.resolve();
                    } else {
                        $interval.cancel(event.timeoutID);
                    }

                    return deferred.promise;
                } catch (e) {
                    console.log("Event error: ", e);
                }
            };
            event.fire().then(function() {
                event.timeoutID = $interval(event.fire, 60000);
            });

            return event;
        };

        var addEvent = function(table, start_time, end_time, startCallback, endCallback, arg) {
            table.events = table.events || [];
            var event = newEvent(table, start_time, end_time, startCallback, endCallback, arg);
            table.events.push(event);
            return event;
        };

        var newEvent = function(table, start_time, end_time, startEvent, endEvent, arg) {
            var event = {};
            event.start = start_time;
            event.end = end_time;
            event.startTime = datetime(start_time);
            event.endTime = datetime(end_time);
            event.startEvent = startEvent;
            event.endEvent = endEvent;
            event.fire = function() {
                try {
                    var deferred = $q.defer();
                    var time = moment();
                    // console.log(time.format("HH:mm:ss"), event.startTime.format("HH:mm:ss"), event.endTime.format("HH:mm:ss"));
                    if (time.isBetween(event.startTime, event.endTime)) {
                        event.startEvent(table, arg);
                    } else {
                        if (time.isAfter(event.endTime)) {
                            if (event.timeoutID) {
                                event.endEvent(table, arg);
                            }
                            $interval.cancel(event.timeoutID);
                        }
                    }
                    deferred.resolve();
                    return deferred.promise;
                } catch (e) {
                    console.log("Event error: ", e);
                }
            };
            event.fire().then(function() {
                event.timeoutID = $interval(event.fire, 60000);
            });

            return event;
        };

        var datetime = function(time) {
            var datetime;
            if (Object.prototype.toString.call(time) == "[object Object]") {
                datetime = moment(time.time, "HH:mm:ss").add(time.add);
            } else {
                datetime = moment(time, "HH:mm:ss");
            }
            return datetime;
        };

        return {
            loadTable: loadTable,
            loadTableV2: loadTableV2
        };
    }])
    .factory("screenHelper", ["$window", function($window) {
        var size = function(screenSize) {

            var width = $window.innerWidth;
            var height = $window.innerHeight;
            var size;

            if (width - screenSize.menu >= height - screenSize.header) {
                height -= screenSize.header;
                if (height < screenSize.minSize) {
                    size = screenSize.minSize;
                } else {
                    size = height;
                }
            } else if (height - screenSize.header >= width - screenSize.menu) {
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
            setTimeEvent: function(action) {
                lastShowTimeEvent = action;
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
                var start_time = moment(reservation.hour, "HH:mm:ss");
                var auxiliar = moment(reservation.duration, "HH:mm:ss");
                var end_time = start_time.clone().add(auxiliar.hour(), "h").add(auxiliar.minute(), "m");
                // console.log(start_time.format("YYYY-MM-DD HH:mm:ss"), end_time.format("YYYY-MM-DD HH:mm:ss"));
                // console.log(blocks);
                angular.forEach(blocks, function(block) {
                    var start_block = moment(block.start_time, "HH:mm:ss");
                    var end_block = moment(block.end_time, "HH:mm:ss");
                    angular.forEach(zones, function(zone) {
                        angular.forEach(zone.tables, function(table) {
                            if (table.id == block.res_table_id) {
                                if ((start_time.isBetween(start_block, end_block, null, "()")) ||
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
            tablesSuggestedDinamyc: function(tables, blocks, cant, hour) {
                // console.log(tables, blocks, cant, hour);
                // console.log("------------------------------------------------");

                var start_time = hour ? moment(hour, "HH:mm:ss") : moment();
                var auxiliar = moment("2000-01-01").add((60 + 15 * cant), "minutes");
                var end_time = start_time.clone().add(auxiliar.hour(), "h").add(auxiliar.minute(), "m");
                console.log(start_time.format("YYYY-MM-DD HH:mm:ss"), end_time.format("YYYY-MM-DD HH:mm:ss"));
                // console.log(blocks);
                angular.forEach(blocks, function(block) {
                    if (tableSuggested) return; // Si ya se sugirio una mesa sale del bucle
                    var start_block = moment(block.start_time, "HH:mm:ss");
                    var end_block = moment(block.end_time, "HH:mm:ss");
                    angular.forEach(tables, function(table) {
                        if (table.id == block.res_table_id) {
                            // Comprobar si el horario coincide con una reservacion o bloqueo
                            if ((start_time.isBetween(start_block, end_block, null, "()")) ||
                                (end_time.isBetween(start_block, end_block, null, "()")) ||
                                (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {

                                if (block.res_reservation_id !== null) {
                                    table.occupied = true;
                                    table.suggested = false;
                                } else {
                                    block = true;
                                    table.suggested = false;
                                }
                            } else { // Caso no coincida resetea su estado. El listado de bloqueos esta en orden de hora ascendente.
                                if (block.res_reservation_id !== null) {
                                    table.occupied = false;
                                } else {
                                    table.block = false;
                                }
                            }
                        }
                    });
                });

                var tableSuggested = null;

                angular.forEach(tables, function(table) {
                    if (tableSuggested) return;
                    if (cant >= table.minCover && cant <= table.maxCover) {
                        if (!table.occupied && !table.block) {
                            if (!tableSuggested) {
                                tableSuggested = angular.copy(table);
                            }
                        }
                    }
                });

                return tableSuggested;
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
                var start_time = moment().add(-moment().minutes() % 15, "minutes").second(0).millisecond(0);
                var aux_duration = moment("2000-01-01").add((60 + 15 * cant), "minutes");
                var end_time = start_time.clone().add(aux_duration.hour(), "hours").add(aux_duration.minute(), "minutes");
                // console.log(start_time.format("HH:mm:ss"), end_time.format("HH:mm:ss"));
                angular.forEach(blocks, function(block) {
                    var start_block = moment(block.start_time, "HH:mm:ss");
                    var end_block = moment(block.end_time, "HH:mm:ss");
                    angular.forEach(zones, function(zone) {
                        angular.forEach(zone.tables, function(table) {
                            if (table.id == block.res_table_id && block.res_reservation_status_id < 14) {
                                if ((start_time.isBetween(start_block, end_block, null, "()")) ||
                                    (end_time.isBetween(start_block, end_block, null, "()")) ||
                                    (start_time.isSameOrBefore(start_block) && end_time.isSameOrAfter(end_block))) {
                                    if (block.res_reservation_id !== null) {
                                        table.occupied = true;
                                        table.suggested = false;
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
                        if (!table.blockStatic) table.block = false;
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
                                        if (reservation.datetime_input && reservation.res_reservation_status_id == 4) {
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
                                                if (nextTime > 0) {
                                                    table.time.text = moment.utc(nextTime).format("HH:mm");
                                                } else {
                                                    auxNextTime = now.diff(start);
                                                    table.time.text = "-" + moment.utc(auxNextTime).format("HH:mm");
                                                }
                                                table.time.color = "#ed615b";
                                                table.time.established = true;
                                            } else if (nextTime < 0) {
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