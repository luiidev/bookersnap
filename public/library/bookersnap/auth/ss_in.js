//Inicia el local storage de la url indicada
xdLocalStorage.init({
    iframeUrl: 'http://localhost/web/ls',
    initCallback: function () {
        //se sejecuta al cargarse el iframe
        console.log("iframe init.");
        xdLocalStorage.getItem("_sharedSession", function (data) {
            console.log(data);
            if (data.value === null && false) {
                //se pregunta si existe el item, si no existe se cierra la sesion
                _logout();
            }
        });
    }
});
