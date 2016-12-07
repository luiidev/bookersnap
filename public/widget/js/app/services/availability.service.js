angular.module("App")
    .factory("availabilityService", ["$http", "$q", "ApiUrlMesas", function($http, $q, ApiUrlMesas) {
        return {
            getFormatAvailability: function(data) {
                return $http.get(ApiUrlMesas + "/availability/formatAvailability", data);
            },
            getAvailability: function(data) {
                return $http.get(ApiUrlMesas + "/availability/basic", {
                    params: {
                        date: data.date,
                        hour: data.hour.option,
                        next_day: data.hour.next_day,
                        num_guests: data.num_guests,
                        zone_id: data.zone_id
                    }
                });
                // date: config.date,
                // hour: config.hour.option,
                // next_day: config.hour.next_day,
                // num_guests: config.num_guest,
                // zone_id: config.zone_id
            },
            // getZones: function(date) {
            //     return $http.get(ApiUrlMesas + "/availability/zones", {
            //         params: {
            //             date: date
            //         }
            //     });
            //     // date: config.date
            // },
            // getHours: function(data) {
            //     return $http.get(ApiUrlMesas + "/availability/hours", {
            //         params: data
            //     });
            //     // date: config.date,
            //     // zone_id: config.zoneId
            // },
            getEvents: function(data) {
                return $http.get(ApiUrlMesas + "/availability/events", {
                    params: data
                });
                // date: config.date,
                // hour: config.hour.option,
                // next_day: config.hour.next_day,
                // zone_id: config.zone
            },
            // getGuests: function(cant) {
            //     var deferred = $q.defer();

            //     var guests = [];
            //     guests.push({
            //         id: 1,
            //         name: "1 Persona"
            //     });
            //     for (var i = 2; i <= cant; i++) {
            //         guests.push({
            //             id: i,
            //             name: (i + " Personas")
            //         });
            //     }
            //     deferred.resolve(guests);
            //     return deferred.promise;
            // },
        };
    }])
    .factory("utiles", [function() {
        return {
            filterHour: function(hours, defaultItem) {
                var timeDefault;

                var now = moment().add((15 - (parseInt(moment().format("mm")) % 15)), "minutes").second(0).millisecond(0);
                var timeDefaultIsEstablished = false;

                var defaultHour = defaultItem ? moment(defaultItem.option, "HH:mm:ss") : null;

                angular.forEach(hours, function(hour) {
                    if (!timeDefaultIsEstablished || defaultHour) {
                        var hourTime = moment(hour.option, "HH:mm:ss");
                        if (hourTime.isSameOrAfter(now) && !timeDefaultIsEstablished) {
                            timeDefault = hour;
                            timeDefaultIsEstablished = true;
                        }
                        if (hourTime.isSame(defaultHour)) {
                            timeDefault = hour;
                        }
                    }
                });

                if (!timeDefault) {
                    if (hours.length > 0) {
                        timeDefault = hours[hours.length - 1];
                    }
                }

                return timeDefault;
            }
        };
    }]);