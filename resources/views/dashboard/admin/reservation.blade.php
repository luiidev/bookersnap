<!DOCTYPE html>
<html>
   <!--[if IE 9 ]><html class="ie9" data-ng-app="materialAdmin" data-ng-controller="materialadminCtrl as mactrl"><![endif]-->
    <![if IE 9 ]><html data-ng-app="materialAdmin" data-ng-controller="materialadminCtrl as mactrl"><![endif]>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bookersnap</title>

        <!-- Vendor CSS -->
        <link href="/css/theme/dist/vendor.min.css" rel="stylesheet">
        <!-- CSS -->
         <link href="/css/app/reservation/app.bookersnap.library.reservation.min.css" rel="stylesheet">
        <link href="/css/theme/dist/theme.min.css" rel="stylesheet" id="app-level">
         <!-- App Css -->

        <link href="/css/app/reservation/style-reservation.min.css" rel="stylesheet">

    </head>
    <body data-ng-class="{ 'sw-toggled': mactrl.layoutType === '1'}">

        <data ui-view></data>

        <!-- Vendor Bookersnap-->
        <script src="/js/theme/dist/library.bower.min.js"></script>
        <script src="/js/theme/dist/app.level.min.js"></script>
        <script src="/js/theme/dist/template.modules.min.js"></script>

        <!-- App Library Bookersnap (todos nuestras librerias para que funcione la app)-->
        <script type="text/javascript" src="/js/dist.app/reservation/app.bookersnap.library.reservation.min.js"></script>
         <script type="text/javascript" src="/js/dist.app/reservation/app.bookersnap.tables.services.min.js"></script>

        <!-- App Bookersnap (todos nuestros componentes comprimidos)-->
        <script type="text/javascript" src="/js/dist.app/reservation/app.bookersnap.reservation.min.js"></script>


    </body>
</html>
