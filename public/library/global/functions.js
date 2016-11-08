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
        hour12: defineTimeSytem(horaInicial),
        index: getIndexHour(horaInicial, 0)
    });
    while (newHoursIni != horaFinal) {
        newHoursIni = addHourByMin(newHoursIni);
        arrayHoras.push({
            hour24: newHoursIni,
            hour12: defineTimeSytem(newHoursIni),
            index: getIndexHour(newHoursIni, 0)
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

var convertTextToDate = function(language, options, date) {
    date = (date) ? null : date;
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

var messageAlert = function(title, text, type, time, confirmButton) {
    time = (time) ? null : 2000;
    confirmButton = (confirmButton === undefined || confirmButton === null) ? false : confirmButton;
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

message.show = function(title, text, type, options, action) {
    var config = {
        title: title,
        text: text,
        type: type,
    };

    action = (typeof action == "function") ? action : function() {};

    if (options !== undefined && options !== null) {
        if (typeof options == "object") {
            config = Object.assign(config, options);
        }
    }
    swal(config, function() {
        action();
    });
};

message.confirmButton = function(title, text, type, options, action) {
    return this.show(title, text, type, options, action);
};

message.confirm = function(title, text, type, action) {
    var options = {
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "SI",
        cancelButtonText: "CANCELAR",
        closeOnConfirm: false
    };
    if (typeof type == "function") {
        return this.show(title, text, "warning", options, type);
    }
    return this.show(title, text, type, options, action);
};

message.success = function(title, text, time) {
    return this.short(title, text, time, "success");
};

message.error = function(title, text, time) {
    return this.short(title, text, time, "error");
};

message.alert = function(title, text, time) {
    return this.short(title, text, time, "warning");
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

message.apiError = function(response, title, icon, options) {
    var body;
    title = title || "Error";
    icon = icon || "error";

    if (Object.prototype.toString.call(response) == "[object Object]") {
        if (Object.prototype.toString.call(response.data) == "[object Object]") {
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
    } else {
        body = "Ocurrió un error en el servidor";
    }

    return this.show(title, body, icon, options);
};

var messageErrorApi = function(response, title, type, time, confirmButton, status) {
    status = (status) ? 1 : status;
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
var alertMultiple = function(title, text, type, icon, from, align, timer, x, y) {
    from = (from) ? from : 'top';
    align = (align) ? align : 'center';
    timer = (timer) ? timer : 5000;
    x = (x) ? x : 20;
    y = (y) ? y : 85;

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
            from: from,
            align: align
        },
        offset: {
            x: x,
            y: y,
        },
        spacing: 10,
        z_index: 1031,
        delay: 2500,
        timer: timer,
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

/*----------Scroll bar plugin options -----
Devuelve un objeto configuracion
axis = orientacion del scroll
theme = estilo del scroll
height = alto del scroll
*/

var optionsScrollBarPLugin = function(axis, theme, height) {
    var options = {
        autoHideScrollbar: false,
        theme: theme,
        advanced: {
            updateOnContentResize: true
        },
        setHeight: height,
        scrollInertia: 0,
        axis: axis
    };

    return options;
};
var getFechaActual = function() {
    return moment().format("YYYY-MM-DD");
};

/*
Cuando usamos un listado de horas de un rango de 15 en 15 minutos y trabajamos con indexes del 0 a 119,el servidor nos devuelve la hora en
este formato : 08:00:00 y con esta funcion obtenemos su indice = 32

esta funcion usamos para cuando queremos marcar algun elemento por defecto en un select(hora con rango)
*/
var getIndexHour = function(value, nextDay) {

    nextDay = (nextDay === null || nextDay === undefined) ? 0 : nextDay;

    var hourIndex = value.indexOf(":");
    var min = value.substr(hourIndex);

    hourIndex = parseInt(value.substr(0, hourIndex));

    min = min.replace(":", "");
    min = min.replace("AM", "");
    min = min.replace("PM", "");
    min = parseInt(min);

    var index = hourIndex * 4;

    if (min == 15) {
        index += 1;
    } else if (min == 30) {
        index += 2;
    } else if (min == 45) {
        index += 3;
    }

    index = index + 96 * nextDay;
    return index;
};
var getHourNextDay = function(hoursIni, hoursEnd) {
    var nextDay = 0;
    var xHourIni = hoursIni.split(":");
    var xHourEnd = hoursEnd.split(":");

    if (xHourEnd[0] < xHourIni[0]) {
        nextDay = 1;
    }

    return nextDay;
};

var plusHour = function(hoursIni, hoursEnd) {
    var hourTotal = 0;
    var addHour = false;

    //var hourIndex = hoursIni.indexOf(":");
    //var hour = parseInt(hoursIni.substr(0, hourIndex));
    //var min = hoursIni.substr(hourIndex + 1, 2);

    var vHourIni = hoursIni.split(":");
    var vHourEnd = hoursEnd.split(":");

    var sMin = (parseInt(vHourIni[1]) + parseInt(vHourEnd[1]));
    if (sMin >= 60) {
        addHour = true;
        sMin -= 60;
    }
    var sHour = (parseInt(vHourIni[0]) + parseInt(vHourEnd[0]) + (addHour ? 1 : 0));

    hourTotal = sHour + ':' + sMin + ':00';

    return hourTotal;
};

//Funcion que devuelve los minutos de una hora - fecha
var calculateMinutesTime = function(date) {
    var time = moment(date);
    var minutes = (time.hour() * 60) + time.minute();

    return minutes;
};