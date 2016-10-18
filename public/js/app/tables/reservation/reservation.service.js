angular.module('reservation.service', [])
.factory("reservationService", ["$http","HttpFactory", "ApiUrlMesas", "ApiUrlRoot", "quantityGuest", "$q",
     function(http, HttpFactory, ApiUrlMesas, ApiUrlRoot, quantityGuest, $q) {
        var zones, servers, resStatus, turns, blocks, tags;
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
                        suggested: false,
                        selected: false,
                        block: false,
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
    }]);