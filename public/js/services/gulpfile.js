var elixir = require('laravel-elixir');

elixir.config.assetsPath = './';
elixir.config.js.folder = './';
elixir.config.sourcemaps = false;

elixir(function(mix) {
    mix.scripts([
        'api_admin/**'
    ], 'build/api_admin.min.js')

    .scripts([
        'api_mesas/**'
    ], 'build/api_mesas.min.js');
});