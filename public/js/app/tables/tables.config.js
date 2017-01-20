(function() {
    'use strict';
    // var idMicrositio = obtenerIdMicrositio();
    angular.module('tables.app', [
            //'auth.app',//proximanente
            'turn.app',
            'zone.app',
            'book.app',
            'block.app',
            'guest.app',
            'calendar.app',
            'floor.app',
            'reservation.app',
            'customtag.app',
            'configuration.app',
            'availability.app',
            'grid.app',
            'widget.app',
            'notification.app'
        ])
        .constant("IdMicroSitio", _MICROSITE_ID)
        .constant("DomainBookersnapAdmin", "http://localhost")
        .constant("UrlServerNotify", "http://localhost:1337")
        .constant("ApiUrlMesas", 'http://api-mesas.vh/v1/es/microsites/' + _MICROSITE_ID)
        .constant("ApiUrlRoot", 'http://api-mesas.vh/v1/es')
        /*        .constant("DomainBookersnapAdmin", "http://admin.bookersnap.com")
                .constant("UrlServerNotify", "http://admin.bookersnap.com:1337")
                .constant("ApiUrlMesas", 'http://apimesas.studework.info/v1/es/microsites/' + idMicrositio)
                .constant("ApiUrlRoot", 'http://apimesas.studework.info/v1/es')*/
        .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
            $stateProvider
                .state('mesas', {
                    url: '/mesas',
                    templateUrl: ''
                });
        })
        .run(function($http, ServerNotification, IdMicroSitio) {
            $http.defaults.headers.common.Authorization = "Bearer " + _TOKEN_SESSION;
            ServerNotification.createConnection();
            ServerNotification.createRoom("microsites" + IdMicroSitio);
        });
})();