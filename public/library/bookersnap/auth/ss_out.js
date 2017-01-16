//Inicia el local storage de la url indicada
xdLocalStorage.init({
    iframeUrl: 'http://localhost/web/ls',
    initCallback: function () {        
        //se sejecuta al cargarse el iframe
        xdLocalStorage.getItem("_sharedSession", function (data) {
            if (data.value !== null) {
                //se pregunta si existe el item, si existe se hace una solicitud al servidor para iniciar sesion con el token
                $.ajax({
                    url: "/auth/loginBySharedToken",
                    type: "post",
                    data: {_authToken: data.value},
                    beforeSend: function () {
                        //aqui se puede implementar un overlay para mejorar la experiencia del usuario
                    },
                    success: function (data) {
                        if (data.success) {
                            location.reload();
                        }
                    },
                    error: function (data) {
                        console.log(data);
                    }
                });
            }
        });
    }
});