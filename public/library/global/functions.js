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
        id: 0,
        label: 'Domingo'
    }, {
        id: 1,
        label: 'Lunes'
    }, {
        id: 2,
        label: 'Martes'
    }, {
        id: 3,
        label: 'Miercoles'
    }, {
        id: 4,
        label: 'Jueves'
    }, {
        id: 5,
        label: 'Viernes'
    }, {
        id: 6,
        label: 'Sabado'
    }, ];

    return days;
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

/*
    Se recibe un rango de horas (12:00:00 - 16:00:00) y se devuelve un array con las horas seleccionadas en el mismo formato
    con un lapso de 15 minutos cada uno 
*/
var getRangoHours = function(horaInicial, horaFinal) {

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

var convertTextToDate = function(language, options, date) {
    if (date !== null) {
        return new Date(date).toLocaleDateString(language, options);
    } else {
        return new Date().toLocaleDateString(language, options);
    }
};

var convertFechaToDate = function(date) {
    var fecha = new Date(date + " 00:00:00");
    return fecha;
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

var setearJsonError = function (jsonError){
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

//time = 2000
var messageAlert = function(title, text, type, time) {
    swal({
        title: title,
        text: text,
        type: type,
        timer: time,
        showConfirmButton: false
    });
};

var messageErrorApi = function(data, title, type, time) {
    var errorJson = JSON.stringify(data);

    if (errorJson.indexOf("error") > 0) {
        messageAlert(title, data.error.user_msg, type, time);
    } else {
        messageAlert(title, data, type, time);
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

/*---- Loading de ionic para moviles,tablets, lo usaremos para cuando grabemos informacion o consultemos, asi el usuario sabra que la aplicacion
esta realizando alguna acción
-----*/
var loadingShow = function(ionicLoading, message) {
    ionicLoading.show({
        template: message
    }).then(function() {
        console.log("The loading indicator is now displayed");
    });
};
var loadingHide = function(ionicLoading) {
    ionicLoading.hide();
};