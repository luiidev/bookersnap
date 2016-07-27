var idMicrositio = obtenerIdMicrositio();

angular.module('reservation.app',
[
'promotion.app'
])
//.constant("ApiUrlReservation", "http://web.aplication.bookersnap/v1/en/admin/ms/"+idMicrositio+"/reservacion");
.constant("IdMicroSitio",idMicrositio)
.constant("ApiUrlReservation", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas');