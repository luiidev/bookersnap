<div>

    @if(session('error-message')!==null)
        <div>
            <h3>Errores:</h3>
            {{session('error-message')}}
        </div>
    @endif

        @if(session('message')!==null)
            <div>
                <h3>Mensaje:</h3>
                {{session('message')}}
            </div>
        @endif

    @if(!Auth::check())
        <div>
            <h3>Login with bookersnap</h3>

            <form method='post'>
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <label>Email: <input type="text" name="email" value="{{old('email')}}" /></label>
                <label>Password: <input type="password" name="password"/></label>
                <button>Login</button>
            </form>
        </div>

        <div>
            <h3>Login with facebook</h3>

            <form action="auth/social" method='post'>
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <input type="hidden" name="_sn" value="1"/>
                <button>Login</button>
            </form>
        </div>

        <div>
            <h3>Login with twitter</h3>

            <form action="auth/social" method='post'>
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <input type="hidden" name="_sn" value="2"/>
                <button>Login</button>
            </form>
        </div>

        <div>
            <h3>Login with google</h3>

            <form action="auth/social" method='post'>
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <input type="hidden" name="_sn" value="3"/>
                <button>Login</button>
            </form>
        </div>
    @else
        Bienvenido asdasdsad!
    @endif


</div>


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
    {{--@include('test.header')--}}
</header>

<div ng-controller="test-controller as vm">

    <button ng-click="vm.getData()">Test</button>
</div>


</body>

</html>

