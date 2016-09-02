xdLocalStorage.init({
    iframeUrl: 'http://reservantro2.com/web/ls',
    initCallback: function () {
        console.log("iframe init.");
        xdLocalStorage.getItem("_sharedSession", function (data) {
            if (data.value === null) {
                _logout();
            }
        });
    }
});
