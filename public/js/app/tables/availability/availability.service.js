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
    .service('AvailabilityService', function($q, AvailabilityDataService) {
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
            }
        };
    });