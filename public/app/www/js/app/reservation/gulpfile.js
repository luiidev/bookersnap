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
gulp.task('app-bookersnap-reservation-js', function() {
    gulp.src([
            '**/*.js',
            '../app.config.js',
            '!gulpfile.js'
        ])
        .pipe(concat('app.bookersnap.reservation.min.js'))
        //.pipe(jsmin())
        .pipe(gulp.dest('../../dist.app/reservation'));
});

gulp.task('app-bookersnap-tables-js', function() {
    gulp.src([
            '../tables/zone/zone.service.js',
        ])
        .pipe(concat('app.bookersnap.tables.services.min.js'))
        .pipe(jsmin())
        .pipe(gulp.dest('../../dist.app/reservation'));
});

// Preprocesa nuestras librerias que necesitan nuestra aplicacion , ejemplo: cache,drag and drop,etc
gulp.task('app-library-reservation-js', function() {
    gulp.src([
            '../../../../../../public/library/bower_components/dragdrop/jquery-ui.min.js',
            '../../../../../../public/library/bower_components/dragdrop/angular-local-storage.min.js',
            '../../../../../../public/library/bower_components/dragdrop/sortable.js',
            '../../../../../../public/library/bower_components/dragdrop/angular.editInPlace.js',
            '../../../../../../public/library/bower_components/chosen/chosen.jquery.js',
            '../../../../../../public/library/bower_components/angular-chosen-localytics/chosen.js',
            '../../../../../../public/library/ngImgCropFullExtended-master/compile/minified/ng-img-crop.js',
            '../../../../../../public/library/textAngular-1.5.0/dist/textAngular.min.js',
            '../../../../../../public/library/textAngular-1.5.0/dist/textAngular-rangy.min.js',
            '../../../../../../public/library/textAngular-1.5.0/dist/textAngular-sanitize.min.js',
            '../../../../../../public/library/ngEmoticons-master/dist/ng-emoticons.min.js',
            '../../../../../../public/library/ng-file-upload-master/dist/ng-file-upload-shim.min.js',
            '../../../../../../public/library/ng-file-upload-master/dist/ng-file-upload.min.js',
            '../../../../../../public/library/bower_components/nouislider/jquery.nouislider.min.js',
            '../../../../../../public/library/bower_components/angular-farbtastic/angular-farbtastic.js',
            '../../../../../../public/library/bower_components/autosize/dist/autosize.min.js',
            '../../../../../../public/library/bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
            '../../../../../../public/library/html2canvas/html2canvas.js',
            '../../../../../../public/library/html2canvas/canvas2image.js',
            '../../../../../../public/library/global/functions.js',
            '!gulpfile.js'
        ])
        .pipe(concat('app.bookersnap.library.reservation.min.js'))
        //.pipe(jsmin())
        .pipe(gulp.dest('../../dist.app/reservation'));
});

// Preprocesa archivos Stylus a CSS y recarga los cambios
gulp.task('stylus-app', function() {
    gulp.src('../../../css/app/reservation/*.styl')
        .pipe(stylus({
            use: nib()
        }))
        .pipe(minifyCss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('../../../css/app/reservation'));

});

// Preprocesa nuestras librerias que necesitan nuestra aplicacion , ejemplo: cache,drag and drop,etc
gulp.task('app-library-reservation-css', function() {
    gulp.src([
            '../../../../../../public/library/textAngular-1.5.0/bower_components/font-awesome/css/font-awesome.min.css',
            '../../../../../../public/library/ngImgCropFullExtended-master/compile/minified/ng-img-crop.css',
            '../../../../../../public/library/ngEmoticons-master/dist/ng-emoticons.min.css',
            '../../../../../../public/library/textAngular-1.5.0/dist/textAngular.css',
            '../../../../../../public/library/bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
            '../../../../../../public/library/bower_components/chosen/chosen.css',
            '../../../../../../public/library/bower_components/nouislider/jquery.nouislider.css',
            '../../../../../../public/library/farbtastic/farbtastic.css',
            '../../../../../../public/fonts/lobster/stylesheet.css',
            '!gulpfile.js'
        ])
        .pipe(minifyCss())
        .pipe(concat('app.bookersnap.library.reservation.min.css'))
        .pipe(gulp.dest('../../../css/app/reservation'));
});

//Automatizamos esta tarea
gulp.task('watch', function() {
    gulp.watch('**/*.js', ['app-bookersnap-reservation-js']);
    gulp.watch('../../../css/app/reservation/*.styl', ['stylus-app']);
    gulp.watch('../../../../../../public/library/global/functions.js', ['app-library-reservation-js']);

});

//ejecutamos el servidor y todos los archivos
gulp.task('default', ['watch', 'app-bookersnap-reservation-js', 'stylus-app', 'app-library-reservation-js', 'app-library-reservation-css']);