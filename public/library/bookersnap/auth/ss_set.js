function fn_ss_set(xdls, val) {
    xdls.init({
        iframeUrl: 'http://localhost/web/ls',
        initCallback: function () {
            xdls.setItem("_sharedSession", val);
        }
    });
}
