<html ng-app="app">
<head>
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


</body>

</html>

