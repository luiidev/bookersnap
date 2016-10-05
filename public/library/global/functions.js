/*----------
Aqui ponemos algunas funciones globales que usaremos dentro de la aplicacion
------*/
/*----------
Obtiene el id del micrositio de nuestra Url
http://web.aplication.bookersnap/admin/ms/1/mesas#/book
ms/1/ 
id = 1
-----------*/
var obtenerIdMicrositio = function() {
    var url = location.href;
    var pos = url.indexOf("ms");
    var id = url.substr(pos + 3);
    var last_pos = id.indexOf("/");
    id = id.substr(0, last_pos);
    return id;
};

var getDaysWeek = function() {
    var days = [{
        id: 1,
        label: 'Domingo'
    }, {
        id: 2,
        label: 'Lunes'
    }, {
        id: 3,
        label: 'Martes'
    }, {
        id: 4,
        label: 'Miercoles'
    }, {
        id: 5,
        label: 'Jueves'
    }, {
        id: 6,
        label: 'Viernes'
    }, {
        id: 7,
        label: 'Sabado'
    }, ];

    return days;
};
var uniqueArray = function(origArr) {
    var newArr = [],
        origLen = origArr.length,
        found, x, y;

    for (x = 0; x < origLen; x++) {
        found = undefined;
        for (y = 0; y < newArr.length; y++) {
            if (origArr[x] === newArr[y]) {
                found = true;
                break;
            }
        }
        if (!found) {
            newArr.push(origArr[x]);
        }
    }
    return newArr;
};

var getGender = function() {
    var gender = [{
            id: 'M',
            label: 'Masculino'
        }, {
            id: 'F',
            label: 'Femenino'
        },

    ];

    return gender;
};

/*
Las horas (solo hora) si estan asi : 7  y necesitamos = 07 esta funcion lo convierte
*/
var parseHour = function(hour) {

    hour = ("0" + hour).slice(-2); // devolverá “01” si h=1; “12” si h=12
    return hour;
};

/*
Si queremos quitar textos de una cadena

@element = contiene el texto
@textSearch = array de elementos que deseamos eliminar - reemplazar
@textReplace = "" si queremos borrar

retorna texto limpio
*/
var replaceText = function(element, textSearch, textReplace) {

    textSearch.forEach(function(value, index) {
        element = element.replace(value, textReplace);
    });

    return element;
};

/*
Tenemos esta hora = 7:15:00 y queremos agregarle minutos si sobrepasa los 60 le aumenta una hora
return @hour = hora final
*/
var addHourByMin = function(hour) {
    var hoursFinal = "";
    var hoursArray = hour.split(":");
    var hourMin = parseInt(replaceText(hoursArray[1], ["AM", "PM"], "").trim());

    hour = replaceText(hour, ["AM", "PM", ""], "");
    hour = hour.substring(0, 2);
    hour = hour.replace(":", "");

    if (hourMin < 45) {
        hourMin = hourMin + 15;
    } else {
        hour = parseInt(hour) + 1;
        hourMin = "00";
    }

    hour = parseHour(hour);
    hoursFinal = hour + ":" + hourMin + ":00";
    return hoursFinal;

};


var roundByUp = function(numero, factor) {

    while (numero % factor !== 0) {
        numero++;
    }

    if (numero % 60 === 0) {
        return "00";
    } else {
        return numero;
    }

};


var roundByDown = function(numero, factor) {

    while (numero % factor !== 0) {
        numero--;
    }

    if (numero % 60 === 0) {
        return "00";
    } else {
        return numero;
    }

};

/*
    Se recibe un rango de horas (12:00:00 - 16:00:00) y se devuelve un array con las horas seleccionadas en el mismo formato
    con un lapso de 15 minutos cada uno 
*/
var getRangoHours = function(horaInicial, horaFinal) {

    var arrayInicial = horaInicial.split(":");
    var arrayFinal = horaFinal.split(":");

    if (!arrayInicial[1] % 15) {
        console.log(arrayInicial[1] + " es multiplo de 15");
    }

    /** 
    Se aplica un redondeo hace arriba cuando se obtienen horas distorcionadas ejemplo: 05:13:00  esto se redondea ya
    que la bd soporta rangos de 15 en 15 
    **/
    horaFinal = (arrayFinal[1] % 15 === 0) ? horaFinal : (arrayFinal[0] + ":" + roundByUp(arrayFinal[1], 15) + ":" + arrayFinal[2]);
    horaInicial = (arrayInicial[1] % 15 === 0) ? horaInicial : (arrayInicial[0] + ":" + roundByDown(arrayInicial[1], 15) + ":" + arrayInicial[2]);

    var newHoursIni = horaInicial;
    var arrayHoras = [];
    arrayHoras.push({
        hour24: horaInicial,
        hour12: defineTimeSytem(horaInicial)
    });
    while (newHoursIni != horaFinal) {
        newHoursIni = addHourByMin(newHoursIni);
        arrayHoras.push({
            hour24: newHoursIni,
            hour12: defineTimeSytem(newHoursIni)
        });
    }
    return arrayHoras;
};

/*-----
Las fechas de datepicker u otro elemento muestra un formato extenso, con esta funcion la convertiremos a
YYYY-MM-DD
-----*/
var convertFechaYYMMDD = function(fecha, idioma, options) {
    var newFecha = new Date(fecha).toLocaleDateString(idioma, options);
    var arrayFecha = newFecha.split("/");

    newFecha = arrayFecha[2] + "-" + arrayFecha[1] + "-" + arrayFecha[0];

    return newFecha;
};

/*-------
Para las fechas que recibimos en este formato : YYYY-mm-dd y queremos procesarlas a otro formato Date lo convertiremos a un objeto
Date javascript
--------*/

var convertTextToDate = function(language, options, date = null) {
    if (date !== null) {
        return new Date(date).toLocaleDateString(language, options);
    } else {
        return new Date().toLocaleDateString(language, options);
    }
};

/*-------
Las horas se guardan en: 00:00:00 , y esta funcion te la muestra asi: 00:00:00 AM-PM
--------*/
var defineTimeSytem = function(time) {
    var splitTime = time.split(":");
    var systemTime = splitTime[0] < 12 ? "AM" : "PM";
    var newTime = splitTime[0] + ":" + splitTime[1] + " " + systemTime;

    return newTime;
};

var setearJsonError = function(jsonError) {
    var energy = jsonError.join("\n");
    return energy;
};

var convertDateTo24Hour = function(timeStr) {
    if (timeStr === undefined) {
        return null;
    } else {

        var meridian = timeStr.substr(timeStr.length - 2).toLowerCase();
        var hours = timeStr.substring(0, timeStr.indexOf(':'));
        var minutes = timeStr.substring(timeStr.indexOf(':') + 1, timeStr.indexOf(' '));
        if (meridian == 'pm') {
            hours = (hours == '12') ? '00' : parseInt(hours) + 12;
        } else if (hours.length < 2) {
            hours = '0' + hours;
        }
        return hours + ':' + minutes + ':' + "00";

    }
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
    return url.substring(0, url.length - 1);
};

var getDayText = function(index, option) {
    var days = getDaysWeek();
    var dayText = days[index].label;

    if (option == "short") {
        dayText = dayText.substr(0, 1);
    }

    return dayText;
};

var messageAlert = function(title, text, type, time = 2000, confirmButton = false) {
    swal({
        title: title,
        text: text,
        type: type,
        timer: time,
        showConfirmButton: confirmButton
            //imageUrl: imageUrl
    });
};

var message = {};

message.show = function(title, text, type, options) {
    var config = {
        title: title,
        text: text,
        type: type,
    };

    if (options !== undefined) {
        if (typeof options == "object") {
            config = Object.assign(config, options);
        }
    }
    swal(config);
};

message.success = function(title, text, time) {
    return this.short(title, text, time, "success");
};

message.error = function(title, text, time) {
    return this.short(title, text, time, "error");
};

message.short = function(title, text, time, icon) {
    if (typeof text == "number") {
        return this.show(title, "", icon, {
            timer: text
        });
    } else if (typeof time == "number") {
        return this.show(title, text, icon, {
            timer: time
        });
    }
    return this.show(title, text, icon);
};

message.alert = function(title, text, icon, time) {
    return this.show(title, text, icon, time);
};

message.apiError = function(response, title, icon, options) {
    var body;
    title = title || "Error";
    icon = icon || "error";

    if (response.data !== null) {
        if (response.data.error !== null) {
            body = response.data.error.user_msg;
        } else {
            if (response.status == 401 || response.status == 403) {
                body = "No tiene permisos para realizar esta acción";
            } else {
                body = "Ocurrió un error en el servidor";
            }
        }
    } else {
        body = "Ocurrió un error en el servidor";
    }

    return this.show(title, body, icon, options);
};

var messageErrorApi = function(response, title, type, time, confirmButton, status = 1) {
    var errorJson = JSON.stringify(response);

    if (status == "-1") {
        title = "Error de conexión a internet";
    }
    if (errorJson.indexOf("error") > 0) {
        messageAlert(title, response.error.user_msg, type, time, confirmButton);
    } else {
        messageAlert(title, response, type, time, confirmButton);
    }

};

var historyBack = function() {
    window.history.back();
};

//Limpiar cadena de texto
var cleanString = function(cadena) {
    var specialChars = "!@#$^&%*()'+=-[]\/{}|:<>?,";
    for (var i = 0; i < specialChars.length; i++) {
        cadena = cadena.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
    }
    cadena = cadena.toLowerCase();
    cadena = cadena.replace(/\s/g, "-");
    cadena = cadena.replace(/[áàäâå]/gi, "a");
    cadena = cadena.replace(/[éèëê]/gi, 'e');
    cadena = cadena.replace(/[íìïî]/gi, 'i');
    cadena = cadena.replace(/[óòöô]/gi, 'o');
    cadena = cadena.replace(/[úùüû]/gi, 'u');
    cadena = cadena.replace(/[ýÿ]/gi, 'y');
    cadena = cadena.replace(/ñ/gi, 'n');

    return cadena;
};

/*-----
Permite mostrar mensajes tipo alert, multiples.
------*/
var alertMultiple = function(title, text, type, icon) {
    $.growl({
        icon: icon,
        title: title + " ",
        message: text,
        url: ''
    }, {
        element: 'body',
        type: type,
        allow_dismiss: true,
        placement: {
            from: 'top',
            align: 'center'
        },
        offset: {
            x: 20,
            y: 85
        },
        spacing: 10,
        z_index: 1031,
        delay: 2500,
        timer: 1000,
        url_target: '_blank',
        mouse_over: false,
        /*animate: {
            enter: animIn,
            exit: animOut
        },*/
        icon_type: 'class',
        template: '<div data-growl="container" class="alert" role="alert">' +
            '<button type="button" class="close" data-growl="dismiss">' +
            '<span aria-hidden="true">&times;</span>' +
            '<span class="sr-only">Close</span>' +
            '</button>' +
            '<span data-growl="icon"></span>' +
            '<span data-growl="title"></span>' +
            '<span data-growl="message"></span>' +
            '<a href="#" data-growl="url"></a>' +
            '</div>'
    });
};

/*
Recibe los parametros de angular cuando devuelve un error de api, con esta funcion devolvemos en un objeto al controlador con la promesa
usarlo para todas las funciones que devuelven : error api
 */
var jsonErrorData = function(data, status, headers) {
    var response = {
        data: data,
        status: status,
        headers: headers
    };
    return response;
};

var convertFechaToDate = function(date) {
    var fecha = new Date(date + " 00:00:00");
    return fecha;
};