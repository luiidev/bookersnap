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
    //.constant("ApiUrl", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas')
    // .constant("ApiUrlMesas", 'http://api-mesas.vh/v1/en/microsites/' + idMicrositio)
    .constant("ApiUrlMesas", "http://apimesas.studework.com/v1/es/microsites/" + idMicrositio)
    .constant("ApiUrlRoot", 'http://web.aplication.bookersnap/v1/en')

.run(function($http) {
    //setAuthHeaders($http);
});