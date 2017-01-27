<!DOCTYPE html>
<html data-ng-app="materialAdmin" data-ng-controller="materialadminCtrl as mactrl">
<head>
     <!-- Vendor CSS -->
    <link href="/css/theme/dist/vendor.min.css" rel="stylesheet">
    <!-- CSS -->
    <link href="/css/theme/dist/theme.min.css" rel="stylesheet" id="app-level">

</head>
<body class="login-content">
        <div class="lc-block toggled" id="l-login">
            <div class="card-header">
                <h2>Email<small>Para completar su registro ingrese su correo electronico.</small></h2>
            </div>
            <form method='GET' action="/auth/auth/social-callback">
                
                <input type="hidden" name="_token" value="{{ csrf_token()}}"/>

                <div class="input-group m-b-20">
                    <span class="input-group-addon"><i class="zmdi zmdi-account"></i></span>
                    <div class="fg-line">
                        <input type="text" class="form-control" placeholder="Coreo electronico" name="email" value="">
                    </div>
                </div>

                <div class="clearfix"></div>

                <button class="btn btn-login btn-danger btn-float"><i class="zmdi zmdi-arrow-forward"></i></button>

            </form>
</body>
</html>
