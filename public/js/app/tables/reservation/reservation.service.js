angular.module('reservation.service', [])
.factory("reservationService", ["$http", "ApiUrlMesas", "ApiUrlRoot", "quantityGuest", "$q",
     function(http, ApiUrlMesas, ApiUrlRoot, quantityGuest, $q) {
    return {
        getZones: function(date) {
            return http.get(ApiUrlMesas + "/calendar/" + date + "/zones");
        },
        getServers: function() {
            return http.get(ApiUrlMesas + "/servers");
        },
        getStatuses: function() {
            return http.get(ApiUrlRoot + "/reservation/status");
        },
        getTurns: function(date) {
            return http.get(ApiUrlMesas + "/calendar/" + date + "/shifts");
        },
        getBlocks: function(date) {
            return http.get(ApiUrlMesas + "/blocks/tables", {params: {date: date}});
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
            var timeDefault  = "";
            var data = {};

            var now = moment().add((15 - (parseInt(moment().format("mm")) % 15)), "minutes").second(0);
            var timeDefaultIsEstablished = false;

            angular.forEach(turns, function(item){
                    if (item.turn !== null) {
                        var date_ini = moment(item.turn.hours_ini, "HH:mm:ss");
                        var date_end = moment(item.turn.hours_end, "HH:mm:ss");
                        for (var i = 1; i < 96; i++) {
                               date_ini.add(15, "minutes");
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

                               if (date_ini.isSame(date_end)) break;
                        }
                    }
            });

            data.hours = hours;
            data.default = timeDefault;
            deferred.resolve(data);
            return deferred.promise;
        }
    };
}])
.factory("reservationHelper", ["TableFactory", "reservationScreenHelper", function(TableFactory, screenHelper){
    var loadTable = function(zones) {
        var itemZones = [];

        angular.forEach(zones, function(zone) {
            var item = {};
            var tables = [];
            angular.forEach(zone.tables, function(data) {
                var position = data.config_position.split(",");
                var left = (parseInt(position[0])  / screenHelper.minSize() ) * 100 + "%";
                var top = (parseInt(position[1]) / screenHelper.minSize()) * 100 + "%";
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
        loadTable: loadTable
    };
}])
.factory("reservationScreenHelper", ["$window", "screenSize", function($window, screenSize) {
    var size = function() {

        var width = $window.innerWidth;
        var height = $window.innerHeight;
        var size;
        
        if (width >= height){
            height -= screenSize.header;
            if (height  < screenSize.minSize) {
                size =  screenSize.minSize;
            } else {
                size = height ;
            }
        } else {
            width -= screenSize.menu;
            if (width  < screenSize.minSize) {
                size =  screenSize.minSize;
            } else {
                size = width;
            }
        }

        return size - 30;
    };

    var minSize = function(){
        return screenSize.minSize;
    };

    return {
        size: size,
        minSize: minSize
    };
}]);