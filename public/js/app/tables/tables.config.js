
var idMicrositio = obtenerIdMicrositio();

angular.module('tables.app',
[
'turn.app',
'zone.app'
])
.constant("IdMicroSitio",idMicrositio)
.constant("ApiUrl", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas')
.constant("ApiUrlRoot", 'http://web.aplication.bookersnap/v1/en');