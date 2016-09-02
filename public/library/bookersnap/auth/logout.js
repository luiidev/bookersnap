$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
function _logout() {
    $.ajax({
        url: "/test/auth/logout",
        method: "post",
        type: "json",
        beforeSend: function () {
            //para mejorar la experiencia de usuario, aqui se puede implementar
            // un overlay que indique al usuario que se esta cerrando su sesion.
            console.log("Cerrando los servicios");
        },
        success: function (json) {
            if (json.success) {//Si la sesion se cerro
                if (json.redirect) {//Y el servidor indica que hay que redireccionar
                    xdLocalStorage.getItem("_sharedSession", function (data) {
                        if (data.value !== null) {
                            // Si existe el token, lo eliminamos primero en el servidor
                            // y luego en el localstorage, luego redireccionamos.
                            removeSharedToken(data.value, function () {
                                xdLocalStorage.removeItem("_sharedSession");
                                location.href = json.url;
                            });
                        } else {
                            //Sino simplemente redireccionamos.
                            location.href = json.url;
                        }
                    });
                }
            }
        },
        error: function () {
            //Si ocurre algun error al cerrar la sesion mostramos un dialogo
            alert("ocurrió un error al cerrar sesión");
        }
    });

    function removeSharedToken(data, callback) {
        $.ajax({
            url: "/auth/removeSharedToken",
            method: "post",
            type: "json",
            data: {_authToken: data},
            success: function (data) {
                if (data.success) {
                    callback();
                }
            }
        });
    }

//
//    $.ajax({
//        url: "/ajax/auth/domains",
//        method: "post",
//        type: "json",
//        beforeSend: function () {
//            console.log("Cerrando los servicios");
//        },
//        success: function (json) {
//            console.log(json.domains);
//            close_session(json.domains, json.domains.length, 0);
//        },
//        error: function () {
//            alert("ocurrió un error al cerrar sesión");
//        }
//    });
//
//    function close_session(array_url, length, i) {
//        if (i < length) {
//            var $options = {
//                url: array_url[i] + "/auth/logout",
//                data: null,
//                callbackParameter: "callback",
//                success: function (json, textStatus, xOptions) {
//                    if (json.status == 200) {
//                        i++;
//                        close_session(array_url, length, i);
//                    }
//                },
//                error: function () {
//                    $.jsonp($options);
//                }
//            };
//            $.jsonp($options);
//        } else {
//            location.href = "/auth/logout";
//        }
//    }
}