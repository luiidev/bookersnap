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


<script src="/library/bookersnap/auth/logout.js"></script>
<script src="/library/cross-domain-local-storage-2.0.3/dist/scripts/xdLocalStorage.min.js"></script>
{{--auth--}}
@if(session('bsAuthToken'))
    <script src="/library/bookersnap/auth/ss_set.js"></script>
    <script>fn_ss_set(xdLocalStorage, "{{session('bsAuthToken')}}");</script>
@elseif(Auth::check())
    <script src="/library/bookersnap/auth/ss_in.js"></script>
@else
    <script src="/library/bookersnap/auth/ss_out.js"></script>
@endif


</body>


</html>

