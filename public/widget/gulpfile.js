var elixir = require('laravel-elixir');

elixir.config.assetsPath = './';

elixir(function(mix) {
    mix.styles([
        'style2.css',
    ], 'build/v1/styles2.min.css');

    mix.browserify([
        'app2/'
    ], 'build/v1/app.min.js');
});