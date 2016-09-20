var idMicrositio = "1";

angular.module('tables.app', [
        'turn.app',
        'zone.app',
        'book.app',
        /*'block.app',
        'guest.app',
        'calendar.app',
        'floor.app'*/
    ])
    .constant("IdMicroSitio", idMicrositio)
    //.constant("ApiUrlMesas", 'http://api-mesas.vh/v1/en/microsites/' + idMicrositio)
    .constant("ApiUrlMesas", 'http://192.168.0.104/v1/en/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://192.168.0.109/v1/en')
    //.constant("ApiUrlRoot", 'http://web.aplication.bookersnap/v1/en')
    .config(function($stateProvider, $urlRouterProvider) {

        /* $stateProvider.state('mesas', {
             url: '/mesas',
             templateUrl: 'template/menu.html',
             controller: '',
             abstract: true
         });

         //../../../app/www/

              $urlRouterProvider.otherwise('/mesas/config/turn');*/

    })
    .run(function($http) {
        //setAuthHeaders($http);
    });