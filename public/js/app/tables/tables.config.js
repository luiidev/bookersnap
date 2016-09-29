var idMicrositio = obtenerIdMicrositio();

angular.module('tables.app', [
        'turn.app',
        'zone.app',
        'book.app',
        'block.app',
        'guest.app',
        'calendar.app',
        'floor.app'
    ])
    .constant("IdMicroSitio", idMicrositio)
    .constant("ApiUrlMesas", 'http://apimesas.studework.com/v1/es/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://apimesas.studework.com/v1/es')

.run(function($http) {
    //setAuthHeaders($http);
});