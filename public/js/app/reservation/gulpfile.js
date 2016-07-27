
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
/* ------ app-bookersnap-reservation-js -------
Escanea los modulos / componentes que agregamos a la aplicacion y los comprime en un solo archivo
ejecutar esta tarea se ejecuta cada vez que actualizamos en los archivos de nuestro modulo / componente
*/
gulp.task('app-bookersnap-reservation-js', function () {
  gulp.src([
    '**/*.js',
    '../app.config.js',
    '!gulpfile.js'
    ])
  .pipe(concat('app.bookersnap.reservation.min.js'))
  .pipe(jsmin())
  .pipe(gulp.dest('../../dist.app/reservation'))
});

// Preprocesa nuestras librerias que necesitan nuestra aplicacion , ejemplo: cache,drag and drop,etc
gulp.task('app-library-reservation-js', function () {
  gulp.src([
    '../../../library/angular-chosen-1.4.0/bower_components/chosen/chosen.jquery.js',
    '../../../library/angular-chosen-1.4.0/dist/angular-chosen.min.js',
    '../../../library/ngImgCropFullExtended-master/compile/minified/ng-img-crop.js',
    '../../../library/textAngular-1.5.0/dist/textAngular.min.js',
    '../../../library/textAngular-1.5.0/dist/textAngular-rangy.min.js',
    '../../../library/textAngular-1.5.0/dist/textAngular-sanitize.min.js',
    '../../../library/ngEmoticons-master/dist/ng-emoticons.min.js',
    '../../../library/ng-file-upload-master/dist/ng-file-upload-shim.min.js',
    '../../../library/ng-file-upload-master/dist/ng-file-upload.min.js',
    '../../../library/input-mask/input-mask.min.js',
    '../../../library/global/functions.js',
    '!gulpfile.js'
    ])
  .pipe(concat('app.bookersnap.library.reservation.min.js'))
  .pipe(jsmin())
  .pipe(gulp.dest('../../dist.app/reservation'))
});

// Preprocesa archivos Stylus a CSS y recarga los cambios
gulp.task('stylus-app', function() {
    gulp.src('../../../css/app/reservation/*.styl')
        .pipe(stylus({
            use: nib()
        }))
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('../../../css/app/reservation'))
   
});

// Preprocesa nuestras librerias que necesitan nuestra aplicacion , ejemplo: cache,drag and drop,etc
gulp.task('app-library-reservation-css', function () {
  gulp.src([
    '../../../library/textAngular-1.5.0/bower_components/font-awesome/css/font-awesome.min.css',
    '../../../library/ngImgCropFullExtended-master/compile/minified/ng-img-crop.css',
    '../../../library/ngEmoticons-master/dist/ng-emoticons.min.css',
    '../../../library/textAngular-1.5.0/dist/textAngular.css',
    '../../../library/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
    '../../../library/bower_components/chosen/chosen.css',
    '!gulpfile.js'
    ])
  .pipe(minifyCss())
  .pipe(concat('app.bookersnap.library.reservation.min.css'))
  .pipe(gulp.dest('../../../css/app/reservation'));
});

//Automatizamos esta tarea
gulp.task('watch', function(){
    gulp.watch('**/*.js', ['app-bookersnap-reservation-js']);
    gulp.watch('../../../css/app/reservation/*.styl', ['stylus-app']);

});

//ejecutamos el servidor y todos los archivos
gulp.task('default', ['watch','app-bookersnap-reservation-js','stylus-app','app-library-reservation-js','app-library-reservation-css']);
