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
    <title data-ng-bind="($title || 'Home') + ' - Bookersnap'"></title>

    <!-- Vendor CSS -->
    <link href="{{env('BASEPATH_ENV_APP_CSS')}}/theme/css/vendor.min.css" rel="stylesheet">
    <!-- Library min CSS -->
    <link href="{{env('BASEPATH_ENV_APP_CSS')}}/tables/css/app.bookersnap.library.tables.min.css" rel="stylesheet">
    <!-- CSS -->
    <link href="{{env('BASEPATH_ENV_APP_CSS')}}/theme/css/theme.min.css" rel="stylesheet" id="app-level">
    <!-- App Css -->
    <link href="{{env('BASEPATH_ENV_APP_CSS')}}/tables/css/style-tables.min.css" rel="stylesheet">
    
</head>

<body data-ng-class="{ 'sw-toggled': mactrl.layoutType === '1'}" class="scroll-x-hidden">

<header data-current-skin="@{{mactrl.currentSkin}}" data-ng-controller="headerCtrl as hctrl" data-ng-include="'/template/header.html'" id="header">
</header>
<aside data-ng-class="{ 'toggled': mactrl.sidebarToggle.left === true }" data-ng-include="'/template/sidebar-left.html'" id="sidebar">
</aside>
<aside data-ng-class="{ 'toggled': mactrl.sidebarToggle.right === true }" data-ng-include="'/template/chat.html'" id="chat">
</aside>

<data ui-view></data>

<!--<footer data-ng-include="'/template/footer.html'" id="footer">
</footer>-->

<script type="text/javascript">
    var _TOKEN_SESSION = "{{ $token_session }}";
    var _PRIVILEGES = JSON.parse('{!! $acl !!}');
    var _MICROSITE_ID = parseInt("{{ $microsite_id }}");
</script>

<!-- Vendor Bookersnap-->
<script src="{{env('BASEPATH_ENV_APP_CSS')}}/theme/js/library.bower.min.js"></script>
<script src="{{env('BASEPATH_ENV_APP_CSS')}}/theme/js/app.level.min.js"></script>
<script src="{{env('BASEPATH_ENV_APP_CSS')}}/theme/js/template.modules.min.js"></script>


<script type="text/javascript" src="/library/socket.io/socket.io.js" > </script>

<!-- App Library Bookersnap (todos nuestras librerias para que funcione la app)-->
<script type="text/javascript" src="{{env('BASEPATH_ENV_APP_JS')}}/tables/js/app.bookersnap.library.tables.min.js"></script>

<!-- App Auth Bookersnap (modulo login)
{{ env('APP_ENV') }}
<script type="text/javascript" src="/js/dist.app/auth/app.bookersnap.auth.min.js"></script>
-->

<!-- App Bookersnap (todos nuestros componentes comprimidos)-->
<script type="text/javascript" src="{{env('BASEPATH_ENV_APP_JS')}}/tables/js/app.bookersnap.tables.min.js"></script>


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
