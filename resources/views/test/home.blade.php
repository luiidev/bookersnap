<html ng-app="app">
<head>
    <meta name="csrf-token" content="{{ csrf_token()}}">
    <script src="/library/bower_components/jquery/dist/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js"></script>
    <script>
        angular.module('app', []).
        //--------------------------------------------------
        // SERVICES
        //--------------------------------------------------

        //--------------------------------------------------
        // CONTOLLERS
        //--------------------------------------------------
        controller('test-controller', function ($http) {
            var vm = this;
            vm.getData = function () {
                $http.post('/test/ajax/get-data', '', {}).then(function (Response) {
                    var data = Response.data;
                    console.log(data.data);
                }, function (Response) {
                    if (!angular.isUndefined(Response.data) && !angular.isUndefined(Response.data.error)) {
                        var data = Response.data;
                        if (data.status == 406) {
                            alert(data.msg + data.data.suggestions);
                        } else {
                            alert(data.msg || data.error.user_msg);
                        }
                    }
                });
            };

        });
    </script>
</head>
<body>
<header>
    @include('test.header')
</header>

<div ng-controller="test-controller as vm">

    <button ng-click="vm.getData()">Test</button>
</div>


{{--Agregamos los scripts que permiten el inicio de sesion en todos los dominios--}}
 @include('_shared.scripts_auth') 

</body>


</html>

