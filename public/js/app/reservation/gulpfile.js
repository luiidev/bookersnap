
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
    '../../../library/ngImgCropFullExtended-master/compile/minified/ng-img-crop.js',
    '!gulpfile.js'
    ])
  .pipe(concat('app.bookersnap.library.reservation.min.js'))
  .pipe(jsmin())
  .pipe(gulp.dest('../../dist.app/reservation'))
});

// Preprocesa archivos Stylus a CSS y recarga los cambios
gulp.task('stylus-app', function() {
    gulp.src('../../../css/*.styl')
        .pipe(stylus({
            use: nib()
        }))
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('../../../css'))
   
});

//Automatizamos esta tarea
gulp.task('watch', function(){
    gulp.watch('**/*.js', ['app-bookersnap-reservation-js']);
    gulp.watch('../../../css/*.styl', ['stylus-app']);

});

//ejecutamos el servidor y todos los archivos
gulp.task('default', ['watch','app-bookersnap-reservation-js','stylus-app','app-library-reservation-js']);
