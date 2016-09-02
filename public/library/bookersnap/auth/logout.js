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
            console.log("Cerrando los servicios");
        },
        success: function (json) {
            if (json.success) {
                if (json.redirect) {
                    xdLocalStorage.getItem("_sharedSession", function (data) {
                        if (data.value !== null) {
                            removeSharedToken(data.value, function () {
                                xdLocalStorage.removeItem("_sharedSession");
                                location.href = json.url;
                            });
                        } else {
                            location.href = json.url;
                        }
                    });
                }
            }
        },
        error: function () {
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