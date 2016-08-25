var idMicrositio = obtenerIdMicrositio();
angular.module('reservation.app',['promotion.app','flyer.app'])
.constant("IdMicroSitio",idMicrositio)
//.constant("ApiUrlReservation", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas');
<<<<<<< HEAD
.constant("ApiUrlReservation", "http://localhost:8000/v1/en/admin/ms/"+idMicrositio+"/reservation")
.constant("ApiUrlGeneral", "http://api-promotion.vh/v1/es/")
.constant("ApiUrlGeneralPromociones", "http://api-promotion.vh/v1/es/microsites/"+idMicrositio);
=======
.constant("AppBookersnap", "http://web.aplication.bookersnap/v1/en/admin/ms/"+idMicrositio+"/reservation")
.constant("UrlGeneral", "http://api-promotion.vh/v1/es")
.constant("ApiUrlMesas", "http://api-mesas.vh/v1/es/microsites/"+idMicrositio)
.constant("ApiUrlReservation", "http://api-promotion.vh/v1/es/microsites/"+idMicrositio)
//.constant("ApiUrlGeneralPromociones", "http://api-promotion.vh/v1/es/microsites/"+idMicrositio);

>>>>>>> 24052672d325140b19d9d9b83c244ec3789012bb
