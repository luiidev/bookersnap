//Inicia el local storage de la url indicada
xdLocalStorage.init({
    iframeUrl: 'http://reservantro2.com/web/ls',
    initCallback: function () {
        //se sejecuta al cargarse el iframe
        console.log("iframe init.");
        xdLocalStorage.getItem("_sharedSession", function (data) {
            if (data.value === null) {
                //se pregunta si existe el item, si no existe se cierra la sesion
                _logout();
            }
        });
    }
});
