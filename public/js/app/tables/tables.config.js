var obtenerIdMicrositio = function(){
	var url = location.href;
	var pos = url.indexOf("ms");
	var id = url.substr(pos + 3);
	var last_pos = id.indexOf("/");
	id = id.substr(0,last_pos);
	return id;
}
var idMicrositio = obtenerIdMicrositio();
angular.module('tables.app',
[
'turn.app',
'zone.app'
])
.constant("ApiUrl", 'http://web.aplication.bookersnap/v1/en/admin/ms/'+idMicrositio+'/mesas');