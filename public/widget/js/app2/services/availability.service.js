angular.module("App")
    .factory("availabilityService", ["$http", "$q", "ApiUrlMesas", "$storage", "base_url",function($http, $q, ApiUrlMesas, $storage, base_url) {
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
                return $http.post(base_url.getUrl() + "/api/reservationtemporal", data , {headers: { "token": storage._token }});
            },
            saveReservation: function(data) {
                return $http.post(base_url.getUrl() + "/api/table/reservation/w", data);
            },
            cancelReservation: function(reserveToken) {
                return $http.post(base_url.getUrl() + "/api/table/reservation/cancel/" + reserveToken);
            },
            cancelTemporalReservation: function() {
                return $http.delete(base_url.getUrl() + "/api/reservationtemporal/" + storage._token);
            },
            searchTemporalReserve: function() {
                return $http.get(base_url.getUrl() + "/api/reservationtemporal/" + storage._token);
            },
            getDaysDisabled: function(data) {
                return $http.get(base_url.getUrl() + "/api/availability/daysdisabled", { params: data});
            },
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
    .factory("base_url", ["$location", function($location) {
        var _base_url = $location.protocol() + "://" + $location.host() + "/w/" + microsite;

        var params = "";
        var c = 0;
        angular.forEach($location.search(), function(value, i) {
            if (i !== "edit") {
                params += (c === 0 ? "" : "&") + i + "=" + value;
                c++;
            }
        });

        params = params === "" ? "" : "#/?" + params;

        return {
            getUrl: function() {
                return _base_url;
            },
            get: function(path) {
                return _base_url + path + params;
            },
            getWithParam: function(obj_params) {
                var other_params = "";
                angular.forEach(obj_params, function(value, i) {
                    other_params += "&" + i + "=" + value;
                });

                return _base_url + (params === "" ?  "#/?" + other_params : params + other_params);
            },
            has: function(search) {
                return $location.search()[search] !== undefined;
            }
        };
    }])
    .factory("$storage", [function() {
            var storage = localStorage;
            if (storage._token === undefined) {
                storage.setItem("_token", "abcdefghijklmnopqrstuvwxyz");
            }

            return {
                existToken: function() {
                    return Object.prototype.toString.call(storage._token)  == "[object String]";
                }, 
                instance: storage
            };
    }]);