angular.module("App")
    .factory("availabilityService", ["$http", "$q", "ApiUrlMesas", function($http, $q, ApiUrlMesas) {
        return {
            getFormatAvailability: function(date) {
                return $http.get(ApiUrlMesas + "/availability/formatAvailability", { params: {date: date}});
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
            },
            getEvents: function(data) {
                return $http.get(ApiUrlMesas + "/availability/events", {
                    params: data
                });
            },
            saveReservation: function(data) {
                return $http.post(ApiUrlMesas + "/table/reservation/w", data);
            },
            cancelReservation: function(data) {
                return $http.post(ApiUrlMesas + "/table/reservation/cancel/" + data);
            }
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