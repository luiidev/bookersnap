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
                <label>Email: <input type="text" name="email" value="{{old('email')}}"/></label>
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
    <script src="http://code.jquery.com/jquery-2.2.4.js" crossorigin="anonymous"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.5/angular.min.js"></script>
    <script src="https://angular-file-upload.appspot.com/js/ng-file-upload-shim.js"></script>
    <script src="https://angular-file-upload.appspot.com/js/ng-file-upload.js"></script>
    <script>
        angular.module('app', ['ngFileUpload']).
        //--------------------------------------------------
        // SERVICES
        //--------------------------------------------------

        //--------------------------------------------------
        // CONTOLLERS
        //--------------------------------------------------
        controller('test-controller', function ($http, Upload, $timeout) {
            var vm = this;
            vm.categoria = {};
            vm.getData = function () {
                $http.post('/test/ajax/get-data', {}, {}).then(function (Response) {
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

            vm.ajaxToApi = function () {

                var data = {
                    sitename: 'don-titos',
                    free: true
                };
//                $http.post('http://localhost:3000/v1/es/microsite/sitename', data).then(function (Response) {
//
//                }, function (Response) {
//
//                });
            };

            vm.guardarCategoria = function () {

                $http.post('/test/ajax/guardar-categoria', vm.categoria).then(function (Response) {

                }, function (Response) {

                });
            };

            vm.subirImagen = function (file, errFiles) {
                vm.categoria.f = file;
                vm.categoria.errFile = errFiles && errFiles[0];
                if (file) {
                    file.upload = Upload.upload({
                        url: '/test/ajax/subir-imagen',
                        data: {imagen: file}
                    });

                    file.upload.then(function (response) {
                        $timeout(function () {
                            vm.categoria.basename = response.data.basename;
                            vm.categoria.fullname = response.data.fullname;
                        });
                    }, function (response) {
                        if (response.status > 0)
                            vm.categoria.errorMsg = response.status + ': ' + response.data;
                    }, function (evt) {
                        file.progress = Math.min(100, parseInt(100.0 *
                                evt.loaded / evt.total));
                    });
                }
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


    <button ng-click="vm.ajaxToApi()">Ajax al api</button>


    <div>

        <h3>Subida de imagenes</h3>

        <form ng-submit="vm.guardarCategoria()">

            <div>
                nombre: <input type="text" ng-model="vm.categoria.name">
            </div>

            <div>
                imagen
                <br>

                <div>
                    <button ngf-select="vm.subirImagen($file, $invalidFiles)" type="button">selecciona imagen</button>
                </div>

                <div>
                    url subida: @{{vm.categoria.url}}
                    <br>
                    progress: @{{vm.categoria.f}}
                </div>

            </div>

            <button>Guardar</button>
        </form>

    </div>
</div>


</body>

</html>

