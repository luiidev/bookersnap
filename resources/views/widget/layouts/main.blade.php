<!DOCTYPE html>
<html>
<head>
    <title>@yield("title", "BookerSnap")</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('widget/css/styles.css') }}">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
</head>
<body ng-app="App">

<div class="bs-container">
    <div class="row">
        <div class="col-xs-12 not-padding">
            @yield("content")
        </div>
    </div>
</div>

<!-- Library Content  End-->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script type="text/javascript" src="{{ asset('widget/library/angular/angular.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('widget/library/angular-locale/angular-locale_es-mx.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('widget/library/angular-bootstrap/ui-bootstrap-tpls.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('widget/library/moment/min/moment.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('widget/library/moment/locale/es.js') }}"></script>
<!-- Library Content  End-->

<script type="text/javascript" src="{{ asset('widget/js/app/app.js') }}"></script>
<script type="text/javascript" src="{{ asset('widget/js/app/controllers/availability.controller.js') }}"></script>
<script type="text/javascript" src="{{ asset('widget/js/app/services/availability.service.js') }}"></script>
<script type="text/javascript" src="{{ asset('widget/js/app/filters/availability.filter.js') }}"></script>

</body>
</html>