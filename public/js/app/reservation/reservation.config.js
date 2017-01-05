var idMicrositio = obtenerIdMicrositio();
angular.module('reservation.app', ['promotion.app', 'flyer.app'])
    .constant("IdMicroSitio", idMicrositio)
    //.constant("ApiUrlReservation", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas');
    .constant("AppBookersnap", "http://web.bookersnap.net/v1/en/admin/ms/" + idMicrositio + "/reservation") //url de frontend
    .constant("UrlRepository", "http://web.bookersnap.net/files") //cualquier tipo de archivos
    .constant("UrlGeneral", "http://api-promotion.vh/v1/es") //servicios generales para la api
    .constant("ApiUrlMesas", "http://apimesas.studework.com/v1/es/microsites/" + idMicrositio) //servicio del api de mesas
    .constant("ApiUrlReservation", "http://api-promotion.vh/v1/es/microsites/" + idMicrositio) //servicios de api reservaciones y promociones
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
    
        $stateProvider
            .state('reservation', {
                url: '/reservation',
                templateUrl: ''
            });

    });