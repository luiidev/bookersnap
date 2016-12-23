angular.module("App")
    .factory("availabilityService", ["$http", "$q", "ApiUrlMesas", "$storage",function($http, $q, ApiUrlMesas, $storage) {
        var storage = $storage.instance;

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
            saveTemporalReserve: function(data) {
                return $http.post(ApiUrlMesas + "/reservationtemporal", data , {headers: { "token": storage._token }});
            },
            saveReservation: function(data) {
                return $http.post(ApiUrlMesas + "/table/reservation/w", data);
            },
            cancelReservation: function(reserveToken) {
                return $http.post(ApiUrlMesas + "/table/reservation/cancel/" + reserveToken);
            },
            cancelTemporalReservation: function() {
                return $http.delete(ApiUrlMesas + "/reservationtemporal/" + storage._token);
            },
            searchTemporalReserve: function() {
                return $http.get(ApiUrlMesas + "/reservationtemporal/" + storage._token);
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
    }])
    .factory("_base_url", ["$location", function($location) {

        var _base_url = $location.protocol() + "://" + $location.host() + "/v2/w/" + microsite;

        return _base_url;
    }])
    .factory("$storage", ["$localStorage", function($localStorage) {
            var instance = $localStorage.$default({ _token: "abcdefghijklmnopqrstuvwxyz" });

            return {
                existToken: function() {
                    return Object.prototype.toString.call(instance._token)  == "[object String]";
                }, 
                instance: instance
            };
    }]);