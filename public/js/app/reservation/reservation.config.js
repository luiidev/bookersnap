var idMicrositio = obtenerIdMicrositio();

angular.module('reservation.app',['promotion.app','flyer.app'])
//.constant("ApiUrlReservation", "http://web.aplication.bookersnap/v1/en/admin/ms/"+idMicrositio+"/reservacion");
.constant("IdMicroSitio",idMicrositio)
//.constant("ApiUrlReservation", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas');
.constant("ApiUrlReservation", "http://web.aplication.bookersnap/v1/en/admin/ms/"+idMicrositio+"/reservation")
.constant("ApiUrlGeneral", "http://192.168.0.107/api.promociones/public/v1/es");