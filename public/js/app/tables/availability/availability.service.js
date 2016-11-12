angular.module('availability.service', [])
    .service('AvailabilityDataService', function($http, ApiUrlMesas) {
        return {
            getAvailability: function(config) {
                return $http.get(ApiUrlMesas + "/availability/basic", {
                    params: {
                        date: config.date,
                        hour: config.hour,
                        num_guests: config.num_guest,
                        next_day: 0,
                        zone_id: config.zone_id
                    }
                });
            },
            getZones: function(date) {
                return $http.get(ApiUrlMesas + "/availability/zones", {
                    params: {
                        date: date
                    }
                });
            },
        };
    })
    .service('ReservationTemporalDataService', function($http, ApiUrlMesas) {
        return {
            createReservationTemporal: function(config) {
                return $http.post(ApiUrlMesas + "/reservationtemporal", {}, {
                    params: {
                        date: config.date,
                        hour: config.hour,
                        num_guests: config.num_guests,
                        next_day: config.next_day,
                        zone_id: config.zone_id
                    }
                });
            },
        };
    })
    .service('ReservationTemporalService', function($q, ReservationTemporalDataService) {
        return {
            createReservationTemporal: function(config) {
                var defered = $q.defer();
                var promise = defered.promise;
                ReservationTemporalDataService.createReservationTemporal(config).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            }
        };
    })
    .service('AvailabilityService', function($q, AvailabilityDataService, ConfigurationDataService) {
        return {
            getAvailability: function(config) {
                var defered = $q.defer();
                var promise = defered.promise;
                AvailabilityDataService.getAvailability(config).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            getZones: function(date) {
                var defered = $q.defer();
                var promise = defered.promise;
                AvailabilityDataService.getZones(date).success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            getConfig: function() {
                var defered = $q.defer();
                var promise = defered.promise;
                ConfigurationDataService.getConfiguration().success(function(data) {
                    data = data.data;
                    defered.resolve(data);
                }).error(function(data, status, headers) {
                    var response = jsonErrorData(data, status, headers);
                    defered.reject(response);
                });
                return promise;
            },
            getGuest: function(cant) {
                var guest = [];
                for (var i = 1; i <= cant; i++) {
                    guest.push({
                        id: i,
                        option: i + " " + "INVITADOS"
                    });
                }
                return guest;
            }
        };
    });