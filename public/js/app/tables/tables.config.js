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
<<<<<<< HEAD
    // .constant("ApiUrlMesas", 'http://apimesas.studework.com/v1/es/microsites/' + idMicrositio)
    // .constant("ApiUrlRoot", 'http://apimesas.studework.com/v1/es')
    .constant("ApiUrlMesas", 'http://localhost:3004/v1/es/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://localhost:3004/v1/es')
=======
    .constant("ApiUrlMesas", 'http://apimesas.studework.com/v1/es/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://apimesas.studework.com/v1/es')
    //.constant("ApiUrlMesas", 'http://localhost:3004/v1/es/microsites/' + idMicrositio)
    //.constant("ApiUrlRoot", 'http://localhost:3004/v1/es')
>>>>>>> 33464addb23d79226a2f6deacc0854cff85b7a4a
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