var idMicrositio = obtenerIdMicrositio();

angular.module('tables.app',
    [
        'turn.app',
        'zone.app',
        'book.app',
        'guest.app',
        'calendar.app'
    ])
    .constant("IdMicroSitio", idMicrositio)
    //.constant("ApiUrl", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas')
    .constant("ApiUrl", 'http://api-mesas.vh/v1/en/microsites/' + idMicrositio)
    .constant("ApiUrlRoot", 'http://web.aplication.bookersnap/v1/en')
    
            .run(function($http){
                //setAuthHeaders($http);
            });