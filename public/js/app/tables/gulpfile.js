var gulp = require('gulp'),
        uglify = require('gulp-uglify'),
        stylus = require('gulp-stylus'),
        nib = require('nib'),
        //gulpif = require('gulp-if');
        jsmin = require('gulp-jsmin'),
        concat = require('gulp-concat'),
        minifyCss = require('gulp-minify-css'),
        rename = require('gulp-rename');

var env = "dev"; // [dev || dist]
//var distributionApp = '../../../assets/js/app/'+env+'/tables';
//var distributionStyleApp = '../../../assets/css/app/'+env+'/tables';

var distributionApp = '../../../app/tables/js';
var distributionStyleApp = '../../../app/tables/css';

/* ------------- Tareas de aplicacion -------------*/
//Escanea los modulos / componentes que agregamos a la aplicacion y los comprime en un solo archivo
//ejecutar esta tarea se ejecuta cada vez que actualizamos en los archivos de nuestro modulo / componente
var filesApp = [
    '**/*.js',
    '../app.config.js',
    '../app.directive.js',
    '../app.service.js',
    //'../constant.local.js',
    '!gulpfile.js'
];
var filenameApp = 'app.bookersnap.tables.min.js';

gulp.task('app-bookersnap-tables-js', function () {
    gulp.src(filesApp)
            .pipe(concat(filenameApp))
            //.pipe(jsmin()) solo cuando pasamos a produccion
            .pipe(gulp.dest(distributionApp));
});

//Modulo de login
//gulp.task('app-bookersnap-auth-js', function() {
//    gulp.src([
//            '../auth/*.js',
//        ])
//        .pipe(concat('app.bookersnap.auth.min.js'))
//        //.pipe(jsmin()) solo cuando pasamos a produccion
//        .pipe(gulp.dest('../../dist.app/auth'));
//});

// Preprocesa nuestras librerias que necesitan nuestra aplicacion , ejemplo: cache,drag and drop,etc
var filesLibrary = [
    //'../../../library/angular-loading-overlay/angular-loading-overlay.js',
    '../../../library/ngDraggable/ngDraggable.js',
    '../../../library/global/functions.js',
    '../../../library/global/form.directive.js',
    '../../../library/input-mask/input-mask.js',
    '../../../library/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
    '../../../library/bower_components/chosen/chosen.jquery.js',
    '../../../library/bower_components/angular-chosen-localytics/chosen.js',
    '../../../library/bower_components/jquery-ui/jquery-ui.js',
    '../../../library/bower_components/jqueryui-touch-punch/jquery.ui.touch-punch.min.js',
    '../../../library/bower_components/kjur-jsrsasign/jsrsasign-latest-all-min.js',
    //'../../../library/sparklines/jquery.sparkline.min.js',
    // '../../../library/bower_components/jquery.easy-pie-chart/dist/jquery.easypiechart.min.js',
    //'../../../library/bower_components/simpleWeather/jquery.simpleWeather.min.js',
    '!gulpfile.js'
];
var nameLibrary = 'app.bookersnap.library.tables.min.js';
gulp.task('app-library-tables-js', function () {
    gulp.src(filesLibrary)
            .pipe(concat(nameLibrary))
            //.pipe(jsmin())
            .pipe(gulp.dest(distributionApp));
});


// Preprocesa archivos Stylus a CSS y recarga los cambios
var stylesApp = [
    '../../../css/app/tables/*.styl'
];
//var stylenameApp = "style-tables.min.css";
gulp.task('stylus-app', function () {
    gulp.src(stylesApp)
            .pipe(stylus({
                use: nib()
            }))
            .pipe(minifyCss())
            .pipe(rename({
                suffix: '.min'
            }))
            .pipe(gulp.dest(distributionStyleApp));
});

// Preprocesa nuestras librerias que necesitan nuestra aplicacion , ejemplo: cache,drag and drop,etc
var stylesLibrariesApp = [
    '../../../library/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
    '../../../library/bower_components/chosen/chosen.css',
    '../../../library/bower_components/fullcalendar/dist/fullcalendar.css'
];

var stylenameLibrariesApp = "app.bookersnap.library.tables.min.css";

gulp.task('app-library-tables-css', function () {
    gulp.src(stylesLibrariesApp)
            .pipe(minifyCss())
            .pipe(concat(stylenameLibrariesApp))
            .pipe(gulp.dest(distributionStyleApp));
});

//Automatizamos esta tarea
gulp.task('watch', function () {
    gulp.watch(['**/*.js', '../app.config.js', '../app.directive.js', '../app.service.js'], ['app-bookersnap-tables-js']);
    gulp.watch(['../../../library/global/functions.js', '../../../library/ngDraggable/ngDraggable.js'], ['app-library-tables-js']);
    gulp.watch('../../../css/app/tables/*.styl', ['stylus-app']);
    //gulp.watch('../auth/*.js', ['app-bookersnap-auth-js']);
    gulp.watch([
        '../../../library/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
        '../../../library/bower_components/chosen/chosen.css',
        '../../../library/bower_components/fullcalendar/dist/fullcalendar.css'
    ], ['app-library-tables-css']);
});

//ejecutamos el servidor y todos los archivos
gulp.task('default', ['watch', 'app-bookersnap-tables-js', 'stylus-app', 'app-library-tables-js', 'app-library-tables-css']);