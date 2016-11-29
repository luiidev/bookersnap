<!DOCTYPE html>
<html data-ng-app="materialAdmin" data-ng-controller="materialadminCtrl as mactrl">
<head>
     <!-- Vendor CSS -->
    <link href="/css/theme/dist/vendor.min.css" rel="stylesheet">
    <!-- CSS -->
    <link href="/css/theme/dist/theme.min.css" rel="stylesheet" id="app-level">

</head>
<body class="login-content">

    @if(!Auth::check())

        <div class="lc-block toggled" id="l-login">

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

            <form method='post' action="">
                LOGIN
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>
                <div class="input-group m-b-20">
                    <span class="input-group-addon"><i class="zmdi zmdi-account"></i></span>
                    <div class="fg-line">
                        <input type="text" class="form-control" placeholder="Usuario" name="email" value="{{old('email')}}">
                    </div>
                </div>

                <div class="input-group m-b-20">
                    <span class="input-group-addon"><i class="zmdi zmdi-male"></i></span>
                    <div class="fg-line">
                        <input type="password" class="form-control" placeholder="Contraseña" name="password">
                    </div>
                </div>

                <div class="clearfix"></div>

                <div>
                    <button class="btn btn-primary btn-icon waves-circle"><i class="zmdi zmdi-facebook zmdi-hc-fw"></i></button>
                    <button class="btn btn-default btn-icon waves-circle"><i class="zmdi zmdi-google-plus zmdi-hc-fw"></i></button>
                    <button class="btn btn-info btn-icon waves-circle"><i class="zmdi zmdi-twitter zmdi-hc-fw"></i></button>
                </div>

                <button class="btn btn-login btn-danger btn-float"><i class="zmdi zmdi-arrow-forward"></i></button>

            </form>

        </div>
    <!--
        <div>
            <h3>Login with bookersnap</h3>

            <form method='post' action="">
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
        </div>-->
    @else
        Bienvenido asdasdsad!
    @endif

<script src="/library/bower_components/jquery/dist/jquery.min.js"></script>

{{--Agregamos los scripts que permiten el inicio de sesion en todos los dominios--}}
@include('_shared.scripts_auth')

<!-- Vendor Bookersnap
<script src="/js/theme/dist/library.bower.min.js"></script>
<script src="/js/theme/dist/app.level.min.js"></script>
<script src="/js/theme/dist/template.modules.min.js"></script>-->
</body>
</html>
