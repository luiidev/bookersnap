/*----------
Aqui ponemos algunas funciones globales que usaremos dentro de la aplicacion
------*/

var obtenerIdMicrositio = function(){
	var url = location.href;
	var pos = url.indexOf("ms");
	var id = url.substr(pos + 3);
	var last_pos = id.indexOf("/");
	id = id.substr(0,last_pos);
	return id;
};

var messageAlert = function(title,text,type){
	swal({   
		title: title,   
		text: text,   
		type: type,   
    	timer: 2000,   
    	showConfirmButton: false
	});
};