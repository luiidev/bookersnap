var idMicrositio = obtenerIdMicrositio();

angular.module('reservation.app',['promotion.app','flyer.app'])
//.constant("ApiUrlReservation", "http://web.aplication.bookersnap/v1/en/admin/ms/"+idMicrositio+"/reservacion");
.constant("IdMicroSitio",idMicrositio)
//.constant("ApiUrlReservation", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas');
.constant("ApiUrlReservation", "http://web.aplication.bookersnap/v1/en/admin/ms/"+idMicrositio+"/reservation")
.constant("ApiUrlGeneral", "http://api-promotion.vh/v1/es/")
.constant("ApiUrlGeneralPromociones", "http://api-promotion.vh/v1/es/microsites/"+idMicrositio);
