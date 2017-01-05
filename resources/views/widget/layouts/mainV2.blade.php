<!DOCTYPE html>
<html>
<head>
    <title>@yield("title", "Bookersnap")</title>
    <link rel="stylesheet" type="text/css" href="{{ asset('widget/build/v2/css/styles2.min.css') }}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="utf-8">
</head>
<body ng-app="App">
    <div class="content">
        @yield("content")	
    </div>

    <!-- Library Content  End-->
    <script type="text/javascript" src="{{ asset('widget/build/library.min.js') }}"></script>
    <!-- Library Content  End-->

    <script type="text/javascript" src="{{ asset('widget/build/v2/js/app.min.js') }}"></script>

    <script type="text/javascript">
        var microsite = {{ $microsite }};
    </script>

</body>
</html>