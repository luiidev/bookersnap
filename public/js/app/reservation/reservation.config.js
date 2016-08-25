var idMicrositio = obtenerIdMicrositio();
angular.module('reservation.app',['promotion.app','flyer.app'])
.constant("IdMicroSitio",idMicrositio)
//.constant("ApiUrlReservation", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas');
.constant("AppBookersnap", "http://web.aplication.bookersnap/v1/en/admin/ms/"+idMicrositio+"/reservation")
.constant("UrlGeneral", "http://api-promotion.vh/v1/es")
.constant("ApiUrlMesas", "http://api-mesas.vh/v1/es/microsites/"+idMicrositio)
.constant("ApiUrlReservation", "http://api-promotion.vh/v1/es/microsites/"+idMicrositio)

