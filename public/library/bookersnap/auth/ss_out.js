xdLocalStorage.init({
    iframeUrl: 'http://reservantro2.com/web/ls',
    initCallback: function () {
        xdLocalStorage.getItem("_sharedSession", function (data) {
            if (data.value !== null) {
                $.ajax({
                    url: "/auth/loginBySharedToken",
                    type: "post",
                    data: {_authToken: data.value},
                    beforeSend: function () {
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