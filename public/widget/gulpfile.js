var elixir = require('laravel-elixir');

elixir.config.assetsPath = './';
elixir.config.sourcemaps = false;

elixir(function(mix) {
    mix.styles([
        "library/jquery-ui-1.12.1/jquery-ui.min.css",
        'css/style2.css'
    ], 'build/v2/css/styles2.min.css', './')

    .scripts([
        'app2/**',
        // "app2/app.js",
        // "app2/controllers/availability.controller.js"
        'functions.js'
    ], 'build/v2/js/app.min.js')

    .scripts([
        "library/jquery/jquery-1.12.4.min.js",
        "library/jquery-ui-1.12.1/jquery-ui.min.js",
        "library/angular/angular.min.js",
        "library/angular-locale/angular-locale_es-mx.min.js",
        "library/angular-bootstrap/ui-bootstrap-tpls.min.js",
        "library/moment/min/moment.min.js",
        "library/moment/locale/es.js"
    ], 'build/library.min.js', 'library');
});