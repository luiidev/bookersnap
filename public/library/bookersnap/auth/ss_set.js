function fn_ss_set(xdls, val) {
    xdls.init({
        iframeUrl: 'http://reservantro2.com/web/ls',
        initCallback: function () {
            xdls.setItem("_sharedSession", val);
        }
    });
}
