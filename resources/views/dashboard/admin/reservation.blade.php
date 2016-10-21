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

        <!-- Older IE warning message -->
        <!--[if lt IE 9]>
            <div class="ie-warning">
                <h1 class="c-white">Warning!!</h1>
                <p>You are using an outdated version of Internet Explorer, please upgrade <br/>to any of the following web browsers to access this website.</p>
                <div class="iew-container">
                    <ul class="iew-download">
                        <li>
                            <a href="http://www.google.com/chrome/">
                                <img src="img/browsers/chrome.png" alt="">
                                <div>Chrome</div>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.mozilla.org/en-US/firefox/new/">
                                <img src="img/browsers/firefox.png" alt="">
                                <div>Firefox</div>
                            </a>
                        </li>
                        <li>
                            <a href="http://www.opera.com">
                                <img src="img/browsers/opera.png" alt="">
                                <div>Opera</div>
                            </a>
                        </li>
                        <li>
                            <a href="https://www.apple.com/safari/">
                                <img src="img/browsers/safari.png" alt="">
                                <div>Safari</div>
                            </a>
                        </li>
                        <li>
                            <a href="http://windows.microsoft.com/en-us/internet-explorer/download-ie">
                                <img src="img/browsers/ie.png" alt="">
                                <div>IE (New)</div>
                            </a>
                        </li>
                    </ul>
                </div>
                <p>Sorry for the inconvenience!</p>
            </div>
        <![endif]-->

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
