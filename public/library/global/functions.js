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

//Limpiar cadena de texto
var cleanString = function(cadena){
    var specialChars = "!@#$^&%*()'+=-[]\/{}|:<>?,";
    for (var i = 0; i < specialChars.length; i++) {
      cadena= cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
    }
    cadena = cadena.toLowerCase();
    //cadena.replace(/\s/g,"_");
    //cadena.replace(/^\s+|\s+$/g,"_");
    //cadena.replace(/\s+$/g,"");
    cadena.replace(/^\s*|\s*$/g, '');
    //cadena.replace(' ','');

    cadena = cadena.replace(/[áàäâå]/gi,"a");
    cadena = cadena.replace(/[éèëê]/gi, 'e');
    cadena = cadena.replace(/[íìïî]/gi, 'i');
    cadena = cadena.replace(/[óòöô]/gi, 'o');
    cadena = cadena.replace(/[úùüû]/gi, 'u');
    cadena = cadena.replace(/[ýÿ]/gi, 'y');
    cadena = cadena.replace(/ñ/gi, 'n');
    return cadena;
};
