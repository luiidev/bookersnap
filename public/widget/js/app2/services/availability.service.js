angular.module("App")
    .factory("availabilityService", ["$http", "base_url",function($http, base_url) {     
        return {
            getFormatAvailability: function(date) {
                return $http.get(base_url.url( "/api/availability/formatAvailability"), { params: {date: date}});
            },
            getAvailability: function(data) {
                return $http.get(base_url.url() + "/api/availability/basic", {
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
                return $http.post(base_url.url("/api/reservationtemporal"), data);
            },
            saveReservation: function(data) {
                return $http.post(base_url.url("/api/table/reservation/w"), data);
            },
            cancelReservation: function(reserveToken) {
                return $http.post(base_url.url("/api/table/reservation/cancel/" + reserveToken));
            },
            cancelTemporalReservation: function() {
                return $http.delete(base_url.url("/api/reservationtemporal"));
            },
            searchTemporalReserve: function() {
                return $http.get(base_url.url("/api/reservationtemporal"));
            },
            getDaysDisabled: function(data) {
                return $http.get(base_url.url("/api/availability/daysdisabled"), { params: data});
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
            url: function(path) {
                return _base_url + (path ? path : "");
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
    }]);