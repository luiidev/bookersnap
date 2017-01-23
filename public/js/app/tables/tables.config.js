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
        .constant("DomainBookersnapAdmin", env("_WEBAPP_DOMAIN"))
        .constant("UrlServerNotify", env("_SOCKET_DOMAIN") + ":1337")
        .constant("ApiUrlMesas", env('_APIMESAS_DOMAIN') + '/v1/es/microsites/' + _MICROSITE_ID)
        .constant("ApiUrlRoot", env('_APIMESAS_DOMAIN') + '/v1/es')
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
            ServerNotification.createRoom("microsites" + _MICROSITE_ID);
        });
})();