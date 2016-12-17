angular.module('grid.service', [])
    .factory('gridFactory', function($http, $q, TablesDataFactory, FloorFactory) {

        return {
            getTablesAvailability: function(params) {
                var defered = $q.defer();

                TablesDataFactory.getAvailability(params).then(
                    function success(response) {
                        defered.resolve(response.data);
                    },
                    function error(response) {
                        defered.reject(response.data);
                    }
                );
                return defered.promise;
            },
            getTurnsActives: function(date, reload) {
                return FloorFactory.listTurnosActivos(date, reload);
            }

        };
    });