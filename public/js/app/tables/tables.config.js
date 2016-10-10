var idMicrositio = obtenerIdMicrositio();

angular.module('tables.app', [
        'turn.app',
        'zone.app',
        'book.app',
        'block.app',
        'guest.app',
        'calendar.app',
        'floor.app',
        'reservation.app',
        'bookersnap.services'
    ])
    .constant("IdMicroSitio", idMicrositio)
    .constant("ApiUrlMesas", 'http://apimesas.studework.com/v1/es/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://apimesas.studework.com/v1/es')
    //    .constant("ApiUrlMesas", 'http://192.168.0.105/v1/es/microsites/' + idMicrositio)
    //    .constant("ApiUrlRoot", 'http://192.168.0.105/v1/es')
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        //console.log($httpProvider);
        /*$httpProvider.defaults.paramSerializer = {
            ignoreLoadingBar: true
        };*/
        $stateProvider
            .state('mesas', {
                url: '/mesas',
                templateUrl: ''
            });

    })

.run(function($http) {
    //console.log($http);
    //setAuthHeaders($http);
});