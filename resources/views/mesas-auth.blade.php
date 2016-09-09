<!DOCTYPE html>
<html>
<!--[if IE 9 ]>
<html class="ie9" data-ng-app="materialAdmin" data-ng-controller="materialadminCtrl as mactrl"><![endif]-->
<![if IE 9 ]>
<html data-ng-app="materialAdmin" data-ng-controller="materialadminCtrl as mactrl"><![endif]>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bookersnap</title>

    <!-- Vendor CSS -->
    <link href="/css/theme/dist/vendor.min.css" rel="stylesheet">
    <!-- Library min CSS -->
    <link href="/css/app/tables/app.bookersnap.library.tables.min.css" rel="stylesheet">
    <!-- CSS -->
    <link href="/css/theme/dist/theme.min.css" rel="stylesheet" id="app-level">
    <!-- App Css -->
    <link href="/css/app/tables/style-tables.min.css" rel="stylesheet">

</head>
<body data-ng-class="{ 'sw-toggled': mactrl.layoutType === '1'}">

<data ui-view></data>

<!-- Vendor Bookersnap-->
<script src="/js/theme/dist/library.bower.min.js"></script>
<script src="/js/theme/dist/app.level.min.js"></script>
<script src="/js/theme/dist/template.modules.min.js"></script>

<!-- App Library Bookersnap (todos nuestras librerias para que funcione la app)-->
<script type="text/javascript" src="/js/dist.app/tables/app.bookersnap.library.tables.min.js"></script>
<!-- App Bookersnap (todos nuestros componentes comprimidos)-->
<script type="text/javascript" src="/js/dist.app/tables/app.bookersnap.tables.min.js"></script>


<script>
//    angular.module('auth.app').service('PrivilegeService', function () {
//        var svc = this;
//        svc.info = JSON.parse('{!! $acl !!}');
//        svc.GetRole = function () {
//            return svc.info.role;
//        };
//        svc.GetAcl = function () {
//            return svc.info.acl;
//        }
//    });

    var setAuthHeaders = function ($http) {

//        var headers = {
//            'X-CSRF-TOKEN': '{{ csrf_token()}}',
//            "type-admin": 1123
//        };
//        $.ajaxSetup({headers: headers});

        $http.defaults.headers.common['ms-mp-id'] = '{{$ms_id}}';
        $http.defaults.headers.common['type-admin'] = 2;
        $http.defaults.headers.common['Authorization'] = 'Bearer {{$apitoken}}';
        
//        console.log($http.defaults.headers.common['ms-mp-id']);
//        console.log($http.defaults.headers.common['type-admin']);
//        console.log($http.defaults.headers.common['Authorization']);
    }

</script>

<script type="text/ng-template" id="overlay-template.html">
    <div style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.7);z-index: 10;">
        <div id="floatingCirclesG">
            <div class="preloader pl-xl">
                <svg class="pl-circular" viewBox="25 25 50 50">
                    <circle class="plc-path" cx="50" cy="50" r="20"></circle>
                </svg>
            </div>
        </div>
    </div>
</script>
</body>
</html>
