<!DOCTYPE html>
<html>
<head>
    <title>@yield("title", "Bookersnap")</title>
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
    <link rel="stylesheet" type="text/css" href="{{ asset('widget/css/style2.css') }}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="utf-8">
</head>
<body ng-app="App">
    <div class="content">
        @yield("content")	
    </div>

    <!-- Library Content  End-->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <script type="text/javascript" src="{{ asset('widget/library/angular/angular.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/library/angular-locale/angular-locale_es-mx.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/library/angular-bootstrap/ui-bootstrap-tpls.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/library/moment/min/moment.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/library/moment/locale/es.js') }}"></script>
    <!-- Library Content  End-->

    <script type="text/javascript">
        var microsite = {{ $microsite }};
    </script>

    <script type="text/javascript" src="{{ asset('widget/js/app2/app.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/controllers/availability.controller.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/services/availability.service.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/controllers/reservation.controller.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/filters/reservation.filter.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/directives/reservation.directive.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/controllers/error.controller.js') }}"></script>
    <script type="text/javascript" src="{{ asset('widget/js/app2/controllers/confirmed.controller.js') }}"></script>

    <script src="{{ asset('widget/js/functions.js') }}"></script>

</body>
</html>