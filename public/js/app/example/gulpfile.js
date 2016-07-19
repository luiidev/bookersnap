
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    //gulpif = require('gulp-if');
    jsmin = require('gulp-jsmin'),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch');


/* ------------- Tareas de aplicacion -------------*/
/* ------ app-bookersnap-example-js -------
Escanea los modulos / componentes que agregamos a la aplicacion y los comprime en un solo archivo
ejecutar esta tarea se ejecuta cada vez que actualizamos en los archivos de nuestro modulo / componente
*/
gulp.task('app-bookersnap-example-js', function () {
  gulp.src([
    '**/*.js',
    '!gulpfile.js'
    ])
  .pipe(concat('app.bookersnap.example.min.js'))
  .pipe(jsmin())
  .pipe(gulp.dest('../../dist.app'))
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
    gulp.watch('**/*.js', ['app-bookersnap-example-js']);
    gulp.watch('../../../css/*.styl', ['stylus-app']);

});

//ejecutamos el servidor y todos los archivos
gulp.task('default', ['watch','app-bookersnap-example-js','stylus-app']);