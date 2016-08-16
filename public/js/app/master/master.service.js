/**
 * Created by BS on 12/08/2016.
 */

angular.module('master.app')
    .service('Ajax', function ($http) {
        return {
            Req: function (method, url, data, listener) {
                if (listener.BeforeSend != null && listener.BeforeSend != undefined) {
                    listener.BeforeSend();
                }
                switch (method) {
                    case "get":
                        $http.get(url, data).then(OnSuccess, OnError);
                        break;
                    case "post":
                        $http.post(url, data).then(OnSuccess, OnError);
                        break;
                    case "put":
                        $http.put(url, data).then(OnSuccess, OnError);
                        break;
                    case "delete":
                        $http.delete(url, data).then(OnSuccess, OnError);
                        break;
                    case "patch":
                        $http.patch(url, data).then(OnSuccess, OnError);
                        break;
                    case "$get":
                        jqueryAjax('get', url, data);
                        break;
                    case "$post":
                        jqueryAjax('post', url, data);
                        break;
                    case "$put":
                        jqueryAjax('put', url, data);
                        break;
                    case "$delete":
                        jqueryAjax('delete', url, data);
                        break;
                    case "$patch":
                        jqueryAjax('patch', url, data);
                        break;
                }

                function OnSuccess(response) {
                    if (listener.OnSuccess != null && listener.OnSuccess != undefined) {
                        listener.OnSuccess(response);
                    }
                }

                function OnError(response) {
                    if (listener.OnError != null && listener.OnError != undefined) {
                        listener.OnError(response);
                    }
                }

                function jqueryAjax(method, url, data) {
                    $.ajax({
                        url: url,
                        method: method,
                        type: 'json',
                        data: (data == null ? null : JSON.stringify(data)),
                        contentType: 'application/json'
                    }).done(function (data, textStatus, jqXHR) {
                        Response = {data: data, status: jqXHR.status};
                        OnSuccess(Response);
                    }).fail(function (jqXHR, textStatus, errorThrown) {
                        var data = {};
                        if (!angular.isUndefined(jqXHR.responseJSON)) {
                            data = jqXHR.responseJSON;
                        }
                        Response = {data: data, status: jqXHR.status};
                        OnError(Response);
                    });
                }
            }
        }
    });