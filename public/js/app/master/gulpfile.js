var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
//gulpif = require('gulp-if');
    jsmin = require('gulp-jsmin'),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename');


/* ------------- Tareas de aplicacion -------------*/
/* ------ app-bookersnap-js -------
 Escanea los modulos / componentes que agregamos a la aplicacion y los comprime en un solo archivo
 ejecutar esta tarea se ejecuta cada vez que actualizamos en los archivos de nuestro modulo / componente
 */
gulp.task('app-bookersnap-master-js', function () {
    gulp.src([
            '**/*.js',
            '../app.config.js',
            '!gulpfile.js'
        ])
        .pipe(concat('app.bookersnap.master.min.js'))
        .pipe(jsmin())
        .pipe(gulp.dest('../../dist.app/master'))
});

// Preprocesa nuestras librerias que necesitan nuestra aplicacion , ejemplo: cache,drag and drop,etc
gulp.task('app-library-master-js', function () {
    gulp.src([
            '../../../library/ngImgCropFullExtended-master/compile/minified/ng-img-crop.js',
            '../../../library/angular-loading-overlay/angular-loading-overlay.js',
            '../../../library/angucomplete-alt/angucomplete-alt.js',
            '../../../library/global/functions.js',
            '../../../library/global/form.directive.js',
            '../../../library/input-mask/input-mask.js',
            '../../../library/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
            '../../../library/bootstrap-daterangepicker/moment.js',
            '../../../library/bootstrap-daterangepicker/daterangepicker.js',
            '../../../library/angular-daterangepicker-master/js/angular-daterangepicker.min.js',
            '../../../library/ng-file-upload-master/dist/ng-file-upload-shim.min.js',
            '../../../library/ng-file-upload-master/dist/ng-file-upload.min.js',
            '../../../library/angularjs-google-maps/build/scripts/ng-map.min.js',
            '../../../library/angular-acl/angular-acl.js',
            '!gulpfile.js'
        ])
        .pipe(concat('app.bookersnap.library.master.min.js'))
        .pipe(jsmin())
        .pipe(gulp.dest('../../dist.app/master'))
});

// Preprocesa archivos Stylus a CSS y recarga los cambios
gulp.task('stylus-app', function () {
    gulp.src('../../../css/app/master/*.styl')
        .pipe(stylus({
            use: nib()
        }))
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('../../../css/app/master'))
});

// Preprocesa nuestras librerias que necesitan nuestra aplicacion , ejemplo: cache,drag and drop,etc
gulp.task('app-library-master-css', function () {
    gulp.src([
            '../../../library/textAngular-1.5.0/bower_components/font-awesome/css/font-awesome.min.css',
            '../../../library/ngImgCropFullExtended-master/compile/minified/ng-img-crop.css',
            '../../../library/angucomplete-alt/angucomplete-alt.css',
            '../../../library/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
            '../../../library/bootstrap-daterangepicker/daterangepicker.css',
        ])
        .pipe(minifyCss())
        .pipe(concat('app.bookersnap.library.master.min.css'))
        .pipe(gulp.dest('../../../css/app/master'));
});

//Automatizamos esta tarea
gulp.task('watch', function () {
    gulp.watch(['**/*.js', '../app.config.js'], ['app-bookersnap-master-js']);
    gulp.watch([
        '../../../library/ngImgCropFullExtended-master/compile/minified/ng-img-crop.js',
        '../../../library/angucomplete-alt/angucomplete-alt.js',
        '../../../library/global/functions.js',
        '../../../library/global/form.directive.js',
        '../../../library/input-mask/input-mask.js',
        '../../../library/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
        '../../../library/ng-file-upload-master/dist/ng-file-upload-shim.min.js',
        '../../../library/ng-file-upload-master/dist/ng-file-upload.min.js'
    ], ['app-library-master-js']);
    gulp.watch('../../../css/app/master/*.styl', ['stylus-app']);
    gulp.watch([
        '../../../library/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css'
    ], ['app-library-master-css']);
});

//ejecutamos el servidor y todos los archivos
//gulp.task('default', ['watch', 'app-bookersnap-master-js', 'stylus-app', 'app-library-master-js', 'app-library-master-css']);

//gulp.task('default', ['app-bookersnap-master-js', 'app-library-master-js']);
gulp.task('default', ['app-bookersnap-master-js']);