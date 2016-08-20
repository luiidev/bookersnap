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

var getDaysWeek = function(){
    var days = [
        {id : 0, label : 'Domingo'},
        {id : 1, label : 'Lunes'},
        {id : 2, label : 'Martes'},
        {id : 3, label : 'Miercoles'},
        {id : 4, label : 'Jueves'},
        {id : 5, label : 'Viernes'},
        {id : 6, label : 'Sabado'},
    ];

    return days;
};

var getGender = function(){
    var gender = [
        {id : 'M', label : 'Masculino'},
        {id : 'F', label : 'Femenino'},
      
    ];

    return gender;
};

/*-----
Las fechas de datepicker u otro elemento muestra un formato extenso, con esta funcion la convertiremos a
YYYY-MM-DD
-----*/
var convertFechaYYMMDD = function(fecha,idioma,options){
    var newFecha = new Date(fecha).toLocaleDateString(idioma, options);
    var arrayFecha = newFecha.split("/");

    newFecha = arrayFecha[2]+"-"+arrayFecha[1] +"-"+arrayFecha[0];

    return newFecha;
};

/*----------
// Convierte un objeto json en url con sus propiedades
{
  "hours_ini": "05:00:00",
  "hours_end": "08:00:00",
  "type_turn": 1
}
to
"hours_ini=05%3A00%3A00&hours_end=08%3A00%3A00&type_turn=1"
--------*/
var getAsUriParameters = function(data) {
    var url = '';
    for (var prop in data) {
        url += encodeURIComponent(prop) + '=' + 
        encodeURIComponent(data[prop]) + '&';
    }
    return url.substring(0, url.length - 1)
}

var getDayText = function(index,option){
    var days = getDaysWeek();
    var dayText = days[index].label;

    if(option == "short"){
        dayText = dayText.substr(0, 1);
    }

    return dayText;      
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

var messageErrorApi = function(data,title,type){
    var errorJson = JSON.stringify(data);
 
    if(errorJson.indexOf("error") >0){
        messageAlert(title,data.error.user_msg,type);
    }else{
        messageAlert(title,data,type);
    }
};

var historyBack = function(){
    window.history.back();
};

//Limpiar cadena de texto
var cleanString = function(cadena){
    var specialChars = "!@#$^&%*()'+=-[]\/{}|:<>?,";
    for (var i = 0; i < specialChars.length; i++) {
      cadena= cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
    }
    cadena = cadena.toLowerCase();
    cadena.replace(/\s/g,"");
    //cadena.replace(/^\s+|\s+$/g,"");
    //cadena.replace(/\s+$/g,"");
    //cadena.replace(/^\s*|\s*$/g, '_');
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
